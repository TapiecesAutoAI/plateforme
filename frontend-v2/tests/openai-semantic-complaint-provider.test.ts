import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks =
  vi.hoisted(() => ({
    parse:
      vi.fn(),
  }));

vi.mock(
  "openai",
  () => ({
    OpenAI:
      class {
        public responses = {
          parse:
            mocks.parse,
        };
      },
  }),
);

import {
  canonicalEvidenceDefinitions,
} from "../engine/evidence/CanonicalEvidenceRegistry";

import {
  OpenAISemanticComplaintProvider,
} from "../lib/ai/OpenAISemanticComplaintProvider";

describe(
  "OpenAISemanticComplaintProvider",
  () => {

    beforeEach(() => {
      mocks.parse.mockReset();
    });

    it(
      "keeps canonical evidence returned by the linguistic AI",
      async () => {

        const canonicalId =
          canonicalEvidenceDefinitions[0]?.id;

        expect(canonicalId).toBeTruthy();

        mocks.parse.mockResolvedValue({
          output_parsed: {
            evidences: [
              {
                id:
                  canonicalId,
                confidence:
                  0.96,
                support:
                  "normalized",
              },
            ],
          },
        });

        const provider =
          new OpenAISemanticComplaintProvider({
            model:
              "test-model",
          });

        const result =
          await provider.interpretComplaint({
            originalText:
              "la voiture ne demarre pas",
          });

        expect(result.evidences).toEqual([
          {
            id:
              canonicalId,
            confidence:
              0.96,
            support:
              "normalized",
          },
        ]);

        expect(
          mocks.parse,
        ).toHaveBeenCalledTimes(1);
      },
    );

    it(
      "rejects an evidence id invented by the linguistic AI",
      async () => {

        mocks.parse.mockResolvedValue({
          output_parsed: {
            evidences: [
              {
                id:
                  "invented-evidence-id",
                confidence:
                  0.99,
                support:
                  "explicit",
              },
            ],
          },
        });

        const provider =
          new OpenAISemanticComplaintProvider({
            model:
              "test-model",
          });

        const result =
          await provider.interpretComplaint({
            originalText:
              "elle fait un bruit bizarre",
          });

        expect(
          result.evidences,
        ).toEqual([]);
      },
    );

    it(
      "returns no evidence when the model returns no parsed structure",
      async () => {

        mocks.parse.mockResolvedValue({
          output_parsed:
            null,
        });

        const provider =
          new OpenAISemanticComplaintProvider({
            model:
              "test-model",
          });

        const result =
          await provider.interpretComplaint({
            originalText:
              "je ne sais pas ce qu'elle a",
          });

        expect(
          result.evidences,
        ).toEqual([]);
      },
    );

  },
);