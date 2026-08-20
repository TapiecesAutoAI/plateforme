import type {
  ConversationState,
  Question,
} from "../types";

import type {
  ChiefComplaint,
} from "../chiefComplaint";

import {
  startingWorkflow,
  getWorkflowNode,
} from "./startingWorkflow";

import {
  convertKnowledgeQuestion,
  findQuestionById,
} from "../workflowAdapters";

export interface WorkflowResult {
  workflowId: string;

  nextQuestion: Question | null;

  completed: boolean;
}

export function runWorkflow(
  complaint: ChiefComplaint,
  state: ConversationState,
): WorkflowResult {

  switch (
    complaint.category
  ) {

    case "no-start":

    case "starter":

    case "slow-cranking":

      return runStartingWorkflow(
        state,
      );

    default:

      return {
        workflowId:
          "general",

        nextQuestion:
          null,

        completed:
          false,
      };
  }

}

function runStartingWorkflow(
  state: ConversationState,
): WorkflowResult {

  for (
    const node
    of startingWorkflow.nodes
  ) {

    if (
      node.type !==
      "question"
    ) {
      continue;
    }

    if (
      state.askedQuestions.includes(
        node.questionId!,
      )
    ) {
      continue;
    }

    const question =
      findQuestionById(
        node.questionId!,
      );

    if (
      !question
    ) {
      continue;
    }

    return {

      workflowId:
        "starting",

      nextQuestion:
        convertKnowledgeQuestion(
          question,
        ),

      completed:
        false,

    };

  }

  return {

    workflowId:
      "starting",

    nextQuestion:
      null,

    completed:
      true,

  };

}