import {
    Profiles,
    type UserProfile,
} from "../profiles";

export type CandidateQuestion={

    id:string;

    label:string;

    informationGain:number;

    difficulty:number;

    requiresMeasurement:boolean;

};

export class QuestionSelectorV3{

    public select(

        profile:UserProfile,

        questions:CandidateQuestion[],

    ):CandidateQuestion|null{

        if(
            questions.length===0
        ){
            return null;
        }

        const settings=
            Profiles[profile];

        return [...questions]

        .filter(q=>{

            if(
                q.requiresMeasurement &&
                !settings.allowMeasurements
            ){
                return false;
            }

            if(
                q.difficulty>
                settings.technicalLevel
            ){
                return false;
            }

            return true;

        })

        .sort(

            (a,b)=>{

                if(
                    b.informationGain!==a.informationGain
                ){

                    return b.informationGain-a.informationGain;

                }

                return a.difficulty-b.difficulty;

            }

        )[0] ?? null;

    }

}
