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
import {
  understandAutomotiveComplaint,
} from "../../../lib/ai/ComplaintUnderstandingOrchestrator";

import {
  buildComplaintClarification,
} from "../../../lib/ai/ComplaintClarificationBuilder";

import {
  presentComplaintClarification,
} from "../../../lib/ai/ComplaintClarificationPresenter";
import {
  resolveComplaintClarification,
} from "../../../lib/ai/ComplaintClarificationResolver";


import {
  pendingComplaintClarificationStore,
} from "../../../lib/ai/PendingComplaintClarificationStore";

import {
  DisabledSemanticComplaintProvider,
} from "../../../lib/ai/SemanticComplaintProvider";

import {
  SafeSemanticComplaintProvider,
} from "../../../lib/ai/SafeSemanticComplaintProvider";

import {
  isCanonicalEvidenceId,
} from "../../../engine/evidence/CanonicalEvidenceRegistry";

import type {
  CanonicalEvidenceId,
} from "../../../engine/evidence/CanonicalEvidenceRegistry";

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

  message:
    string;

  originalMessage:
    string;

  deterministicMessage:
    string;


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


type ResolveClarificationRequest = {

  command:
    "resolve-clarification";

  sessionId:
    string;

  domain:
    KnowledgeDomain;


  clarificationToken:
    string;

  choice:
    | "confirm"
    | "reject"
    | "first"
    | "second"
    | "unsure";
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
  | ResolveClarificationRequest
  | EvaluateRequest;

const diagnosticEngine =
  new DiagnosticEngineV2();

const diagnosticResponseBuilder =
  new DiagnosticResponseBuilder();

const semanticComplaintProvider =
  new SafeSemanticComplaintProvider(
    new DisabledSemanticComplaintProvider(),
    {
      timeoutMs:
        2_000,
    },
  );

async function saveSession(
  session:
    DiagnosticSession,
): Promise<void> {

  await diagnosticSessionStore.save(
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
): CanonicalEvidenceId[] {

  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {

    throw new RequestValidationError(
      'Le champ "evidenceIds" doit être un tableau de chaînes.',
    );

  }

  const evidenceIds:
    CanonicalEvidenceId[] = [];

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

    const evidenceId =
      item.trim();

    if (
      !isCanonicalEvidenceId(
        evidenceId,
      )
    ) {

      throw new RequestValidationError(
        `Evidence ID non canonique : "${evidenceId}".`,
      );

    }

    evidenceIds.push(
      evidenceId,
    );

  }

  return [
    ...new Set(
      evidenceIds,
    ),
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
  if (
    command ===
      "resolve-clarification"
  ) {

    const choice =
      requireString(
        body.choice,
        "choice",
      );

    if (
      choice !== "confirm" &&
      choice !== "reject" &&
      choice !== "first" &&
      choice !== "second" &&
      choice !== "unsure"
    ) {
      throw new RequestValidationError(
        `Choix de clarification invalide : "${choice}".`,
      );
    }

    return {
      command,
      sessionId,
      domain,
      clarificationToken:
        requireString(
          body.clarificationToken,
          "clarificationToken",
        ),

      choice,
    };
  }


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

      message:
        typeof body.message === "string"
          ? body.message.trim()
          : "",

      originalMessage:
        typeof body.originalMessage === "string"
          ? body.originalMessage.trim()
          : (
              typeof body.message === "string"
                ? body.message.trim()
                : ""
            ),

      deterministicMessage:
        typeof body.deterministicMessage === "string"
          ? body.deterministicMessage.trim()
          : (
              typeof body.message === "string"
                ? body.message.trim()
                : ""
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

async function buildResponse(
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

  /*
   * Le builder vient de calculer et d'écrire
   * commercialAuthorization dans la session.
   *
   * Sauvegarde explicite côté serveur.
   */
  await saveSession(
    result.session,
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
        await diagnosticSessionStore.get(
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

            const semanticResponse =
        body.originalMessage.length > 0
          ? await semanticComplaintProvider
              .interpretComplaint({
                originalText:
                  body.originalMessage,
              })
          : {
              evidences: [],
            };

      const complaintUnderstanding =
        body.deterministicMessage.length > 0 ||
        body.originalMessage.length > 0
          ? understandAutomotiveComplaint({
              originalText:
                body.originalMessage,

              deterministicText:
                body.deterministicMessage,

              semanticResponse,
            })
          : null;

      const internalClarification =
        complaintUnderstanding
          ? buildComplaintClarification(
              complaintUnderstanding
                .admission,
              complaintUnderstanding
                .conflictGuard,
            )
          : {
              required:
                false,

              items: [],
            };

      await pendingComplaintClarificationStore.save(
        body.sessionId,
        internalClarification,
      );

      const clarification =
        presentComplaintClarification(
          internalClarification,
        );

      const pendingClarification =
        await pendingComplaintClarificationStore.get(
          body.sessionId,
        );

      const clarificationResponse =
        {
          ...clarification,

          clarificationToken:
            pendingClarification
              ?.clarificationToken ?? null,
        };

      const initialEvidenceIds =
        Array.from(
          new Set([
            ...(body.evidenceIds ?? []),
            ...(
              complaintUnderstanding
                ?.conflictGuard
                .admittedEvidenceIds ?? []
            ),
          ]),
        );

      const result =
        diagnosticEngine.createSession(
          body.sessionId,
          body.profile,
          body.domain,
          initialEvidenceIds,
        );

      await saveSession(
        result.session,
      );

      const diagnosticResponse =
        await buildResponse(
          result,
          body.domain,
        );

      return NextResponse.json(
        {
          ...diagnosticResponse,

          clarification: clarificationResponse,
        },
        {

          status:
            201,

        },
      );

    }

    const session =
      await diagnosticSessionStore.get(
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
      body.command ===
        "resolve-clarification"
    ) {

      const pending =
        await pendingComplaintClarificationStore.get(
          body.sessionId,
        );

      if (!pending) {
        return NextResponse.json(
          {
            error:
              "Aucune clarification en attente pour cette session.",
          },
          {
            status:
              409,
          },
        );
      }

      if (
        pending.clarificationToken !==
          body.clarificationToken
      ) {
        return NextResponse.json(
          {
            error:
              "Jeton de clarification invalide ou deja utilise.",
          },
          {
            status:
              409,
          },
        );
      }

      let resolution;

      try {
        resolution =
          resolveComplaintClarification(
            pending.clarification,
            body.choice,
          );
      } catch (error) {
        return NextResponse.json(
          {
            error:
              error instanceof Error
                ? error.message
                : "Resolution de clarification invalide.",
          },
          {
            status:
              400,
          },
        );
      }

      let result =
        diagnosticEngine.evaluateSession(
          session,
          body.domain,
        );

      for (
        const evidenceId of
          resolution.confirmedEvidenceIds
      ) {
        result =
          diagnosticEngine.confirmUserTextEvidence(
            result.session,
            body.domain,
            evidenceId,
          );
      }

      await saveSession(
        result.session,
      );

      const updated =
        await pendingComplaintClarificationStore.update(
          body.sessionId,
          resolution.remainingClarification,
        );

      if (!updated) {
        return NextResponse.json(
          {
            error:
              "Etat de clarification introuvable.",
          },
          {
            status:
              409,
          },
        );
      }

      const nextPending =
        await pendingComplaintClarificationStore.get(
          body.sessionId,
        );

      const nextClarification =
        presentComplaintClarification(
          resolution.remainingClarification,
        );

      return NextResponse.json(
        {
          ...(await buildResponse(
            result,
            body.domain,
          )),

          clarification: {
            ...nextClarification,

            clarificationToken:
              nextPending
                ?.clarificationToken ?? null,
          },
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

      await saveSession(
        result.session,
      );

      return NextResponse.json(
        await buildResponse(
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

      await saveSession(
        result.session,
      );

      return NextResponse.json(
        await buildResponse(
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

    await saveSession(
      result.session,
    );

    return NextResponse.json(
      await buildResponse(
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
