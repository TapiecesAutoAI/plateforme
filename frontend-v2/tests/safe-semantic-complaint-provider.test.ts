import {
  describe,
  expect,
  it,
} from "vitest";

import {
  SafeSemanticComplaintProvider,
} from "../lib/ai/SafeSemanticComplaintProvider";

import type {
  SemanticComplaintProvider,
  SemanticComplaintProviderRequest,
} from "../lib/ai/SemanticComplaintProvider";

describe(
  "SafeSemanticComplaintProvider",
  () => {

    it(
      "returns provider response when provider succeeds",
      async () => {

        class WorkingProvider
          implements SemanticComplaintProvider {

          public async interpretComplaint(
            _request:
              SemanticComplaintProviderRequest,
          ): Promise<unknown> {

            return {
              evidences: [
                {
                  id:
                    "symptom-single-click",

                  confidence:
                    0.95,
                },
              ],
            };
          }
        }

        const provider =
          new SafeSemanticComplaintProvider(
            new WorkingProvider(),
            {
              timeoutMs:
                100,
            },
          );

        const result =
          await provider.interpretComplaint({
            originalText:
              "un seul clic",
          });

        expect(
          result,
        ).toEqual({
          evidences: [
            {
              id:
                "symptom-single-click",

              confidence:
                0.95,
            },
          ],
        });
      },
    );

    it(
      "fails closed when provider throws",
      async () => {

        class BrokenProvider
          implements SemanticComplaintProvider {

          public async interpretComplaint(
            _request:
              SemanticComplaintProviderRequest,
          ): Promise<unknown> {

            throw new Error(
              "provider unavailable",
            );
          }
        }

        const provider =
          new SafeSemanticComplaintProvider(
            new BrokenProvider(),
            {
              timeoutMs:
                100,
            },
          );

        const result =
          await provider.interpretComplaint({
            originalText:
              "un seul clic",
          });

        expect(
          result,
        ).toEqual({
          evidences: [],
        });
      },
    );

    it(
      "fails closed when provider exceeds timeout",
      async () => {

        class HangingProvider
          implements SemanticComplaintProvider {

          public async interpretComplaint(
            _request:
              SemanticComplaintProviderRequest,
          ): Promise<unknown> {

            return await new Promise(
              resolve => {

                setTimeout(
                  () => {
                    resolve({
                      evidences: [
                        {
                          id:
                            "symptom-single-click",

                          confidence:
                            0.99,
                        },
                      ],
                    });
                  },
                  100,
                );

              },
            );
          }
        }

        const provider =
          new SafeSemanticComplaintProvider(
            new HangingProvider(),
            {
              timeoutMs:
                5,
            },
          );

        const result =
          await provider.interpretComplaint({
            originalText:
              "un seul clic",
          });

        expect(
          result,
        ).toEqual({
          evidences: [],
        });
      },
    );

    it(
      "passes exact original text to wrapped provider",
      async () => {

        class RecordingProvider
          implements SemanticComplaintProvider {

          public receivedText:
            string | null =
              null;

          public async interpretComplaint(
            request:
              SemanticComplaintProviderRequest,
          ): Promise<unknown> {

            this.receivedText =
              request.originalText;

            return {
              evidences: [],
            };
          }
        }

        const inner =
          new RecordingProvider();

        const provider =
          new SafeSemanticComplaintProvider(
            inner,
            {
              timeoutMs:
                100,
            },
          );

        const originalText =
          "marş basmıyor, j'entends bir clik";

        await provider.interpretComplaint({
          originalText,
        });

        expect(
          inner.receivedText,
        ).toBe(
          originalText,
        );
      },
    );

  },
);