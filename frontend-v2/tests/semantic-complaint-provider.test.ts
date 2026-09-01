import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DisabledSemanticComplaintProvider,
} from "../lib/ai/SemanticComplaintProvider";

import type {
  SemanticComplaintProvider,
  SemanticComplaintProviderEvidence,
  SemanticComplaintProviderRequest,
} from "../lib/ai/SemanticComplaintProvider";

describe(
  "SemanticComplaintProvider",
  () => {

    it(
      "exposes a provider contract independent from any vendor",
      async () => {

        const provider:
          SemanticComplaintProvider =
            new DisabledSemanticComplaintProvider();

        const request:
          SemanticComplaintProviderRequest = {
            originalText:
              "marş basmıyor, j'entends bir click",
          };

        const result =
          await provider.interpretComplaint(
            request,
          );

        expect(
          result,
        ).toEqual({
          evidences: [],
        });
      },
    );

    it(
      "disabled provider never invents evidence",
      async () => {

        const provider =
          new DisabledSemanticComplaintProvider();

        const result =
          await provider.interpretComplaint({
            originalText:
              "texte totalement inconnu",
          });

        expect(
          result.evidences,
        ).toEqual([]);
      },
    );

    it(
      "keeps original client text as provider input",
      async () => {

        class RecordingProvider
          implements SemanticComplaintProvider {

          public received:
            SemanticComplaintProviderRequest | null =
              null;

          public async interpretComplaint(
            request:
              SemanticComplaintProviderRequest,
          ): Promise<unknown> {

            this.received =
              request;

            return {
              evidences: [],
            };
          }
        }

        const provider =
          new RecordingProvider();

        const originalText =
          "marş basmıyor, j'entends bir clik";

        await provider.interpretComplaint({
          originalText,
        });

        expect(
          provider.received?.originalText,
        ).toBe(
          originalText,
        );
      },
    );

    it(
      "does not expose diagnosis or commerce fields in disabled response",
      async () => {

        const provider =
          new DisabledSemanticComplaintProvider();

        const result =
          await provider.interpretComplaint({
            originalText:
              "un seul clic",
          });

        expect(
          result,
        ).not.toHaveProperty(
          "diagnosis",
        );

        expect(
          result,
        ).not.toHaveProperty(
          "part",
        );

        expect(
          result,
        ).not.toHaveProperty(
          "price",
        );

        expect(
          result,
        ).not.toHaveProperty(
          "order",
        );
      },
    );

  },
);
describe(
  "SemanticComplaintProvider evidence contract",
  () => {

    it(
      "requires provenance support on provider evidence",
      () => {

        const evidence:
          SemanticComplaintProviderEvidence = {
            id:
              "symptom-single-click",

            confidence:
              0.96,

            support:
              "explicit",
          };

        expect(
          evidence,
        ).toEqual({
          id:
            "symptom-single-click",

          confidence:
            0.96,

          support:
            "explicit",
        });
      },
    );

  },
);