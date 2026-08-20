import type {
  DiagnosticState,
  WorkflowId,
  WorkflowResult,
} from "./types";

import {
  runStartingWorkflow,
} from "./workflows/startingWorkflow";

export type WorkflowRunnerInput = {
  state: DiagnosticState;

  message: string;
};

function normalizeText(
  value: string,
): string {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .replace(
      /[^\p{L}\p{N}\s]/gu,
      " ",
    )
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}

function detectWorkflowFromMessage(
  message: string,
): WorkflowId {
  const text =
    normalizeText(
      message,
    );

  if (
    /\b(?:ne demarre pas|ne demarre plus|impossible de demarrer|rien ne se passe au demarrage|clic au demarrage|demarreur)\b/.test(
      text,
    )
  ) {
    return "starting";
  }

  if (
    /\b(?:batterie se vide|batterie se decharge|batterie a plat|batterie vide le matin|decharge a l arret)\b/.test(
      text,
    )
  ) {
    return "battery";
  }

  if (
    /\b(?:voyant batterie|alternateur|defaut de charge|batterie se vide en roulant)\b/.test(
      text,
    )
  ) {
    return "charging";
  }

  if (
    /\b(?:moteur chauffe|surchauffe|temperature moteur|liquide de refroidissement)\b/.test(
      text,
    )
  ) {
    return "cooling";
  }

  if (
    /\b(?:frein|freinage|plaquette|disque de frein)\b/.test(
      text,
    )
  ) {
    return "braking";
  }

  if (
    /\b(?:direction|volant dur|volant tire)\b/.test(
      text,
    )
  ) {
    return "steering";
  }

  if (
    /\b(?:suspension|amortisseur|ressort)\b/.test(
      text,
    )
  ) {
    return "suspension";
  }

  if (
    /\b(?:boite de vitesse|embrayage|transmission|cardan)\b/.test(
      text,
    )
  ) {
    return "transmission";
  }

  if (
    /\b(?:bruit|claquement|grincement|grondement|sifflement|couinement)\b/.test(
      text,
    )
  ) {
    return "noise";
  }

  if (
    /\b(?:moteur|rate moteur|perte de puissance|cale)\b/.test(
      text,
    )
  ) {
    return "engine";
  }

  return "general";
}

function resolveWorkflow(
  state: DiagnosticState,
  message: string,
): WorkflowId {
  if (
    state.workflow.locked &&
    state.workflow.workflow !==
      "general"
  ) {
    return state.workflow.workflow;
  }

  return detectWorkflowFromMessage(
    message,
  );
}

function runUnavailableWorkflow(
  workflowId: WorkflowId,
): WorkflowResult {
  return {
    nextQuestionId:
      null,

    diagnosisId:
      null,

    completed:
      false,
  };
}

export function runWorkflow(
  input:
    WorkflowRunnerInput,
): WorkflowResult {
  const {
    state,
    message,
  } = input;

  const workflowId =
    resolveWorkflow(
      state,
      message,
    );

  state.workflow.workflow =
    workflowId;

  state.workflow.locked =
    workflowId !==
    "general";

  switch (
    workflowId
  ) {
    case "starting":
      return runStartingWorkflow(
        state,
      );

    default:
      return runUnavailableWorkflow(
        workflowId,
      );
  }
}

export function getDetectedWorkflow(
  message: string,
): WorkflowId {
  return detectWorkflowFromMessage(
    message,
  );
}
