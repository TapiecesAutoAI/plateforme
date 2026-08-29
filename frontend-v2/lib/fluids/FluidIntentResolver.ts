import {
  FLUID_KNOWLEDGE_BASE,
} from "./FluidKnowledgeBase";

import type {
  FluidKnowledgeRecord,
} from "./FluidKnowledgeBase";

function normalize(
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
      /[^a-z0-9]+/g,
      " ",
    )
    .trim();
}

export type FluidClarificationOption = {
  id: string;
  label: string;
};

export type FluidResolveResult =
  | {
      status: "found";
      record: FluidKnowledgeRecord;
    }
  | {
      status: "needs-clarification";
      reason: "generic-oil-request";
      options: FluidClarificationOption[];
    }
  | {
      status: "unknown";
    };

const OIL_OPTIONS:
  FluidClarificationOption[] = [

    {
      id: "engine-oil",
      label: "Huile moteur",
    },

    {
      id: "manual-transmission-fluid",
      label: "Huile de boite manuelle",
    },

    {
      id: "automatic-transmission-fluid",
      label: "Huile de boite automatique / ATF",
    },

    {
      id: "dct-fluid",
      label: "Huile DSG / DCT",
    },

    {
      id: "cvt-fluid",
      label: "Huile CVT",
    },

    {
      id: "differential-fluid",
      label: "Huile de pont / differentiel",
    },

    {
      id: "power-steering-fluid",
      label: "Huile / fluide de direction assistee",
    },

    {
      id: "brake-fluid",
      label: "Huile / liquide de frein",
    },
  ];

function findRecord(
  id: string,
): FluidKnowledgeRecord | undefined {

  return FLUID_KNOWLEDGE_BASE.find(
    record =>
      record.id === id,
  );
}

function found(
  id: string,
): FluidResolveResult {

  const record =
    findRecord(
      id,
    );

  if (!record) {

    return {
      status: "unknown",
    };
  }

  return {
    status: "found",
    record,
  };
}

export function resolveFluidIntent(
  input: string,
): FluidResolveResult {

  const text =
    normalize(
      input,
    );

  if (!text) {

    return {
      status: "unknown",
    };
  }

  /*
   * D'ABORD LES DEMANDES PRECISES.
   */

  if (
    text.includes("huile de boite manuelle") ||
    text.includes("huile boite manuelle") ||
    text.includes("transmission manuelle")
  ) {

    return found(
      "manual-transmission-fluid",
    );
  }

  if (
    text.includes("huile de boite automatique") ||
    text.includes("huile boite automatique") ||
    text.includes("huile atf") ||
    text.includes("fluide atf") ||
    /\batf\b/.test(text)
  ) {

    return found(
      "automatic-transmission-fluid",
    );
  }

  if (
    text.includes("huile dsg") ||
    text.includes("fluide dsg") ||
    text.includes("huile dct") ||
    text.includes("fluide dct") ||
    text.includes("double embrayage")
  ) {

    return found(
      "dct-fluid",
    );
  }

  if (
    text.includes("huile cvt") ||
    text.includes("fluide cvt") ||
    text.includes("boite cvt")
  ) {

    return found(
      "cvt-fluid",
    );
  }

  if (
    text.includes("huile de pont") ||
    text.includes("huile pont") ||
    text.includes("huile differentiel") ||
    text.includes("huile de differentiel")
  ) {

    return found(
      "differential-fluid",
    );
  }

  if (
    text.includes("huile de direction") ||
    text.includes("huile direction") ||
    text.includes("fluide direction") ||
    text.includes("direction assistee")
  ) {

    return found(
      "power-steering-fluid",
    );
  }

  if (
    text.includes("huile moteur") ||
    text.includes("huile pour le moteur") ||
    text.includes("vidange moteur")
  ) {

    return found(
      "engine-oil",
    );
  }

  /*
   * AUTRES FLUIDES :
   * ils restent accessibles directement,
   * mais ne sont jamais proposes lorsque
   * le client demande simplement "huile".
   */

  if (
    text.includes("liquide de frein") ||
    text.includes("huile de frein") ||
    text.includes("fluide de frein")
  ) {

    return found(
      "brake-fluid",
    );
  }

  if (
    text.includes("liquide de refroidissement") ||
    text.includes("antigel") ||
    /\bldr\b/.test(text)
  ) {

    return found(
      "coolant",
    );
  }

  if (
    text.includes("lave glace") ||
    text.includes("lave-glace")
  ) {

    return found(
      "screenwash",
    );
  }

  if (
    text.includes("adblue") ||
    text.includes("ad blue")
  ) {

    return found(
      "adblue",
    );
  }

  /*
   * HUILE GENERIQUE :
   * TPA NE SUPPOSE PLUS "HUILE MOTEUR".
   */

  if (
    /\bhuile\b/.test(text)
  ) {

    return {
      status:
        "needs-clarification",

      reason:
        "generic-oil-request",

      options:
        OIL_OPTIONS,
    };
  }

  /*
   * FALLBACK REFERENTIEL.
   */

  for (
    const record
    of FLUID_KNOWLEDGE_BASE
  ) {

    for (
      const example
      of record.examples
    ) {

      if (
        text.includes(
          normalize(
            example,
          ),
        )
      ) {

        return {
          status:
            "found",

          record,
        };
      }
    }
  }

  return {
    status: "unknown",
  };
}