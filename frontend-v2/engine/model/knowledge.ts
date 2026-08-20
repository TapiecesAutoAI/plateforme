import type { KnowledgeDomain } from "../knowledge/KnowledgeLoader";

export interface KnowledgePack {

  id: string;

  version: string;

  domain: KnowledgeDomain;

}