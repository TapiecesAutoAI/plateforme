export type ToolOperationKind =
  | "unknown"
  | "universal"
  | "vehicle-specific";

export type ToolOperationId =
  | "unknown"
  | "oil-filter-removal"
  | "wheel-removal"
  | "oil-change"
  | "battery-test"
  | "alternator-test"
  | "fuse-test"
  | "electrical-diagnosis"
  | "timing-service"
  | "timing-locking-tool"
  | "driveshaft-removal";

export type ToolOperationResolution = {
  operation: ToolOperationId;
  kind: ToolOperationKind;
  vehicleRequired: boolean;
  confidence: number;
  reason: string;
};

function normalize(
  value: string,
): string {

  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .trim()
    .toLowerCase();
}

function result(
  operation: ToolOperationId,
  kind: ToolOperationKind,
  confidence: number,
  reason: string,
): ToolOperationResolution {

  return {
    operation,
    kind,
    vehicleRequired:
      kind === "vehicle-specific",
    confidence,
    reason,
  };
}

export function resolveToolOperation(
  value: string,
): ToolOperationResolution {

  const text =
    normalize(
      value,
    );

  /*
   * OUTILLAGE SPECIFIQUE VEHICULE
   *
   * Ces operations ne doivent jamais aboutir
   * automatiquement a une reference d'outil
   * sans identification suffisamment precise
   * du vehicule.
   */

  if (
    text.includes("kit de calage") ||
    text.includes("kit calage") ||
    text.includes("outil de calage") ||
    text.includes("outillage de calage")
  ) {

    return result(
      "timing-locking-tool",
      "vehicle-specific",
      0.99,
      "Le kit de calage depend du moteur et parfois de sa variante exacte.",
    );
  }

  if (
    text.includes("distribution") ||
    text.includes("courroie de distribution") ||
    text.includes("chaine de distribution")
  ) {

    return result(
      "timing-service",
      "vehicle-specific",
      0.97,
      "L'outillage de distribution depend du moteur et de la configuration de distribution.",
    );
  }

  if (
    text.includes("cardan") ||
    text.includes("arbre de transmission") ||
    text.includes("joint homocinetique")
  ) {

    return result(
      "driveshaft-removal",
      "vehicle-specific",
      0.96,
      "Les empreintes et dimensions de fixation du cardan peuvent varier selon le vehicule, la transmission et la configuration.",
    );
  }

  /*
   * OUTILLAGE GENERALEMENT UNIVERSEL
   */

  if (
    text.includes("filtre a huile")
  ) {

    return result(
      "oil-filter-removal",
      "universal",
      0.96,
      "Plusieurs solutions universelles existent avant de devoir connaitre une reference vehicule precise.",
    );
  }

  if (
    text.includes("demonter une roue") ||
    text.includes("retirer une roue") ||
    text.includes("enlever une roue") ||
    text.includes("boulon de roue") ||
    text.includes("ecrou de roue")
  ) {

    return result(
      "wheel-removal",
      "universal",
      0.94,
      "Un petit ensemble d'outils couvre les dimensions de roue les plus courantes.",
    );
  }

  if (
    text.includes("vidange")
  ) {

    return result(
      "oil-change",
      "universal",
      0.92,
      "L'outillage general de vidange peut etre propose sans identifier le vehicule.",
    );
  }

  if (
    text.includes("batterie") &&
    (
      text.includes("test") ||
      text.includes("control") ||
      text.includes("mesur") ||
      text.includes("verif")
    )
  ) {

    return result(
      "battery-test",
      "universal",
      0.95,
      "Les outils de controle electrique de base sont universels.",
    );
  }

  if (
    text.includes("alternateur") ||
    text.includes("circuit de charge") ||
    text.includes("charge alternateur")
  ) {

    return result(
      "alternator-test",
      "universal",
      0.95,
      "Le controle de base d'un alternateur utilise de l'outillage electrique universel.",
    );
  }

  if (
    text.includes("fusible") ||
    text.includes("fusibles")
  ) {

    return result(
      "fuse-test",
      "universal",
      0.95,
      "Le controle de fusibles utilise de l'outillage electrique universel.",
    );
  }

  if (
    text.includes("panne electrique") ||
    text.includes("probleme electrique") ||
    text.includes("circuit electrique") ||
    text.includes("diagnostic electrique")
  ) {

    return result(
      "electrical-diagnosis",
      "universal",
      0.90,
      "La recherche de panne electrique commence avec de l'outillage universel.",
    );
  }

  return result(
    "unknown",
    "unknown",
    0,
    "Operation non encore classee.",
  );
}