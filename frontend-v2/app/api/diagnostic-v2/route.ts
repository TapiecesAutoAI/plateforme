import {
  NextResponse,
} from "next/server";

import {
  DiagnosticEngineV2,
  diagnosticSessionStore,
} from "../../../engine/core";

import type {
  DiagnosticAudience,
  DiagnosticSession,
} from "../../../engine/core";

import type {
  KnowledgeDomain,
} from "../../../engine/knowledge";

import {
  DiagnosticResponseBuilder,
} from "../../../engine/response/DiagnosticResponseBuilder";

type StartRequest = {

  command:
    "start";

  sessionId:
    string;

  profile:
    DiagnosticAudience;

  domain:
    KnowledgeDomain;

  evidenceIds?:
    string[];

};

type AnswerRequest = {

  command:
    "answer";

  sessionId:
    string;

  domain:
    KnowledgeDomain;

  actionId:
    string;

  optionId:
    string;

};

type AnswerValueRequest = {

  command:
    "answer-value";

  sessionId:
    string;

  domain:
    KnowledgeDomain;

  actionId:
    string;

  value:
    string;

};


type EvaluateRequest = {

  command:
    "evaluate";

  sessionId:
    string;

  domain:
    KnowledgeDomain;

};

type DiagnosticV2Request =
  | StartRequest
  | AnswerRequest
  | AnswerValueRequest
  | EvaluateRequest;

const diagnosticEngine =
  new DiagnosticEngineV2();

const diagnosticResponseBuilder =
  new DiagnosticResponseBuilder();

function saveSession(
  session:
    DiagnosticSession,
): void {

  diagnosticSessionStore.save(
    session,
  );

}

function isRecord(
  value:
    unknown,
): value is Record<string, unknown> {

  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );

}

function requireString(
  value:
    unknown,

  field:
    string,
): string {

  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {

    throw new RequestValidationError(
      `Le champ "${field}" est obligatoire.`,
    );

  }

  return value.trim();

}

function parseEvidenceIds(
  value:
    unknown,
): string[] {

  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {

    throw new RequestValidationError(
      'Le champ "evidenceIds" doit être un tableau de chaînes.',
    );

  }

  const evidenceIds:
    string[] = [];

  for (
    const item
    of value
  ) {

    if (
      typeof item !== "string" ||
      item.trim().length === 0
    ) {

      throw new RequestValidationError(
        'Chaque élément de "evidenceIds" doit être une chaîne non vide.',
      );

    }

    evidenceIds.push(
      item.trim(),
    );

  }

  return [
    ...new Set(evidenceIds),
  ];

}

function parseRequest(
  body:
    unknown,
): DiagnosticV2Request {

  if (!isRecord(body)) {

    throw new RequestValidationError(
      "Le corps de la requête doit être un objet JSON.",
    );

  }

  const command =
    requireString(
      body.command,
      "command",
    );

  const sessionId =
    requireString(
      body.sessionId,
      "sessionId",
    );

  const domain =
    requireString(
      body.domain,
      "domain",
    ) as KnowledgeDomain;

  if (command === "start") {

    return {

      command,

      sessionId,

      domain,

      profile:
        requireString(
          body.profile,
          "profile",
        ) as DiagnosticAudience,

      evidenceIds:
        parseEvidenceIds(
          body.evidenceIds,
        ),

    };

  }

  if (command === "answer-value") {

    return {

      command,

      sessionId,

      domain,

      actionId:
        requireString(
          body.actionId,
          "actionId",
        ),

      value:
        requireString(
          body.value,
          "value",
        ),

    };

  }


  if (command === "answer") {

    return {

      command,

      sessionId,

      domain,

      actionId:
        requireString(
          body.actionId,
          "actionId",
        ),

      optionId:
        requireString(
          body.optionId,
          "optionId",
        ),

    };

  }

  if (command === "evaluate") {

    return {

      command,

      sessionId,

      domain,

    };

  }

  throw new RequestValidationError(
    `Commande inconnue : "${command}".`,
  );

}

function buildResponse(
  result:
    ReturnType<
      DiagnosticEngineV2["createSession"]
    >,

  domain:
    KnowledgeDomain,
) {
  console.log(
  "DIAGNOSTIC RESPONSE",
  {
    completed:
      result.completed,

    actionId:
      result.action?.id ??
      null,

    pendingAction:
      result.session.pendingAction?.id ??
      null,

    currentActionId:
      result.session.currentActionId,

    mustReturnAction:
      result.action !== null,

    decisionType:
      result.reasoning
        .decision.type,

    selectedQuestionId:
      result.reasoning
        .decision
        .selectedQuestion
        ?.id ??
      null,

    sessionStatus:
      result.session.status,

    questionCount:
      result.session
        .actionResults.length,
  },
);

  const response =
    diagnosticResponseBuilder.build(
      result,
      domain,
    );

  console.log(
    "BUILT RESPONSE",
    {
      actionId:
        response.action?.id ??
        null,

      completed:
        response.completed,

      sessionStatus:
        response.session.status,
    },
  );

  return response;
}

export async function POST(
  request:
    Request,
) {

  try {

    const rawBody:
      unknown =
        await request.json();

    const body =
      parseRequest(
        rawBody,
      );

    if (
      body.command === "start"
    ) {

      const existingSession =
        diagnosticSessionStore.get(
          body.sessionId,
        );

      if (existingSession) {

        return NextResponse.json(
          {

            error:
              `Une session portant l'identifiant "${body.sessionId}" existe déjà.`,

          },
          {

            status:
              409,

          },
        );

      }

      const result =
        diagnosticEngine.createSession(
          body.sessionId,
          body.profile,
          body.domain,
          body.evidenceIds,
        );

      saveSession(
        result.session,
      );

      return NextResponse.json(
        buildResponse(
          result,
          body.domain,
        ),
        {

          status:
            201,

        },
      );

    }

    const session =
      diagnosticSessionStore.get(
        body.sessionId,
      );

    if (!session) {

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

    if (
      body.command === "answer-value"
    ) {

      const result =
        diagnosticEngine.answerValue(
          session,
          body.domain,
          body.actionId,
          body.value,
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
      body.command === "answer"
    ) {

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

    const result =
      diagnosticEngine.evaluateSession(
        session,
        body.domain,
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

  } catch (
    error
  ) {

    if (
      error instanceof
      RequestValidationError
    ) {

      return NextResponse.json(
        {

          error:
            error.message,

        },
        {

          status:
            400,

        },
      );

    }

    if (
      error instanceof
      SyntaxError
    ) {

      return NextResponse.json(
        {

          error:
            "Le corps de la requête n'est pas un JSON valide.",

        },
        {

          status:
            400,

        },
      );

    }

    console.error(
      "Diagnostic V2 API error:",
      error,
    );

    return NextResponse.json(
      {

        error:
          error instanceof Error
            ? error.message
            : "Erreur interne du moteur de diagnostic V2.",

      },
      {

        status:
          500,

      },
    );

  }

}

class RequestValidationError
  extends Error {

  public constructor(
    message:
      string,
  ) {

    super(
      message,
    );

    this.name =
      "RequestValidationError";

  }

}
