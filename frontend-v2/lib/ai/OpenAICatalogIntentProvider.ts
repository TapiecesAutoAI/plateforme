import {
  OpenAI,
} from "openai";

import {
  zodTextFormat,
} from "openai/helpers/zod";

import {
  z,
} from "zod/v4";


const catalogIntentSchema =
  z.object({
    understood:
      z.boolean(),

    normalizedQuery:
      z.string(),

    category:
      z.string()
        .nullable(),

    target:
      z.string()
        .nullable(),

    action:
      z.string()
        .nullable(),

    effect:
      z.string()
        .nullable(),

    productType:
      z.string()
        .nullable(),

    keywords:
      z.array(
        z.string(),
      )
        .max(8),

    confidence:
      z.number()
        .min(0)
        .max(1),
  });


export type CatalogIntent =
  z.infer<
    typeof catalogIntentSchema
  >;


export type OpenAICatalogIntentProviderOptions = {
  model?:
    string;
};


export class OpenAICatalogIntentProvider {

  private readonly client:
    OpenAI;

  private readonly model:
    string;


  public constructor(
    options:
      OpenAICatalogIntentProviderOptions = {},
  ) {

    this.client =
      new OpenAI();

    this.model =
      options.model ??
      "gpt-5.6-luna";
  }


  public async interpret(
    originalText: string,
  ): Promise<CatalogIntent> {

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
                "Tu es uniquement l'interpréteur linguistique du catalogue automobile TPA.",
                "Tu comprends le besoin exprimé naturellement par le client.",
                "Tu ne choisis jamais un produit commercial.",
                "Tu ne proposes jamais de référence fournisseur.",
                "Tu n'inventes jamais de prix, marque, stock ou disponibilité.",
                "Tu produis uniquement une représentation canonique du besoin.",
                "",
                "Exemples de cibles : pneu, jante, vitre, carrosserie, tableau de bord, siège, batterie, atelier.",
                "Exemples d'actions : nettoyer, protéger, faire briller, réparer, gonfler, mesurer.",
                "Exemples d'effets : brillance, noircissant, dégraissant, protection, anti-odeur.",
                "",
                "normalizedQuery doit être une requête courte et utile pour rechercher dans un catalogue.",
                "Supprime les formulations inutiles comme 'je veux', 'donnez-moi', 'il me faut'.",
                "Conserve les concepts importants et leurs synonymes utiles.",
                "keywords contient uniquement quelques termes réellement utiles à une recherche catalogue.",
                "",
                "Si le texte ne contient pas assez d'information pour identifier un besoin produit, understood=false.",
              ].join("\n"),
          },
          {
            role:
              "user",

            content:
              [
                "TEXTE ORIGINAL CLIENT:",
                originalText,
              ].join("\n"),
          },
        ],

        text: {
          format:
            zodTextFormat(
              catalogIntentSchema,
              "tpa_catalog_intent",
            ),
        },
      });

    const parsed =
      response.output_parsed;

    if (!parsed) {
      return {
        understood: false,
        normalizedQuery: "",
        category: null,
        target: null,
        action: null,
        effect: null,
        productType: null,
        keywords: [],
        confidence: 0,
      };
    }

    return parsed;
  }
}