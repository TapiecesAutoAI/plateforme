import type {
  DiagnosticWorkflow,
} from "../../core/workflowTypes";

import {
  startingActions,
} from "./actions";

export const startingWorkflow:
  DiagnosticWorkflow = {
    id:
      "starting",

    title:
      "Diagnostic de démarrage",

    description:
      "Parcours dédié aux véhicules qui ne démarrent pas ou dont le démarreur ne fonctionne pas normalement.",

    entryNodeId:
      "starting-entry",

    actions:
      startingActions,

    nodes: [
      {
        id:
          "starting-entry",

        type:
          "action",

        actionId:
          "starting-main-behaviour",

        transitions: [
          {
            id:
              "entry-to-dynamic",

            targetNodeId:
              "starting-dynamic",

            priority:
              1,
          },
        ],
      },

      {
        id:
          "starting-dynamic",

        type:
          "decision",

        transitions: [
          {
            id:
              "dynamic-to-conclusion",

            targetNodeId:
              "starting-conclusion",

            priority:
              100,
          },
        ],
      },

      {
        id:
          "starting-conclusion",

        type:
          "diagnosis",

        diagnosisId:
          "starting-diagnosis",

        transitions: [
          {
            id:
              "conclusion-to-end",

            targetNodeId:
              "starting-end",

            priority:
              1,
          },
        ],
      },

      {
        id:
          "starting-end",

        type:
          "end",

        transitions:
          [],
      },
    ],
  };
