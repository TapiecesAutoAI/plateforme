"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import {
  resolveToolOperation,
} from "../../../lib/tools/ToolOperationResolver";

import type {
  ToolOperationId,
} from "../../../lib/tools/ToolOperationResolver";

import {
  technicalDataProvider,
} from "../../../lib/technical";

import type {
  TechnicalDataResult,
} from "../../../lib/technical";

import type {
  ToolKnowledgeRecord,
} from "../../../lib/tools/ToolKnowledgeBase";

import {
  readStoredShowroomTechnicalVehicle,
} from "../../../lib/showroom/ShowroomVehicleTechnicalAdapter";

import {
  mergeTechnicalVehicle,
  parseVehicleFromText,
} from "../../../lib/vehicle/VehiclePhraseParser";

import {
  vehicleIdentityProvider,
} from "../../../lib/vehicle/vehicleIdentity";

type Role =
  | "user"
  | "assistant";

type ToolRecommendation = {
  name: string;

  priority:
    | "required"
    | "recommended"
    | "optional"
    | "special";

  specification?: string;

  specifications?: Array<{
    label: string;
    value: string;
  }>;

  reason?: string;

  manufacturerReference?: string;
};

type Message = {
  id: number;
  role: Role;
  text: string;
  tools?: ToolRecommendation[];
};

type ToolIntent =
  | "none"
  | "maintenance"
  | "oil-filter"
  | "wheel"
  | "mechanical"
  | "electrical";

type ConversationState = {
  intent: ToolIntent;
  step: number;
};

type Inspiration = {
  id: string;
  icon: string;
  title: string;
  prompt: string;
  className: string;
  imageUrl: string;
};

type SavedConversation = {
  messages: Message[];
  conversation: ConversationState;
  suggestions: string[];

  pendingOperation:
    | ToolOperationId
    | null;

  pendingVehicleText:
    string;

  nextId: number;
};

const STORAGE_KEY =
  "tapiecesauto-quick-tools-conversation-v4";

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    role: "assistant",
    text:
      "Bonjour. Dites-moi simplement ce que vous voulez faire. Je vous proposerai uniquement l'outillage utile pour l'operation.",
  },
];

const INITIAL_SUGGESTIONS = [
  "Faire une vidange",
  "Demonter un filtre a huile",
  "Demonter une roue",
  "Tester une batterie",
];

const INSPIRATIONS: Inspiration[] = [
  {
    id: "maintenance",
    icon: "\u{1F6E2}\u{FE0F}",
    title: "Entretien & vidange",
    prompt: "Je veux faire une vidange",
    className:
      "from-emerald-950/90 via-emerald-700/60 to-slate-950/90",
    imageUrl:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "wheel",
    icon: "\u{1F6DE}",
    title: "Roues & pneus",
    prompt: "Je veux demonter une roue",
    className:
      "from-orange-950/90 via-orange-700/60 to-slate-950/90",
    imageUrl:
      "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "mechanical",
    icon: "\u{1F527}",
    title: "Mecanique",
    prompt: "Je cherche de l'outillage mecanique",
    className:
      "from-blue-950/90 via-blue-700/60 to-slate-950/90",
    imageUrl:
      "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "electrical",
    icon: "\u26A1",
    title: "Electricite & diagnostic",
    prompt: "Je veux tester un probleme electrique",
    className:
      "from-indigo-950/90 via-indigo-700/60 to-slate-950/90",
    imageUrl:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=85",
  },
];

function knowledgeToRecommendations(
  knowledge: ToolKnowledgeRecord,
): ToolRecommendation[] {

  return knowledge.tools
    .slice(0, 5)
    .map(
      tool => ({
        name:
          tool.name,

        priority:
          tool.priority,

        specification:
          tool.specification,

        specifications:
          tool.specifications,

        reason:
          tool.reason,

        manufacturerReference:
          tool.manufacturerReference,
      }),
    );
}

function getPriorityLabel(
  priority: ToolRecommendation["priority"],
): string {

  if (
    priority === "required"
  ) {
    return "OBLIGATOIRE";
  }

  if (
    priority === "recommended"
  ) {
    return "RECOMMANDE";
  }

  if (
    priority === "special"
  ) {
    return "SPECIFIQUE";
  }

  return "OPTIONNEL";
}

function getPriorityClassName(
  priority: ToolRecommendation["priority"],
): string {

  if (
    priority === "required"
  ) {
    return "bg-red-100 text-red-800 border-red-200";
  }

  if (
    priority === "recommended"
  ) {
    return "bg-blue-100 text-blue-800 border-blue-200";
  }

  if (
    priority === "special"
  ) {
    return "bg-violet-100 text-violet-800 border-violet-200";
  }

  return "bg-slate-100 text-slate-700 border-slate-200";
}

function normalize(
  value: string,
): string {

  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .trim()
    .toLowerCase();
}

function detectIntent(
  value: string,
): ToolIntent {

  const text =
    normalize(
      value,
    );

  if (
    text.includes("filtre a huile") ||
    (
      text.includes("filtre") &&
      text.includes("huile")
    )
  ) {
    return "oil-filter";
  }

  if (
    text.includes("roue") ||
    text.includes("boulon de roue") ||
    text.includes("ecrou de roue") ||
    text.includes("demonter un pneu")
  ) {
    return "wheel";
  }

  if (
    text.includes("vidange") ||
    text.includes("entretien") ||
    text.includes("huile moteur")
  ) {
    return "maintenance";
  }

  if (
    text.includes("batterie") ||
    text.includes("multimetre") ||
    text.includes("electri") ||
    text.includes("fusible") ||
    text.includes("tension")
  ) {
    return "electrical";
  }

  if (
    text.includes("outil") ||
    text.includes("cle") ||
    text.includes("douille") ||
    text.includes("pince") ||
    text.includes("tournevis") ||
    text.includes("mecani") ||
    text.includes("repar")
  ) {
    return "mechanical";
  }

  return "none";
}

export default function ToolsQuickPurchasePage() {

  const [
    input,
    setInput,
  ] = useState("");

  const [
    messages,
    setMessages,
  ] = useState<Message[]>(
    INITIAL_MESSAGES,
  );

  const [
    conversation,
    setConversation,
  ] = useState<ConversationState>({
    intent: "none",
    step: 0,
  });

  const [
    suggestions,
    setSuggestions,
  ] = useState<string[]>(
    INITIAL_SUGGESTIONS,
  );

  const [
    pendingOperation,
    setPendingOperation,
  ] = useState<ToolOperationId | null>(
    null,
  );

  const [
    pendingVehicleText,
    setPendingVehicleText,
  ] = useState("");

  const [
    hydrated,
    setHydrated,
  ] = useState(false);

  const nextId =
    useRef(2);

  const chatEnd =
    useRef<HTMLDivElement | null>(
      null,
    );

  useEffect(
    () => {

      try {

        const raw =
          window.localStorage.getItem(
            STORAGE_KEY,
          );

        if (raw) {

          const saved =
            JSON.parse(
              raw,
            ) as Partial<SavedConversation>;

          if (
            Array.isArray(saved.messages) &&
            saved.messages.length > 0
          ) {
            setMessages(
              saved.messages,
            );
          }

          if (
            saved.conversation &&
            typeof saved.conversation.step === "number"
          ) {
            setConversation(
              saved.conversation,
            );
          }

          if (
            Array.isArray(saved.suggestions)
          ) {
            setSuggestions(
              saved.suggestions,
            );
          }

          if (
            saved.pendingOperation
          ) {
            setPendingOperation(
              saved.pendingOperation,
            );
          }

          if (
            typeof saved.pendingVehicleText === "string"
          ) {
            setPendingVehicleText(
              saved.pendingVehicleText,
            );
          }

          if (
            typeof saved.nextId === "number"
          ) {
            nextId.current =
              saved.nextId;
          }
        }

      } catch {

        window.localStorage.removeItem(
          STORAGE_KEY,
        );
      }

      setHydrated(true);

    },
    [],
  );

  useEffect(
    () => {

      if (!hydrated) {
        return;
      }

      const saved: SavedConversation = {
        messages,
        conversation,
        suggestions,

        pendingOperation,

        pendingVehicleText,

        nextId:
          nextId.current,
      };

      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(saved),
      );

    },
    [
      hydrated,
      messages,
      conversation,
      suggestions,
      pendingOperation,
      pendingVehicleText,
    ],
  );

  useEffect(
    () => {

      chatEnd.current?.scrollIntoView({
        behavior: "smooth",
      });

    },
    [
      messages,
    ],
  );

  function addMessage(
    role: Role,
    text: string,
    tools?: ToolRecommendation[],
  ) {

    setMessages(
      previous => [
        ...previous,
        {
          id:
            nextId.current++,
          role,
          text,
          tools,
        },
      ],
    );
  }

  function assistant(
    text: string,
    choices: string[] = [],
    tools?: ToolRecommendation[],
  ) {

    window.setTimeout(
      () => {

        addMessage(
          "assistant",
          text,
          tools,
        );

        setSuggestions(
          choices,
        );

      },
      180,
    );
  }

  function finishWithTools(
    text: string,
    tools: ToolRecommendation[],
  ) {

    setConversation({
      intent: "none",
      step: 0,
    });

    setSuggestions([]);

    assistant(
      text,
      [],
      tools.slice(0, 5),
    );
  }

  function extractVin(
    value: string,
  ): string | undefined {

    const match =
      value
        .toUpperCase()
        .match(
          /\b[A-HJ-NPR-Z0-9]{17}\b/,
        );

    return match?.[0];
  }
  async function resolveVehicleFromVin(
    value: string,
  ) {

    const vin =
      extractVin(
        value,
      );

    if (!vin) {
      return undefined;
    }

    return vehicleIdentityProvider.resolveVin(
      vin,
    );
  }



  function buildTechnicalVehicle(
    value: string,
  ) {

    const stored =
      readStoredShowroomTechnicalVehicle();

    const parsed =
      parseVehicleFromText(
        value,
      );

    const merged =
      mergeTechnicalVehicle(
        stored,
        parsed,
      );

    const vin =
      extractVin(
        value,
      ) ??
      stored?.vin;

    return {
      ...merged,
      vin,
    };
  }

  async function resumeVehicleSpecificOperation() {

    if (!pendingOperation) {

      assistant(
        "Je n'ai pas d'operation specifique en attente.",
      );

      return;
    }

    const vehicle =
      buildTechnicalVehicle(
        pendingVehicleText,
      );

    const hasUsefulVehicleData =
      Boolean(
        vehicle.vin ||
        vehicle.make ||
        vehicle.model ||
        vehicle.generation ||
        vehicle.engineName ||
        vehicle.year
      );

    if (!hasUsefulVehicleData) {

      assistant(
        "Je n'ai pas encore assez d'informations sur le vehicule. Indiquez le VIN si vous l'avez. Sinon, precisez la marque, le modele et la motorisation, ou selectionnez le vehicule dans le showroom.",
        [
          "Je vais preciser le vehicule",
          "Annuler",
        ],
      );

      return;
    }

    const result =
      await technicalDataProvider.resolveTools({
        operation:
          pendingOperation,

        vehicle,
      });

    if (
      result.status === "found"
    ) {

      setPendingOperation(
        null,
      );

      if (
        result.record.tools.length === 0
      ) {

        assistant(
          "Le vehicule est bien reconnu, mais la donnee technique exacte de cet outillage n'est pas encore disponible dans notre source verifiee. Je ne vais pas inventer une dimension ou une reference.",
        );

        return;
      }

      finishWithTools(
        result.record.title,
        knowledgeToRecommendations(
          result.record,
        ),
      );

      return;
    }

    if (
      result.status === "vehicle-required"
    ) {

      assistant(
        `Le vehicule est partiellement connu, mais il manque encore : ${result.missing.join(", ")}.`,
        [
          "Annuler",
        ],
      );

      return;
    }

    assistant(
      "Le vehicule est reconnu, mais aucune donnee technique verifiee n'est encore disponible pour cette operation. Je ne proposerai pas d'outil au hasard.",
    );
  }

  async function showKnowledge(
    operation:
      Parameters<typeof technicalDataProvider.resolveTools>[0]["operation"],
    fallbackText: string,
  ) {

    const vehicle =
      readStoredShowroomTechnicalVehicle();

    const result: TechnicalDataResult =
      await technicalDataProvider.resolveTools({
        operation,
        vehicle,
      });

    if (
      result.status === "vehicle-required"
    ) {

      assistant(
        `Cette operation demande une identification plus precise du vehicule. Informations necessaires : ${result.missing.join(", ")}.`,
        [
          "Identifier mon vehicule",
          "Je vais preciser le vehicule",
        ],
      );

      return;
    }

    if (
      result.status === "not-found"
    ) {

      assistant(
        fallbackText,
      );

      return;
    }

    finishWithTools(
      result.record.title,
      knowledgeToRecommendations(
        result.record,
      ),
    );
  }

  async function startIntent(
    intent: ToolIntent,
  ) {

    if (
      intent === "oil-filter"
    ) {

      await showKnowledge(
        "oil-filter-removal",
        "Je n'ai pas encore de referentiel technique disponible pour cette operation.",
      );

      return;
    }

    if (
      intent === "wheel"
    ) {

      await showKnowledge(
        "wheel-removal",
        "Je n'ai pas encore de referentiel technique disponible pour cette operation.",
      );

      return;
    }

    if (
      intent === "maintenance"
    ) {

      setConversation({
        intent,
        step: 1,
      });

      assistant(
        "Quel entretien voulez-vous effectuer ?",
        [
          "Faire une vidange moteur",
          "Demonter un filtre a huile",
          "Changer un filtre",
          "Autre entretien",
        ],
      );

      return;
    }

    if (
      intent === "electrical"
    ) {

      setConversation({
        intent,
        step: 1,
      });

      assistant(
        "Que voulez-vous controler ?",
        [
          "Tester la batterie",
          "Tester l'alternateur",
          "Controler un fusible",
          "Chercher une panne electrique",
        ],
      );

      return;
    }

    if (
      intent === "mechanical"
    ) {

      setConversation({
        intent,
        step: 1,
      });

      assistant(
        "Dites-moi plutot l'operation que vous voulez effectuer. Je pourrai alors vous proposer quelques outils adaptes.",
        [
          "Demonter un filtre a huile",
          "Demonter une roue",
          "Faire une vidange",
          "Autre operation",
        ],
      );

      return;
    }

    assistant(
      "Je n'ai pas encore bien compris l'operation. Dites-moi par exemple : demonter un filtre a huile, demonter une roue, faire une vidange ou tester une batterie.",
      INITIAL_SUGGESTIONS,
    );
  }

  async function continueConversation(
    value: string,
  ) {

    const text =
      normalize(
        value,
      );

    if (
      conversation.intent === "maintenance" &&
      conversation.step === 1
    ) {

      if (
        text.includes("vidange")
      ) {

        await showKnowledge(
          "oil-change",
          "Je n'ai pas encore de referentiel technique disponible pour cette operation.",
        );

        return;
      }

      if (
        text.includes("filtre")
      ) {

        await showKnowledge(
          "oil-filter-removal",
          "Je n'ai pas encore de referentiel technique disponible pour cette operation.",
        );

        return;
      }

      setConversation({
        intent: "maintenance",
        step: 2,
      });

      assistant(
        "Decrivez l'operation plus precisement et je chercherai l'outillage correspondant.",
        [],
      );

      return;
    }

    if (
      conversation.intent === "maintenance" &&
      conversation.step === 2
    ) {

      const detected =
        detectIntent(
          value,
        );

      if (
        detected !== "none"
      ) {

        await startIntent(
          detected,
        );

        return;
      }

      assistant(
        "Je n'ai pas encore assez d'informations. Dites-moi simplement quelle piece ou quel element vous voulez demonter, controler ou remplacer.",
      );

      return;
    }

    if (
      conversation.intent === "electrical" &&
      conversation.step === 1
    ) {

      if (
        text.includes("batterie")
      ) {

        await showKnowledge(
          "battery-test",
          "Je n'ai pas encore de referentiel technique disponible pour cette operation.",
        );

        return;
      }

      if (
        text.includes("alternateur")
      ) {

        await showKnowledge(
          "alternator-test",
          "Je n'ai pas encore de referentiel technique disponible pour ce controle.",
        );

        return;
      }

      if (
        text.includes("fusible")
      ) {

        await showKnowledge(
          "fuse-test",
          "Je n'ai pas encore de referentiel technique disponible pour ce controle.",
        );

        return;
      }

      await showKnowledge(
        "electrical-diagnosis",
        "Je n'ai pas encore de referentiel technique disponible pour cette recherche.",
      );

      return;
    }

    if (
      conversation.intent === "mechanical"
    ) {

      const detected =
        detectIntent(
          value,
        );

      if (
        detected !== "none" &&
        detected !== "mechanical"
      ) {

        await startIntent(
          detected,
        );

        return;
      }

      assistant(
        "Indiquez-moi l'operation precise : par exemple demonter une rotule, retirer un roulement, demonter une roue ou desserrer un filtre a huile.",
      );

      return;
    }

    startIntent(
      detectIntent(
        value,
      ),
    );
  }

  async function send(
    value: string,
  ) {

    const clean =
      value.trim();

    if (!clean) {
      return;
    }

    addMessage(
      "user",
      clean,
    );

    setInput("");
    setSuggestions([]);

    /*
     * Une nouvelle operation clairement reconnue
     * est prioritaire sur un ancien sous-parcours.
     *
     * Exemple :
     * "tester ma batterie"
     * puis
     * "demonter un cardan Golf 4"
     *
     * Le cardan ne doit jamais etre interprete
     * comme une reponse au parcours batterie.
     */
    const directOperation =
      resolveToolOperation(
        clean,
      );

    /*
     * Une nouvelle operation clairement reconnue
     * annule le contexte technique precedent.
     *
     * Exemples :
     * cardan -> puis roue
     * cardan -> puis distribution
     */
    if (
      directOperation.operation !== "unknown" &&
      pendingOperation &&
      directOperation.operation !== pendingOperation
    ) {

      setPendingOperation(
        null,
      );

      setPendingVehicleText(
        "",
      );
    }

    if (
      conversation.intent !== "none" &&
      directOperation.kind === "universal" &&
      directOperation.operation !== "unknown"
    ) {

      setConversation({
        intent: "none",
        step: 0,
      });

      await showKnowledge(
        directOperation.operation,
        "Je n'ai pas encore de referentiel technique disponible pour cette operation.",
      );

      return;
    }

    if (
      conversation.intent !== "none" &&
      directOperation.kind === "vehicle-specific"
    ) {

      setConversation({
        intent: "none",
        step: 0,
      });

      setPendingOperation(
        directOperation.operation,
      );

      setPendingVehicleText(
        clean,
      );

      const vehicle =
        buildTechnicalVehicle(
          clean,
        );

        if (
          vehicle.vin
        ) {

          const vinResult =
            await vehicleIdentityProvider.resolveVin(
              vehicle.vin,
            );

          if (
            vinResult.status === "found"
          ) {

            Object.assign(
              vehicle,
              vinResult.vehicle,
            );
          }

          if (
            vinResult.status === "provider-unavailable"
          ) {

            setPendingVehicleText(
              previous =>
                `${previous} VIN ${vehicle.vin}`.trim(),
            );

            assistant(
              "VIN bien recu. Le decodage automatique VIN n'est pas encore connecte a TecDoc. Je conserve ce VIN. En attendant cette connexion, vous pouvez aussi me donner les informations techniques manquantes manuellement.",
              [
                "Annuler",
              ],
            );

            return;
          }
        }

      const result =
        await technicalDataProvider.resolveTools({
          operation:
            directOperation.operation,

          vehicle,
        });

      if (
        result.status === "found"
      ) {

        setPendingOperation(
          null,
        );

        setPendingVehicleText(
          "",
        );

        if (
          result.record.tools.length === 0
        ) {

          assistant(
            "Le vehicule est reconnu, mais la donnee technique exacte pour cet outillage n'est pas encore disponible dans notre source verifiee. Je ne vais pas inventer une dimension ou une reference.",
          );

          return;
        }

        finishWithTools(
          result.record.title,
          knowledgeToRecommendations(
            result.record,
          ),
        );

        return;
      }

      if (
        result.status === "vehicle-required"
      ) {

        assistant(
          `J'ai deja compris une partie du vehicule. Il manque encore : ${result.missing.join(", ")}.`,
        );

        return;
      }

      assistant(
        "Le vehicule est reconnu, mais aucune donnee technique verifiee n'est encore disponible pour cette operation. Je ne proposerai pas d'outil au hasard.",
      );

      return;
    }

    if (
      conversation.intent === "none"
    ) {

      const normalized =
        normalize(
          clean,
        );

      if (
        pendingOperation &&
        (
          normalized.includes("identifie le vehicule") ||
          normalized.includes("complete le vehicule") ||
          normalized.includes("vehicule est identifie")
        )
      ) {

        assistant(
          "Pour continuer, indiquez directement les informations manquantes dans votre message, ou donnez le numero VIN. Dire seulement que le vehicule est complete ne m'apporte pas de nouvelle donnee.",
          [
            "Annuler",
          ],
        );

        return;
      }

      if (
        pendingOperation &&
        normalized === "annuler"
      ) {

        setPendingOperation(
          null,
        );

        setPendingVehicleText(
          "",
        );

        assistant(
          "D'accord. L'operation specifique a ete annulee.",
          INITIAL_SUGGESTIONS,
        );

        return;
      }

      if (
        pendingOperation &&
        directOperation.operation === "unknown" &&
        !normalized.includes("identifie le vehicule") &&
        !normalized.includes("complete le vehicule")
      ) {

        setPendingVehicleText(
          previous =>
            `${previous} ${clean}`.trim(),
        );

        const vehicle =
          buildTechnicalVehicle(
            `${pendingVehicleText} ${clean}`,
          );

        const result =
          await technicalDataProvider.resolveTools({
            operation:
              pendingOperation,

            vehicle,
          });

        if (
          result.status === "found"
        ) {

          setPendingOperation(
            null,
          );

          setPendingVehicleText(
            "",
          );

          if (
            result.record.tools.length === 0
          ) {

            assistant(
              "Le vehicule est maintenant suffisamment identifie, mais la donnee technique exacte de cet outillage n'est pas encore disponible dans notre source verifiee. Je ne vais pas inventer une dimension ou une reference.",
            );

            return;
          }

          finishWithTools(
            result.record.title,
            knowledgeToRecommendations(
              result.record,
            ),
          );

          return;
        }

        if (
          result.status === "vehicle-required"
        ) {

          assistant(
            `J'ai deja une partie des informations. Il manque encore : ${result.missing.join(", ")}.`,
          );

          return;
        }

        assistant(
          "Le vehicule est mieux identifie, mais aucune donnee technique verifiee n'est encore disponible pour cette configuration.",
        );

        return;
      }

      const operation =
        resolveToolOperation(
          clean,
        );

      /*
       * Operation universelle reconnue :
       * aucune question supplementaire inutile.
       */
      if (
        operation.kind === "universal" &&
        operation.operation !== "unknown"
      ) {

        await showKnowledge(
          operation.operation,
          "Je n'ai pas encore de referentiel technique disponible pour cette operation.",
        );

        return;
      }

      /*
       * Operation specifique :
       * on memorise l'operation pendant
       * l'identification du vehicule.
       */
      if (
        operation.kind === "vehicle-specific"
      ) {

        setPendingOperation(
          operation.operation,
        );

        setPendingVehicleText(
          clean,
        );

        const vehicle =
          buildTechnicalVehicle(
            clean,
          );

        if (
          vehicle.vin
        ) {

          const vinResult =
            await vehicleIdentityProvider.resolveVin(
              vehicle.vin,
            );

          if (
            vinResult.status === "found"
          ) {

            Object.assign(
              vehicle,
              vinResult.vehicle,
            );
          }

          if (
            vinResult.status === "provider-unavailable"
          ) {

            setPendingVehicleText(
              previous =>
                `${previous} VIN ${vehicle.vin}`.trim(),
            );

            assistant(
              "VIN bien recu. Le decodage automatique VIN n'est pas encore connecte a TecDoc. Je conserve ce VIN. En attendant cette connexion, vous pouvez aussi me donner les informations techniques manquantes manuellement.",
              [
                "Annuler",
              ],
            );

            return;
          }
        }

        const hasUsefulVehicleData =
          Boolean(
            vehicle.vin ||
            vehicle.make ||
            vehicle.model ||
            vehicle.generation ||
            vehicle.engineName ||
            vehicle.year
          );

        if (!hasUsefulVehicleData) {

          assistant(
            "Cette operation demande un outillage specifique au vehicule. Si vous avez le VIN, indiquez-le directement. Sinon, precisez la marque, le modele et la motorisation, ou selectionnez le vehicule dans le showroom.",
            [
              "Je vais preciser le vehicule",
              "Annuler",
            ],
          );

          return;
        }

        const technicalResult =
          await technicalDataProvider.resolveTools({
            operation:
              operation.operation,

            vehicle,
          });

        if (
          technicalResult.status === "found"
        ) {

          setPendingOperation(
            null,
          );

          if (
            technicalResult.record.tools.length === 0
          ) {

            assistant(
              "Le vehicule est reconnu, mais la donnee technique exacte pour cet outillage n'est pas encore disponible dans notre source verifiee. Je ne vais pas inventer une dimension ou une reference.",
            );

            return;
          }

          finishWithTools(
            technicalResult.record.title,
            knowledgeToRecommendations(
              technicalResult.record,
            ),
          );

          return;
        }

        if (
          technicalResult.status === "vehicle-required"
        ) {

          assistant(
            `Le vehicule est deja partiellement connu. Il manque encore : ${technicalResult.missing.join(", ")}.`,
            [
              "Annuler",
            ],
          );

          return;
        }

        assistant(
          "Le vehicule est reconnu, mais aucune donnee technique verifiee n'est encore disponible pour cette operation. Je ne proposerai pas d'outil au hasard.",
        );

        return;
      }

      await startIntent(
        detectIntent(
          clean,
        ),
      );

      return;
    }

    await continueConversation(
      clean,
    );
  }

  async function submit(
    event:
      FormEvent<HTMLFormElement>,
  ) {

    event.preventDefault();

    await send(
      input,
    );
  }

  function restartConversation() {

    nextId.current = 2;

    setMessages(
      INITIAL_MESSAGES,
    );

    setConversation({
      intent: "none",
      step: 0,
    });

    setSuggestions(
      INITIAL_SUGGESTIONS,
    );

    setInput("");

    setPendingOperation(
      null,
    );

    setPendingVehicleText(
      "",
    );

    window.localStorage.removeItem(
      STORAGE_KEY,
    );
  }

  return (
    <main className="h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 text-slate-950">

      <div className="mx-auto flex h-full max-w-7xl flex-col px-5 py-5">

        <header className="flex shrink-0 items-center justify-between gap-5">

          <div>

            <div className="text-sm font-bold text-blue-700">
              Ta Pieces Auto AI
            </div>

            <h1 className="text-2xl font-black">
              Outillage
            </h1>

          </div>

          <div className="flex gap-2">

            <button
              type="button"
              onClick={restartConversation}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold shadow-sm"
            >
              Recommencer
            </button>

            <Link
              href="/showroom"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold shadow-sm"
            >
              Retour
            </Link>

          </div>

        </header>

        <div className="mt-5 grid min-h-0 flex-1 gap-5 lg:grid-cols-[330px_1fr]">

          <aside className="hidden min-h-0 flex-col lg:flex">

            <div className="mb-3">

              <h2 className="font-black">
                Que voulez-vous faire ?
              </h2>

              <p className="text-sm text-slate-500">
                Choisissez une operation ou expliquez votre besoin.
              </p>

            </div>

            <div className="grid flex-1 grid-cols-2 gap-3">

              {
                INSPIRATIONS.map(
                  item => (

                    <button
                      key={item.id}
                      type="button"
                      onClick={
                        () =>
                          void send(
                            item.prompt,
                          )
                      }
                      className="group relative min-h-[150px] overflow-hidden rounded-2xl text-left text-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >

                      <img
                        src={item.imageUrl}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />

                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${item.className}`}
                      />

                      <div className="absolute inset-0 bg-black/10 transition group-hover:bg-black/0" />

                      <div className="relative flex h-full min-h-[150px] flex-col justify-end p-5">

                        <div className="mb-auto text-3xl drop-shadow">
                          {item.icon}
                        </div>

                        <div className="text-xl font-black drop-shadow-md">
                          {item.title}
                        </div>

                        <div className="mt-1 text-xs font-semibold text-white/80">
                          Touchez pour commencer
                        </div>

                      </div>

                    </button>

                  ),
                )
              }

            </div>

            <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-100/80 p-4 text-sm font-semibold text-blue-950 shadow-sm">
              Pas besoin d'identifier le vehicule lorsque l'outillage est universel.
            </div>

          </aside>

          <section className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-xl">

            <div className="border-b border-blue-100 bg-gradient-to-r from-blue-950 via-blue-900 to-blue-700 px-6 py-4 text-white">

              <h2 className="font-black">
                Assistant Ta Pieces Auto
              </h2>

              <p className="text-sm text-blue-100">
                Expliquez simplement l'operation que vous voulez effectuer.
              </p>

            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">

              <div className="space-y-4">

                {
                  messages.map(
                    message => (

                      <div
                        key={message.id}
                        className={
                          message.role === "user"
                            ? "flex justify-end"
                            : "flex justify-start"
                        }
                      >

                        <div
                          className={
                            message.role === "user"
                              ? "max-w-[75%] rounded-2xl rounded-br-md bg-blue-700 px-5 py-3 text-white"
                              : "max-w-[82%] rounded-2xl rounded-bl-md bg-slate-100 px-5 py-3 leading-6 text-slate-800"
                          }
                        >

                          <div>
                            {message.text}
                          </div>

                          {
                            message.tools &&
                            message.tools.length > 0 && (

                              <div className="mt-4 space-y-3">

  {
    message.tools.map(
      (
        tool,
        index,
      ) => (

        <div
          key={`${message.id}-${tool.name}`}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >

          <div className="flex items-start gap-3">

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-black text-white">
              {index + 1}
            </div>

            <div className="min-w-0 flex-1">

              <div className="flex flex-wrap items-center gap-2">

                <div className="font-black text-slate-950">
                  {tool.name}
                </div>

                <span
                  className={`rounded-full border px-2 py-1 text-[10px] font-black tracking-wide ${getPriorityClassName(tool.priority)}`}
                >
                  {getPriorityLabel(tool.priority)}
                </span>

              </div>

              {
                tool.specification && (

                  <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-800">
                    Specification : {tool.specification}
                  </div>

                )
              }

              {
                tool.specifications &&
                tool.specifications.length > 0 && (

                  <div className="mt-2 grid gap-2 sm:grid-cols-2">

                    {
                      tool.specifications.map(
                        spec => (

                          <div
                            key={`${tool.name}-${spec.label}`}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                          >

                            <div className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                              {spec.label}
                            </div>

                            <div className="mt-1 text-sm font-black text-slate-900">
                              {spec.value}
                            </div>

                          </div>

                        ),
                      )
                    }

                  </div>

                )
              }

              {
                tool.manufacturerReference && (

                  <div className="mt-2 text-sm font-semibold text-violet-800">
                    Reference technique : {tool.manufacturerReference}
                  </div>

                )
              }

              {
                tool.reason && (

                  <div className="mt-2 text-sm leading-5 text-slate-600">
                    {tool.reason}
                  </div>

                )
              }

            </div>

          </div>

        </div>

      ),
    )
  }

</div>

)
}

                        </div>

                      </div>

                    ),
                  )
                }

                {
                  suggestions.length > 0 && (

                    <div className="flex flex-wrap gap-2 pt-1">

                      {
                        suggestions.map(
                          suggestion => (

                            <button
                              key={suggestion}
                              type="button"
                              onClick={
                                () =>
                                  void send(
                                    suggestion,
                                  )
                              }
                              className="rounded-full border-2 border-blue-300 bg-white px-4 py-2 text-sm font-bold text-blue-950 shadow-sm transition hover:border-blue-700 hover:bg-blue-700 hover:text-white"
                            >
                              {suggestion}
                            </button>

                          ),
                        )
                      }

                    </div>

                  )
                }

                <div ref={chatEnd} />

              </div>

            </div>

            <form
              onSubmit={submit}
              className="shrink-0 border-t border-blue-100 bg-slate-50 p-4"
            >

              <div className="flex gap-3">

                <input
                  value={input}
                  onChange={
                    event =>
                      setInput(
                        event.target.value,
                      )
                  }
                  placeholder="Exemple : je veux demonter mon filtre a huile..."
                  className="min-w-0 flex-1 rounded-2xl border border-slate-300 px-5 py-4 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="submit"
                  className="rounded-2xl bg-gradient-to-r from-blue-800 to-blue-600 px-7 font-black text-white shadow-md transition hover:from-blue-900 hover:to-blue-700"
                >
                  Envoyer
                </button>

              </div>

            </form>

          </section>

        </div>

      </div>

    </main>
  );
}