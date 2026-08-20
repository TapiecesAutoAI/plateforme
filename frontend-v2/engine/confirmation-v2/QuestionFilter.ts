import type {
  Evidence,
  ProbabilityResult,
  Question,
} from "../model";

export class QuestionFilter {

  public filter(
    evidences:
      readonly Evidence[],

    questions:
      readonly Question[],

    probabilities:
      readonly ProbabilityResult[],
  ): Question[] {

    const confirmedEvidenceIds =
      new Set(
        evidences
          .filter(
            evidence =>
              evidence.status ===
              "confirmed",
          )
          .map(
            evidence =>
              evidence.id,
          ),
      );

    const confidence =
      probabilities[0]
        ?.probability ??
      0;

    return questions.filter(
      question =>
        this.isUseful(
          question,
          confirmedEvidenceIds,
          confidence,
        ),
    );
  }

  private isUseful(
    question:
      Question,

    confirmedEvidenceIds:
      ReadonlySet<string>,

    confidence:
      number,
  ): boolean {


    const id =
      question.id
        .toLowerCase();

    const text =
      question.text
        .toLowerCase()
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          "",
        );

    /*
     * Éclairage déjà observé :
     * aucune autre question équivalente.
     */
    const lightsKnown =
      this.hasAnyEvidence(
        confirmedEvidenceIds,
        [
          "observation-lights-dim-strongly",
          "observation-lights-dim-slightly",
          "observation-lights-stay-normal",
          "observation-lights-dim",
        ],
      );

    if (
      lightsKnown &&
      (
        id.includes(
          "lights",
        ) ||
        text.includes(
          "phares",
        ) ||
        text.includes(
          "voyants",
        )
      )
    ) {
      return false;
    }

    /*
     * Booster déjà testé :
     * ne plus demander sa disponibilité
     * ni refaire exactement le même test.
     */
    const boosterAlreadyTested =
      this.hasAnyEvidence(
        confirmedEvidenceIds,
        [
          "observation-booster-no-change",
          "observation-jump-start-success",
          "observation-jump-start-fails",
          "observation-booster-single-click",
          "observation-booster-rapid-clicking",
        ],
      );

    if (
      boosterAlreadyTested &&
      (
        id ===
          "starting-booster-availability" ||
        id ===
          "starting-booster-test"
      )
    ) {
      return false;
    }

    /*
     * Redémarrage après booster :
     * uniquement si un démarrage assisté
     * a réellement réussi.
     */
    if (
      id ===
        "starting-restart-after-jump" &&
      !confirmedEvidenceIds.has(
        "observation-jump-start-success",
      )
    ) {
      return false;
    }

    /*
     * Un clic unique confirmé :
     * inutile de redemander si le démarreur
     * tourne dans le vide.
     */
    if (
      confirmedEvidenceIds.has(
        "symptom-single-click",
      ) &&
      (
        id.includes(
          "starter-drive",
        ) ||
        text.includes(
          "tourne-t-il rapidement sans entrainer",
        ) ||
        text.includes(
          "tourne dans le vide",
        )
      )
    ) {
      return false;
    }

    /*
     * Clics rapides déjà confirmés :
     * ne pas revenir vers un clic unique.
     */
    if (
      confirmedEvidenceIds.has(
        "symptom-rapid-clicking",
      ) &&
      (
        text.includes(
          "un seul clic",
        ) ||
        id.includes(
          "single-click",
        )
      )
    ) {
      return false;
    }

    /*
     * À forte confiance, supprimer les questions
     * sans cible diagnostique réelle.
     */
    if (
      confidence >=
        0.85 &&
      question.targetEvidenceIds.length ===
        0 &&
      question.targetHypothesisIds.length ===
        0
    ) {
      return false;
    }

    return true;
  }

  private hasAnyEvidence(
    confirmedEvidenceIds:
      ReadonlySet<string>,

    evidenceIds:
      readonly string[],
  ): boolean {

    return evidenceIds.some(
      evidenceId =>
        confirmedEvidenceIds.has(
          evidenceId,
        ),
    );
  }
}



