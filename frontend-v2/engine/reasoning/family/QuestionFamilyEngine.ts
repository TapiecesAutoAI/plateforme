import type {
  DiagnosticAction,
} from "../../core/actionTypes";

export type QuestionFamilyId =
  | "starter-click-pattern"
  | "electrical-light-drop"
  | "booster-result"
  | "battery-terminals"
  | "battery-age"
  | "battery-voltage"
  | "starter-rotation"
  | "neutral-clutch"
  | "dashboard-response"
  | "immobilizer"
  | "fuel-pump"
  | "fuel-level"
  | "engine-start-intent"
  | "unknown";

type ActionMetadata =
  DiagnosticAction & {
    family?: string;
  };

export class QuestionFamilyEngine {
  public resolve(
    action:
      DiagnosticAction,
  ): QuestionFamilyId {
    const metadata =
      action as ActionMetadata;

    const explicitFamily =
      metadata.family
        ?.trim();

    if (explicitFamily) {
      return explicitFamily as
        QuestionFamilyId;
    }

    const source =
      `${action.id} ${action.text}`
        .toLowerCase()
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          "",
        );

    if (
      this.containsAny(
        source,
        [
          "clic",
          "click",
          "claquement",
        ],
      )
    ) {
      return "starter-click-pattern";
    }

    if (
      this.containsAny(
        source,
        [
          "antidemarrage",
          "immobilizer",
          "antivol",
          "cadenas",
          "seconde cle",
        ],
      )
    ) {
      return "immobilizer";
    }
    if (
      this.containsAny(
        source,
        [
          "phare",
          "voyant",
          "faibl",
          "intensite",
          "eteignent",
        ],
      )
    ) {
      return "electrical-light-drop";
    }

    if (
      this.containsAny(
        source,
        [
          "booster",
          "cables",
          "pinces",
        ],
      )
    ) {
      return "booster-result";
    }

    if (
      this.containsAny(
        source,
        [
          "borne",
          "cosse",
          "oxydation",
        ],
      )
    ) {
      return "battery-terminals";
    }

    if (
      this.containsAny(
        source,
        [
          "age de la batterie",
          "batterie recente",
          "batterie ancienne",
          "plus de 4 ans",
          "moins de 2 ans",
        ],
      )
    ) {
      return "battery-age";
    }

    if (
      this.containsAny(
        source,
        [
          "tension",
          "multimetre",
          "voltage",
        ],
      )
    ) {
      return "battery-voltage";
    }

    if (
      this.containsAny(
        source,
        [
          "demarreur tourne",
          "tourne rapidement",
          "tourne dans le vide",
        ],
      )
    ) {
      return "starter-rotation";
    }

    if (
      this.containsAny(
        source,
        [
          "position neutre",
          "embrayage",
        ],
      )
    ) {
      return "neutral-clutch";
    }

    if (
      this.containsAny(
        source,
        [
          "tableau de bord",
          "accessoires",
        ],
      )
    ) {
      return "dashboard-response";
    }


    if (
      this.containsAny(
        source,
        [
          "fuel-pump",
          "pompe a carburant",
          "pompe s amorce",
          "pompe a essence",
        ],
      )
    ) {
      return "fuel-pump";
    }
    if (
      this.containsAny(
        source,
        [
          "reservoir",
          "carburant",
          "essence",
          "diesel",
        ],
      )
    ) {
      return "fuel-level";
    }

    if (
      this.containsAny(
        source,
        [
          "veut demarrer",
          "signes qu il veut demarrer",
          "tousse",
          "essaie de partir",
        ],
      )
    ) {
      return "engine-start-intent";
    }

    return "unknown";
  }

  public collectAnsweredFamilies(
    actions:
      readonly DiagnosticAction[],

    completedActionIds:
      readonly string[],
  ): Set<QuestionFamilyId> {
    const completed =
      new Set(
        completedActionIds,
      );

    const families =
      new Set<QuestionFamilyId>();

    for (
      const action
      of actions
    ) {
      if (
        !completed.has(
          action.id,
        )
      ) {
        continue;
      }

      const family =
        this.resolve(
          action,
        );

      if (
        family !==
        "unknown"
      ) {
        families.add(
          family,
        );
      }
    }

    return families;
  }

  public isAlreadyCovered(
    action:
      DiagnosticAction,

    answeredFamilies:
      ReadonlySet<QuestionFamilyId>,
  ): boolean {
    const family =
      this.resolve(
        action,
      );

    return (
      family !==
        "unknown" &&
      answeredFamilies.has(
        family,
      )
    );
  }

  private containsAny(
    source:
      string,

    values:
      readonly string[],
  ): boolean {
    return values.some(
      value =>
        source.includes(
          value,
        ),
    );
  }
}
