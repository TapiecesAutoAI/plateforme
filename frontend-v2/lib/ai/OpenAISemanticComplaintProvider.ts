import {
  OpenAI,
} from "openai";

import {
  zodTextFormat,
} from "openai/helpers/zod";

import {
  z,
} from "zod/v4";

import {
  canonicalEvidenceDefinitions,
  isCanonicalEvidenceId,
} from "../../engine/evidence/CanonicalEvidenceRegistry";

import type {
  SemanticComplaintProvider,
  SemanticComplaintProviderRequest,
  SemanticComplaintProviderResponse,
} from "./SemanticComplaintProvider";

const semanticResponseSchema =
  z.object({
    evidences:
      z.array(
        z.object({
          id:
            z.string(),

          confidence:
            z.number()
              .min(0)
              .max(1),

          support:
            z.enum([
              "explicit",
              "normalized",
              "inferred",
            ]),
        }),
      )
        .max(12),
  });

export type OpenAISemanticComplaintProviderOptions = {
  model?:
    string;
};

export class OpenAISemanticComplaintProvider
  implements SemanticComplaintProvider {

  private readonly client:
    OpenAI;

  private readonly model:
    string;

  public constructor(
    options:
      OpenAISemanticComplaintProviderOptions = {},
  ) {

    this.client =
      new OpenAI();

    this.model =
      options.model ??
      "gpt-5.6-luna";
  }

  public async interpretComplaint(
    request:
      SemanticComplaintProviderRequest,
  ): Promise<SemanticComplaintProviderResponse> {

    const vocabulary =
      canonicalEvidenceDefinitions.map(
        definition => ({
          id:
            definition.id,

          definition,
        }),
      );

    const response =
      await this.client.responses.parse({
        model:
          this.model,

        input: [
          {
            role:
              "system",

            content:
              [
                "Tu es uniquement l'interpréteur linguistique automobile de TPA.",
                "Tu ne poses aucun diagnostic.",
                "Tu ne désignes aucune pièce défectueuse.",
                "Tu transformes uniquement les faits exprimés par le client en preuves canoniques TPA.",
                "N'utilise que les identifiants présents dans le vocabulaire fourni.",
                "explicit = le fait est directement exprimé.",
                "normalized = même fait reformulé ou exprimé en langage courant.",
                "inferred = implication plausible mais non directement affirmée ; utilise-la avec prudence.",
                "Une absence d'information, un test non effectué ou 'je ne sais pas' ne constitue pas une preuve positive.",
                "Ne crée jamais d'identifiant.",
                "Si aucun fait fiable n'est identifiable, retourne une liste vide.",
              ].join("\n"),
          },
          {
            role:
              "user",

            content:
              [
                "VOCABULAIRE CANONIQUE TPA:",
                JSON.stringify(
                  vocabulary,
                ),
                "",
                "TEXTE ORIGINAL CLIENT:",
                request.originalText,
              ].join("\n"),
          },
        ],

        text: {
          format:
            zodTextFormat(
              semanticResponseSchema,
              "tpa_semantic_complaint",
            ),
        },
      });

    const parsed =
      response.output_parsed;

    if (!parsed) {
      return {
        evidences: [],
      };
    }

    return {
      evidences:
        parsed.evidences.filter(
          evidence =>
            isCanonicalEvidenceId(
              evidence.id,
            ),
        ),
    };
  }
}