import {
  describe,
  expect,
  it,
} from "vitest";

import {
  canonicalEvidenceDefinitions,
  isCanonicalEvidenceId,
} from "../engine/evidence/CanonicalEvidenceRegistry";

import {
  startingEvidenceDefinitions,
} from "../engine/workflows/starting/evidences";

describe(
  "CanonicalEvidenceRegistry",
  () => {
    it(
      "exposes every starting workflow evidence as canonical",
      () => {
        const canonicalIds =
          canonicalEvidenceDefinitions.map(
            (definition) =>
              definition.id,
          );

        const startingIds =
          startingEvidenceDefinitions.map(
            (definition) =>
              definition.id,
          );

        expect(
          canonicalIds,
        ).toEqual(
          startingIds,
        );

        expect(
          canonicalIds,
        ).toHaveLength(20);
      },
    );

    it(
      "does not contain duplicate evidence ids",
      () => {
        const ids =
          canonicalEvidenceDefinitions.map(
            (definition) =>
              definition.id,
          );

        expect(
          new Set(ids).size,
        ).toBe(
          ids.length,
        );
      },
    );

    it(
      "accepts canonical evidence ids and rejects arbitrary ids",
      () => {
        expect(
          isCanonicalEvidenceId(
            "symptom-single-click",
          ),
        ).toBe(true);

        expect(
          isCanonicalEvidenceId(
            "symptom-single-click-start",
          ),
        ).toBe(false);

        expect(
          isCanonicalEvidenceId(
            "invented-by-ai",
          ),
        ).toBe(false);
      },
    );
  },
);