import type {
  DiagnosticState,
  UserProfile,
  WorkflowId,
} from "./types";

import {
  runWorkflow,
} from "./workflowRunner";

import {
  getQuestionForProfile,
  type DiagnosticQuestionV2,
} from "./questionRegistry";

export interface ChatRequest {
  message: string;

  profile: UserProfile;
}

export interface ChatResponse {
  reply: string;

  workflow: WorkflowId;

  finished: boolean;

  question:
    DiagnosticQuestionV2 | null;

  diagnosisId?: string;
}

export class ChatEngineV2 {
  private state:
    DiagnosticState;

  constructor(
    profile: UserProfile,
  ) {
    this.state = {
      vehicle: {},

      profile,

      workflow: {
        workflow:
          "general",

        locked:
          false,

        completed:
          false,

        currentNode:
          "root",
      },

      evidences: [],

      askedQuestions: [],
    };
  }

  public process(
    request: ChatRequest,
  ): ChatResponse {
    this.state.profile =
      request.profile;

    const result =
      runWorkflow({
        state:
          this.state,

        message:
          request.message,
      });

    const question =
      result.nextQuestionId
        ? getQuestionForProfile(
            result.nextQuestionId,
            this.state.profile,
          )
        : null;

    if (
      question &&
      !this.state.askedQuestions.includes(
        question.id,
      )
    ) {
      this.state.askedQuestions.push(
        question.id,
      );
    }

    this.state.workflow.completed =
      result.completed;

    return {
      reply:
        this.buildReply(
          question,
          result.diagnosisId,
          result.completed,
        ),

      workflow:
        this.state.workflow.workflow,

      finished:
        result.completed,

      question,

      diagnosisId:
        result.diagnosisId ??
        undefined,
    };
  }

  public getState():
    DiagnosticState {
    return {
      vehicle: {
        ...this.state.vehicle,
      },

      profile:
        this.state.profile,

      workflow: {
        ...this.state.workflow,
      },

      evidences:
        this.state.evidences.map(
          (evidence) => ({
            ...evidence,
          }),
        ),

      askedQuestions: [
        ...this.state.askedQuestions,
      ],
    };
  }

  private buildReply(
    question:
      DiagnosticQuestionV2 | null,
    diagnosisId:
      string | null,
    completed:
      boolean,
  ): string {
    if (
      completed &&
      diagnosisId
    ) {
      return (
        `Diagnostic terminé : ${diagnosisId}`
      );
    }

    if (
      question
    ) {
      return question.text;
    }

    if (
      this.state.workflow.workflow !==
      "general"
    ) {
      return (
        "Aucune autre question adaptée à votre profil n’est disponible dans ce parcours."
      );
    }

    return (
      "Décrivez plus précisément le problème rencontré avec le véhicule."
    );
  }
}
