import type {
  DiagnosticAction,
} from "../../core/actionTypes";

export type StartingFailureBranch =
  | "unknown"
  | "no-crank-no-sound"
  | "single-click"
  | "rapid-clicks"
  | "starter-spins"
  | "engine-cranks";

export interface FailureTreeContext {
  confirmedEvidenceIds:
    readonly string[];
}

export class FailureTreeEngine {
  public detectStartingBranch(
    context:
      FailureTreeContext,
  ): StartingFailureBranch {
    const evidence =
      this.normalize(
        context.confirmedEvidenceIds
          .join(" "),
      );

    if (
      this.containsAny(
        evidence,
        [
          "rapid-click",
          "multiple-click",
          "several-click",
          "clics-rapides",
          "plusieurs-clics",
        ],
      )
    ) {
      return "rapid-clicks";
    }

    if (
      this.containsAny(
        evidence,
        [
          "single-click",
          "one-click",
          "clic-unique",
          "un-seul-clic",
        ],
      )
    ) {
      return "single-click";
    }

    if (
      this.containsAny(
        evidence,
        [
          "starter-spins",
          "starter-free-spins",
          "tourne-dans-le-vide",
          "demarreur-tourne-rapidement",
        ],
      )
    ) {
      return "starter-spins";
    }

    if (
      this.containsAny(
        evidence,
        [
          "engine-cranks",
          "engine-turns",
          "moteur-tourne",
          "moteur-entraine",
        ],
      )
    ) {
      return "engine-cranks";
    }

    if (
      this.containsAny(
        evidence,
        [
          "no-sound",
          "silent-start",
          "aucun-bruit",
          "silence-demarrage",
        ],
      )
    ) {
      return "no-crank-no-sound";
    }

    return "unknown";
  }

  public filterStartingActions(
    actions:
      readonly DiagnosticAction[],

    context:
      FailureTreeContext,
  ): DiagnosticAction[] {
    const branch =
      this.detectStartingBranch(
        context,
      );

    if (
      branch ===
      "unknown"
    ) {
      return [
        ...actions,
      ];
    }

    return actions.filter(
      action =>
        this.isAllowedForBranch(
          action,
          branch,
          context,
        ),
    );
  }

  private isAllowedForBranch(
    action:
      DiagnosticAction,

    branch:
      StartingFailureBranch,

    context:
      FailureTreeContext,
  ): boolean {
    const source =
      this.normalize(
        `${action.id} ${action.text}`,
      );

    const evidence =
      new Set(
        context.confirmedEvidenceIds,
      );

    const lightsStayNormal =
      evidence.has(
        "observation-lights-stay-normal",
      );

    const lightsDimStrongly =
      evidence.has(
        "observation-lights-dim-strongly",
      );

    const jumpStartFails =
      evidence.has(
        "observation-jump-start-fails",
      );

    const jumpStartSucceeds =
      evidence.has(
        "observation-jump-start-success",
      );

    const jumpStartKnown =
      jumpStartFails ||
      jumpStartSucceeds;

    /*
     * Le résultat du booster est déjà connu :
     * aucune nouvelle question sur les câbles
     * ou le booster ne doit être proposée.
     */
    if (
      jumpStartKnown &&
      this.containsAny(
        source,
        [
          "booster",
          "jump-start",
          "jump start",
          "cables",
          "cable de demarrage",
          "essayer de demarrer avec",
        ],
      )
    ) {
      return false;
    }

    /*
     * Clic unique + éclairage normal +
     * booster sans effet :
     * l'âge de la batterie n'est plus
     * suffisamment discriminant.
     */
    if (
      branch ===
        "single-click" &&
      lightsStayNormal &&
      jumpStartFails &&
      this.containsAny(
        source,
        [
          "battery-age",
          "batterie-age",
          "age de la batterie",
          "age approximatif",
          "quel age",
        ],
      )
    ) {
      return false;
    }

    /*
     * Éclairage fortement affaibli +
     * booster efficace :
     * inutile d'interroger ensuite
     * le démarreur ou le solénoïde.
     */
    if (
      lightsDimStrongly &&
      jumpStartSucceeds &&
      this.containsAny(
        source,
        [
          "solenoide",
          "relais de demarreur",
          "commande du demarreur",
          "tension de commande",
          "contacteur",
        ],
      )
    ) {
      return false;
    }

    if (
      branch ===
        "single-click" ||
      branch ===
        "rapid-clicks" ||
      branch ===
        "no-crank-no-sound"
    ) {
      if (
        this.containsAny(
          source,
          [
            "carburant",
            "reservoir",
            "pompe a carburant",
            "bourdonnement",
            "seconde cle",
            "antivol",
            "cadenas",
            "moteur veut demarrer",
            "signes qu il veut demarrer",
          ],
        )
      ) {
        return false;
      }
    }

    if (
      branch ===
      "single-click"
    ) {
      return this.containsAny(
        source,
        [
          "clic",
          "phare",
          "voyant",
          "batterie",
          "borne",
          "cosse",
          "masse",
          "booster",
          "cable",
          "demarreur",
          "solenoide",
          "relais",
          "contacteur",
          "neutre",
          "embrayage",
          "tension",
          "multimetre",
        ],
      );
    }

    if (
      branch ===
      "rapid-clicks"
    ) {
      return this.containsAny(
        source,
        [
          "clic",
          "phare",
          "voyant",
          "batterie",
          "borne",
          "cosse",
          "masse",
          "booster",
          "cable",
          "tension",
          "multimetre",
          "demarreur",
        ],
      );
    }

    if (
      branch ===
      "no-crank-no-sound"
    ) {
      return this.containsAny(
        source,
        [
          "tableau de bord",
          "accessoires",
          "phare",
          "voyant",
          "batterie",
          "borne",
          "cosse",
          "masse",
          "fusible",
          "relais",
          "contacteur",
          "neutre",
          "embrayage",
          "antivol",
        ],
      );
    }

    if (
      branch ===
      "starter-spins"
    ) {
      return this.containsAny(
        source,
        [
          "demarreur",
          "tourne",
          "volant moteur",
          "couronne",
          "solenoide",
          "pignon",
        ],
      );
    }

    if (
      branch ===
      "engine-cranks"
    ) {
      return !this.containsAny(
        source,
        [
          "clic unique",
          "clics rapides",
          "demarreur tourne dans le vide",
        ],
      );
    }

    return true;
  }

  private normalize(
    value:
      string,
  ): string {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        "",
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