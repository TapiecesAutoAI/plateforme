import { beforeEach, describe, expect, it, vi } from 'vitest';
const db=vi.hoisted(()=>({locked:false,expired:false,presence:null as null|{status:string;reason:string;since:string},tickets:[] as {storeId:string;sellerId:string;status:string}[],writes:0}));
vi.mock('@upstash/redis',()=>({Redis:class {
 async set(){if(db.locked)return null;db.locked=true;return 'OK'}
 async get(key:string){if(key.startsWith('tpa:counter-presence:'))return db.presence;if(key.startsWith('tpa:counter-ticket:'))return db.tickets[Number(key.split(':').pop())];return null}
 async smembers(){return db.tickets.map((_,i)=>String(i))}
 async eval(script:string,_keys:string[],args:string[]){if(script.includes('DEL')){db.locked=false;return 1}if(db.expired)return 0;db.writes++;db.presence=JSON.parse(args[1]);return 1}
}}));
import { changeCounterPresence, saveCounterTicketLocked } from '../lib/counter/CounterTicketStore';
beforeEach(()=>{vi.stubEnv('UPSTASH_REDIS_REST_URL','https://test.invalid');vi.stubEnv('UPSTASH_REDIS_REST_TOKEN','test');db.locked=false;db.expired=false;db.presence=null;db.tickets=[];db.writes=0});
describe('Actual presence store checks under assignment lock',()=>{
 it.each(['called','in-service'])('refuses pause and releases lock for %s',async(status)=>{db.tickets=[{storeId:'org',sellerId:'seller',status}];await expect(changeCounterPresence('org','seller','pause')).rejects.toThrow('ACTIVE_TICKET_BLOCKS_PRESENCE');expect(db.writes).toBe(0);expect(db.locked).toBe(false)});
 it('does not invent a minimum counter staffing rule',async()=>{await expect(changeCounterPresence('org','seller','mission',' Inventaire ')).resolves.toMatchObject({status:'mission',reason:'Inventaire'});expect(db.locked).toBe(false)});
 it('does not allow stale sessions to re-enable an offline seller',async()=>{db.presence={status:'offline',reason:'',since:'now'};await expect(changeCounterPresence('org','seller','available')).rejects.toThrow('LOGIN_REQUIRED');expect(db.writes).toBe(0);await expect(changeCounterPresence('org','seller','available','',true)).resolves.toMatchObject({status:'available'})});
 it('fails closed if the assignment lease expires',async()=>{db.expired=true;await expect(changeCounterPresence('org','seller','pause')).rejects.toThrow('COUNTER_LOCK_EXPIRED');expect(db.locked).toBe(false);expect(db.writes).toBe(0)});
 it('cannot overwrite a ticket after losing the lock',async()=>{db.expired=true;await expect(saveCounterTicketLocked('org','expired', {id:'ticket'} as never)).rejects.toThrow('COUNTER_LOCK_EXPIRED');expect(db.writes).toBe(0)});
 it('refuses concurrent changes while another assignment holds the lock',async()=>{db.locked=true;await expect(changeCounterPresence('org','seller','pause')).rejects.toThrow('COUNTER_BUSY_RETRY');expect(db.writes).toBe(0)});
});
