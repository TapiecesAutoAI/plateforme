import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  buildConversationEngine,
} from "@/lib/ai/chatEngine";

import type {
  ChatMessage,
} from "@/lib/ai/conversation";

import type {
  ConversationState,
} from "@/lib/ai/types";

type ChatRequestBody = {
  messages?: unknown;
};

function isChatMessage(
  value: unknown,
): value is ChatMessage {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const message =
    value as Record<string, unknown>;

  return (
    (
      message.role === "user" ||
      message.role === "assistant"
    ) &&
    typeof message.content === "string" &&
    message.content.trim().length > 0
  );
}

function parseMessages(
  value: unknown,
): ChatMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isChatMessage)
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }));
}

function formatProbability(
  probability: number,
): number {
  return Math.round(
    Math.max(
      0,
      Math.min(
        probability,
        1,
      ),
    ) * 100,
  );
}

function buildAssistantMessage(
  state: ConversationState,
): string {
  /*
   * Une question en attente reste toujours prioritaire.
   */
  if (state.nextQuestion) {
    return state.nextQuestion.text;
  }

  /*
   * Un diagnostic final n’est annoncé que lorsque
   * le moteur a réellement terminé son raisonnement.
   */
  if (
    state.diagnosisComplete &&
    state.diagnostic
  ) {
    return [
      `Le diagnostic le plus probable est : ${state.diagnostic.title}.`,
      `Niveau de confiance : ${state.diagnostic.confidence} %.`,
    ].join(" ");
  }

  const primaryHypothesis =
    state.hypotheses.find(
      (hypothesis) =>
        hypothesis.id ===
        state.decision.primaryHypothesisId,
    ) ??
    state.hypotheses.find(
      (hypothesis) =>
        !hypothesis.eliminated,
    ) ??
    state.hypotheses[0] ??
    null;

  /*
   * Ne pas présenter une hypothèse provisoire comme
   * un diagnostic terminé.
   *
   * Cela évite également que la conversation suivante
   * soit interprétée comme un nouveau diagnostic.
   */
  if (primaryHypothesis) {
    const confidence =
      formatProbability(
        primaryHypothesis.probability,
      );

    return [
      `Une piste reste actuellement en tête à ${confidence} %.`,
      "Les informations disponibles ne suffisent pas encore pour confirmer la panne.",
      "Précisez ce qui se passe exactement au démarrage, ainsi que les bruits, voyants ou comportements observés.",
    ].join(" ");
  }

  return [
    "Je n’ai pas encore assez d’informations pour établir des hypothèses fiables.",
    "Décrivez précisément ce qui se passe, à quel moment le problème apparaît, ainsi que les bruits, voyants ou comportements constatés.",
  ].join(" ");
}

export async function POST(
  request: NextRequest,
) {
  try {
    const body =
      (await request.json()) as ChatRequestBody;

    const messages =
      parseMessages(
        body.messages,
      );

    if (
      messages.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "La conversation doit contenir au moins un message valide.",
        },
        {
          status: 400,
        },
      );
    }

    const latestMessage =
      messages[
        messages.length - 1
      ];

    if (
      latestMessage.role !==
      "user"
    ) {
      return NextResponse.json(
        {
          error:
            "Le dernier message doit provenir de l’utilisateur.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * La route ne détecte plus elle-même les domaines.
     *
     * Toute l’interprétation de la conversation est confiée
     * au moteur central :
     *
     * - réponses aux questions ;
     * - preuves confirmées ou rejetées ;
     * - changement réel de diagnostic ;
     * - sélection de la question suivante ;
     * - conclusion finale.
     *
     * Une réponse telle que « le moteur tourne lentement »
     * ne peut donc plus être prise pour un nouveau problème
     * simplement parce qu’elle contient le mot « moteur ».
     */
    const state =
      buildConversationEngine(
        messages,
      );

    const message =
      buildAssistantMessage(
        state,
      );

    return NextResponse.json({
      message,
      response: message,
      reply: message,

      nextQuestion:
        state.nextQuestion,

      decision:
        state.decision,

      hypotheses:
        state.hypotheses,

      diagnosisComplete:
        state.diagnosisComplete,

      diagnostic:
        state.diagnostic,

      /*
       * Conservés pour compatibilité avec l’interface actuelle.
       * La route ne déclenche plus elle-même de réinitialisation.
       */
      conversationReset: false,
      previousDomain: null,
      activeDomain: null,
      activeConversationStartIndex: 0,

      state,
    });
  } catch (error) {
    console.error(
      "Erreur dans l’API de diagnostic :",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Une erreur est survenue pendant l’analyse du diagnostic.",
      },
      {
        status: 500,
      },
    );
  }
}

export function GET() {
  return NextResponse.json({
    name:
      "TapiecesAuto diagnostic API",
    status: "ready",
  });
}

