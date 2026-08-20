import fs from "node:fs";
import path from "node:path";

import type {
  DiagnosticAction,
} from "../core/actionTypes";

import type {
  KnowledgeEvidence,
  KnowledgeHypothesis,
  KnowledgePackage,
  KnowledgePart,
  KnowledgeRule,
  KnowledgeWorkflow,
} from "./knowledgeTypes";

export type KnowledgeDomain =
  | "starting"
  | "battery"
  | "charging"
  | "engine"
  | "cooling"
  | "braking"
  | "steering"
  | "suspension"
  | "transmission"
  | "noise";

function readJsonFile<T>(
  filePath: string,
  fallback: T,
): T {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }

  const content =
    fs.readFileSync(
      filePath,
      "utf8",
    ).trim();

  if (!content) {
    return fallback;
  }

  return JSON.parse(content) as T;
}

export class KnowledgeLoader {
  private readonly knowledgeRoot: string;

  constructor(
    knowledgeRoot = path.join(
      process.cwd(),
      "knowledge",
    ),
  ) {
    this.knowledgeRoot =
      knowledgeRoot;
  }

  public loadDomain(
    domain: KnowledgeDomain,
  ): KnowledgePackage {
    const domainPath =
      path.join(
        this.knowledgeRoot,
        domain,
      );

    return {
      domain,

      actions:
        readJsonFile<DiagnosticAction[]>(
          path.join(
            domainPath,
            "actions.json",
          ),
          [],
        ),

      evidences:
        readJsonFile<KnowledgeEvidence[]>(
          path.join(
            domainPath,
            "evidences.json",
          ),
          [],
        ),

      hypotheses:
        readJsonFile<KnowledgeHypothesis[]>(
          path.join(
            domainPath,
            "hypotheses.json",
          ),
          [],
        ),

      rules:
        readJsonFile<KnowledgeRule[]>(
          path.join(
            domainPath,
            "rules.json",
          ),
          [],
        ),

      parts:
        readJsonFile<KnowledgePart[]>(
          path.join(
            domainPath,
            "parts.json",
          ),
          [],
        ),

      workflow:
        readJsonFile<KnowledgeWorkflow>(
          path.join(
            domainPath,
            "workflow.json",
          ),
          {
            id: domain,
            title: domain,
            entryActionId: "",
            locked: false,
          },
        ),
    };
  }
}
