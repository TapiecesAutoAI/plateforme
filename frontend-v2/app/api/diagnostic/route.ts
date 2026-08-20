import {
  NextResponse,
} from "next/server";

import {
  DiagnosticEngine,
  diagnosticSessionStore,
} from "../../../engine/core";

import type {
  DiagnosticAudience,
  DiagnosticSession,
} from "../../../engine/core";

import {
  KnowledgeLoader,
} from "../../../engine/knowledge";

import type {
  KnowledgeDomain,
} from "../../../engine/knowledge";

import {
  PartRecommendationEngine,
} from "../../../engine/parts";

import {
  SalesEngine,
} from "../../../engine/sales";

type StartRequest = {
  command: "start";

  sessionId: string;

  profile: DiagnosticAudience;

  domain: KnowledgeDomain;

  message?: string;
};

type AnswerRequest = {
  command: "answer";

  sessionId: string;

  domain: KnowledgeDomain;

  actionId: string;

  optionId: string;
};

type DiagnosticRequest =
  | StartRequest
  | AnswerRequest;

const diagnosticEngine =
  new DiagnosticEngine();

const knowledgeLoader =
  new KnowledgeLoader();

const partRecommendationEngine =
  new PartRecommendationEngine();

const salesEngine =
  new SalesEngine();

function saveSession(
  session: DiagnosticSession,
): void {
  diagnosticSessionStore.save(
    session,
  );
}

function buildResponse(
  result:
    ReturnType<
      DiagnosticEngine["createSession"]
    >,
  domain: KnowledgeDomain,
) {
  const knowledge =
    knowledgeLoader.loadDomain(
      domain,
    );

  const partRecommendation =
    result.reasoning
      ? partRecommendationEngine.recommend(
          knowledge,
          result.reasoning,
        )
      : null;

  const salesRecommendation =
    salesEngine.createRecommendation(
      partRecommendation,
      result.explanation,
    );

  return {
    ...result,

    partRecommendation,

    salesRecommendation,
  };
}

export async function POST(
  request: Request,
) {
  try {
    const body =
      await request.json() as
        DiagnosticRequest;

    if (
      body.command ===
      "start"
    ) {
      const result =
        diagnosticEngine.createSession(
          body.sessionId,
          body.profile,
          body.domain,
          body.message ?? "",
        );

      saveSession(
        result.session,
      );

      return NextResponse.json(
        buildResponse(
          result,
          body.domain,
        ),
      );
    }

    if (
      body.command ===
      "answer"
    ) {
      const session =
        diagnosticSessionStore.get(
          body.sessionId,
        );

      if (
        !session
      ) {
        return NextResponse.json(
          {
            error:
              "Session de diagnostic introuvable.",
          },
          {
            status:
              404,
          },
        );
      }

      const result =
        diagnosticEngine.answer(
          session,
          body.domain,
          body.actionId,
          body.optionId,
        );

      saveSession(
        result.session,
      );

      return NextResponse.json(
        buildResponse(
          result,
          body.domain,
        ),
      );
    }

    return NextResponse.json(
      {
        error:
          "Commande inconnue.",
      },
      {
        status:
          400,
      },
    );
  } catch (
    error
  ) {
    console.error(
      "Diagnostic API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur interne du moteur de diagnostic.",
      },
      {
        status:
          500,
      },
    );
  }
}
