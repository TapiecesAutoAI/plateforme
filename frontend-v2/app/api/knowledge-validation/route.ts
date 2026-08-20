import fs from "node:fs";
import path from "node:path";

import {
  NextResponse,
} from "next/server";

import {
  KnowledgeLoader,
  KnowledgeValidator,
  type KnowledgeDomain,
  type KnowledgeValidationResult,
} from "../../../engine/knowledge";

type ValidateDomainRequest = {

  command:
    "validate-domain";

  domain:
    KnowledgeDomain;

};

type ValidateAllRequest = {

  command:
    "validate-all";

};

type KnowledgeValidationRequest =
  | ValidateDomainRequest
  | ValidateAllRequest;

interface DomainValidationResponse {

  domain:
    KnowledgeDomain;

  result:
    KnowledgeValidationResult;

}

const loader =
  new KnowledgeLoader();

const validator =
  new KnowledgeValidator();

const supportedDomains:
  readonly KnowledgeDomain[] = [

    "starting",

    "battery",

    "charging",

    "engine",

    "cooling",

    "braking",

    "steering",

    "suspension",

    "transmission",

    "noise",

  ];

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

function parseRequest(
  value:
    unknown,
): KnowledgeValidationRequest {

  if (!isRecord(value)) {

    throw new RequestValidationError(
      "Le corps de la requête doit être un objet JSON.",
    );

  }

  if (
    value.command ===
      "validate-all"
  ) {

    return {
      command:
        "validate-all",
    };

  }

  if (
    value.command ===
      "validate-domain"
  ) {

    if (
      typeof value.domain !== "string" ||
      !supportedDomains.includes(
        value.domain as KnowledgeDomain,
      )
    ) {

      throw new RequestValidationError(
        'Le champ "domain" doit contenir un domaine supporté.',
      );

    }

    return {

      command:
        "validate-domain",

      domain:
        value.domain as KnowledgeDomain,

    };

  }

  throw new RequestValidationError(
    'Commande inconnue. Utilisez "validate-domain" ou "validate-all".',
  );

}

function validateDomain(
  domain:
    KnowledgeDomain,
): DomainValidationResponse {

  const knowledgePackage =
    loader.loadDomain(
      domain,
    );

  return {

    domain,

    result:
      validator.validate(
        knowledgePackage,
      ),

  };

}

function domainHasJsonFiles(
  domain:
    KnowledgeDomain,
): boolean {

  const domainPath =
    path.join(
      process.cwd(),
      "knowledge",
      domain,
    );

  if (!fs.existsSync(domainPath)) {
    return false;
  }

  const requiredFiles = [

    "actions.json",

    "evidences.json",

    "hypotheses.json",

    "rules.json",

    "workflow.json",

  ];

  return requiredFiles.some(
    fileName =>
      fs.existsSync(
        path.join(
          domainPath,
          fileName,
        ),
      ),
  );

}

function summarize(
  validations:
    DomainValidationResponse[],
) {

  const totals =
    validations.reduce(
      (
        accumulator,
        validation,
      ) => {

        accumulator.errors +=
          validation.result.errors.length;

        accumulator.warnings +=
          validation.result.warnings.length;

        accumulator.infos +=
          validation.result.infos.length;

        if (
          validation.result.valid
        ) {
          accumulator.validDomains++;
        } else {
          accumulator.invalidDomains++;
        }

        return accumulator;

      },
      {

        errors:
          0,

        warnings:
          0,

        infos:
          0,

        validDomains:
          0,

        invalidDomains:
          0,

      },
    );

  return {

    domainCount:
      validations.length,

    ...totals,

  };

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
      body.command ===
        "validate-domain"
    ) {

      const validation =
        validateDomain(
          body.domain,
        );

      return NextResponse.json(
        {

          command:
            body.command,

          validation,

        },
      );

    }

    const domains =
      supportedDomains.filter(
        domainHasJsonFiles,
      );

    const validations =
      domains.map(
        validateDomain,
      );

    return NextResponse.json(
      {

        command:
          body.command,

        summary:
          summarize(
            validations,
          ),

        validations,

      },
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
      "Knowledge validation API error:",
      error,
    );

    return NextResponse.json(
      {

        error:
          error instanceof Error
            ? error.message
            : "Erreur interne du validateur de connaissances.",

      },
      {

        status:
          500,

      },
    );

  }

}

export async function GET() {

  const domains =
    supportedDomains.map(
      domain => ({

        domain,

        available:
          domainHasJsonFiles(
            domain,
          ),

      }),
    );

  return NextResponse.json(
    {

      supportedDomains:
        domains,

      commands: [

        {

          command:
            "validate-domain",

          requiredFields: [
            "domain",
          ],

        },

        {

          command:
            "validate-all",

          requiredFields:
            [],

        },

      ],

    },
  );

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
