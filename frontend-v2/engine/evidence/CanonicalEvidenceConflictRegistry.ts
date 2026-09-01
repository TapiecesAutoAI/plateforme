import type {
  CanonicalEvidenceId,
} from "./CanonicalEvidenceRegistry";

export type CanonicalEvidenceConflict = {
  left:
    CanonicalEvidenceId;

  right:
    CanonicalEvidenceId;

  reason:
    string;
};

export const canonicalEvidenceConflicts:
  readonly CanonicalEvidenceConflict[] = [

    {
      left:
        "observation-battery-voltage-low",

      right:
        "observation-battery-voltage-normal",

      reason:
        "La tension batterie ne peut pas être simultanément basse et normale dans la même observation.",
    },

    {
      left:
        "observation-jump-start-success",

      right:
        "observation-jump-start-fails",

      reason:
        "Le même essai de démarrage assisté ne peut pas simultanément réussir et échouer.",
    },

    {
      left:
        "observation-starter-control-voltage-present",

      right:
        "observation-starter-control-voltage-absent",

      reason:
        "La tension de commande du démarreur ne peut pas être simultanément présente et absente dans la même observation.",
    },

    {
      left:
        "observation-lights-stay-normal",

      right:
        "observation-lights-dim-strongly",

      reason:
        "Les éclairages ne peuvent pas simultanément rester normaux et chuter fortement dans la même observation.",
    },

    {
      left:
        "observation-lights-stay-normal",

      right:
        "observation-lights-dim-slightly",

      reason:
        "Les éclairages ne peuvent pas simultanément rester normaux et diminuer dans la même observation.",
    },

  ] as const;

function samePair(
  first:
    CanonicalEvidenceId,

  second:
    CanonicalEvidenceId,

  conflict:
    CanonicalEvidenceConflict,
): boolean {

  return (
    (
      conflict.left === first &&
      conflict.right === second
    ) ||
    (
      conflict.left === second &&
      conflict.right === first
    )
  );
}

export function findCanonicalEvidenceConflict(
  first:
    CanonicalEvidenceId,

  second:
    CanonicalEvidenceId,
): CanonicalEvidenceConflict | null {

  if (first === second) {
    return null;
  }

  return (
    canonicalEvidenceConflicts.find(
      conflict =>
        samePair(
          first,
          second,
          conflict,
        ),
    ) ??
    null
  );
}

export function areCanonicalEvidencesConflicting(
  first:
    CanonicalEvidenceId,

  second:
    CanonicalEvidenceId,
): boolean {

  return (
    findCanonicalEvidenceConflict(
      first,
      second,
    ) !== null
  );
}

export function findConflictsAmongCanonicalEvidences(
  evidenceIds:
    readonly CanonicalEvidenceId[],
): CanonicalEvidenceConflict[] {

  const conflicts:
    CanonicalEvidenceConflict[] = [];

  const uniqueEvidenceIds =
    [
      ...new Set(
        evidenceIds,
      ),
    ];

  for (
    let leftIndex = 0;
    leftIndex < uniqueEvidenceIds.length;
    leftIndex += 1
  ) {

    for (
      let rightIndex = leftIndex + 1;
      rightIndex < uniqueEvidenceIds.length;
      rightIndex += 1
    ) {

      const left =
        uniqueEvidenceIds[
          leftIndex
        ];

      const right =
        uniqueEvidenceIds[
          rightIndex
        ];

      if (
        left === undefined ||
        right === undefined
      ) {
        continue;
      }

      const conflict =
        findCanonicalEvidenceConflict(
          left,
          right,
        );

      if (conflict) {
        conflicts.push(
          conflict,
        );
      }
    }
  }

  return conflicts;
}