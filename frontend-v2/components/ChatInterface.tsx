"use client";

import UserProfileSelector, {
  type UserProfileType,
} from "./UserProfileSelector";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  apiContent?: string;
  hidden?: boolean;
};

type QuestionOption = {
  id: string;
  label: string;
  value: string;
};

type NextQuestion = {
  id: string;
  text: string;
  reason?: string;
  targetHypotheses?: string[];
  expectedInformationGain?: number;
  options?: QuestionOption[];
};

type DiagnosticResult = {
  title: string;
  confidence: number;
  explanation: string;
  evidence: string[];
  recommendedChecks: string[];
  possibleParts: string[];
  recommendedProcedures: string[];
};

type ChatResponse = {
  message?: string;
  response?: string;
  reply?: string;
  nextQuestion?: NextQuestion | null;
  diagnosisComplete?: boolean;
  diagnostic?: DiagnosticResult | null;
  error?: string;
};

const profileLabels:
  Record<UserProfileType, string> = {
    particulier:
      "Particulier",

    bricoleur:
      "Bricoleur",

    "vendeur-pieces-auto":
      "Vendeur de pièces auto",

    "mecanicien-garage":
      "Mécanicien / Garage",

    depanneur:
      "Dépanneur",

    "etudiant-mecanique":
      "Étudiant en mécanique",

    "autre-professionnel":
      "Autre professionnel",
  };

function createInitialMessages(
  profile: UserProfileType,
): Message[] {
  const profileLabel =
    profileLabels[profile];

  return [
    {
      id:
        "selected-user-profile",

      role:
        "user",

      content:
        `Profil sélectionné : ${profileLabel}`,

      apiContent:
        `Profil utilisateur : ${profileLabel}`,

      hidden:
        true,
    },

    {
      id:
        "initial-assistant-message",

      role:
        "assistant",

      content:
        "Bonjour, je suis l’assistant TapiecesAuto. Décrivez votre problème avec vos propres mots. Je vais vous guider étape par étape.",
    },
  ];
}

function createMessageId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function clampConfidence(
  confidence: number,
): number {
  return Math.max(
    0,
    Math.min(
      Math.round(confidence),
      100,
    ),
  );
}

function DiagnosticSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <section>
      <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </h4>

      <ul className="mt-3 space-y-2">
        {items.map((item, index) => (
          <li
            key={`${title}-${index}-${item}`}
            className="flex items-start gap-3 text-sm leading-6 text-gray-700"
          >
            <span
              aria-hidden="true"
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600"
            />

            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DiagnosticCard({
  diagnostic,
}: {
  diagnostic: DiagnosticResult;
}) {
  const confidence = clampConfidence(
    diagnostic.confidence,
  );

  return (
    <article className="w-full max-w-[92%] overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
      <header className="border-b border-blue-100 bg-blue-50 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
          Diagnostic probable
        </p>

        <h3 className="mt-2 text-xl font-semibold text-gray-950">
          {diagnostic.title}
        </h3>

        <div className="mt-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-gray-600">
              Niveau de confiance
            </span>

            <span className="text-lg font-bold text-blue-800">
              {confidence} %
            </span>
          </div>

          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-blue-100">
            <div
              className="h-full rounded-full bg-blue-700 transition-[width]"
              style={{
                width: `${confidence}%`,
              }}
            />
          </div>
        </div>
      </header>

      <div className="space-y-6 px-6 py-6">
        {diagnostic.explanation && (
          <section>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Explication
            </h4>

            <p className="mt-3 leading-7 text-gray-700">
              {diagnostic.explanation}
            </p>
          </section>
        )}

        <DiagnosticSection
          title="Éléments observés"
          items={diagnostic.evidence}
        />

        <DiagnosticSection
          title="Contrôles recommandés"
          items={
            diagnostic.recommendedChecks
          }
        />

        <DiagnosticSection
          title="Pièces potentiellement concernées"
          items={diagnostic.possibleParts}
        />

        <DiagnosticSection
          title="Procédures recommandées"
          items={
            diagnostic.recommendedProcedures
          }
        />

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm leading-6 text-amber-900">
            Ce diagnostic est une orientation.
            Confirmez la panne par les contrôles
            recommandés avant de remplacer une pièce.
          </p>
        </div>
      </div>
    </article>
  );
}

export default function ChatInterface() {
  const [
    selectedProfile,
    setSelectedProfile,
  ] = useState<UserProfileType | null>(
    null,
  );

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [input, setInput] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [
    currentQuestion,
    setCurrentQuestion,
  ] = useState<NextQuestion | null>(
    null,
  );

  const [diagnostic, setDiagnostic] =
    useState<DiagnosticResult | null>(
      null,
    );

  const conversationEndRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [
    messages,
    currentQuestion,
    diagnostic,
    isLoading,
  ]);

  async function sendMessage(
    displayContent: string,
    apiContent?: string,
  ): Promise<void> {
    const visibleContent =
      displayContent.trim();

    const technicalContent =
      (apiContent ?? displayContent).trim();

    if (
      !visibleContent ||
      !technicalContent ||
      isLoading
    ) {
      return;
    }

    const userMessage: Message = {
      id: createMessageId(),
      role: "user",
      content: visibleContent,
      apiContent: technicalContent,
    };

    const updatedMessages = [
      ...messages,
      userMessage,
    ];

    setCurrentQuestion(null);
    setDiagnostic(null);
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            messages:
              updatedMessages.map(
                (message) => ({
                  role: message.role,
                  content:
                    message.apiContent ??
                    message.content,
                }),
              ),
          }),
        },
      );

      const responseText =
        await response.text();

      let data: ChatResponse;

      try {
        data = JSON.parse(
          responseText,
        ) as ChatResponse;
      } catch {
        throw new Error(
          "L’API a retourné une réponse invalide.",
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Une erreur est survenue pendant l’analyse.",
        );
      }

      const reply =
        data.message ??
        data.response ??
        data.reply;

      if (!reply) {
        throw new Error(
          "L’API n’a retourné aucune réponse.",
        );
      }

      const assistantMessage: Message = {
        id: createMessageId(),
        role: "assistant",
        content: reply,
      };

      setMessages(
        (currentMessages) => [
          ...currentMessages,
          assistantMessage,
        ],
      );

      const isDiagnosisComplete =
        data.diagnosisComplete === true;

      setCurrentQuestion(
        isDiagnosisComplete
          ? null
          : data.nextQuestion ?? null,
      );

      setDiagnostic(
        isDiagnosisComplete
          ? data.diagnostic ?? null
          : null,
      );
    } catch (error) {
      console.error(
        "Erreur API chat :",
        error,
      );

      const errorMessage: Message = {
        id: createMessageId(),
        role: "assistant",
        content:
          "Je rencontre un problème technique. Réessayez dans quelques instants.",
      };

      setMessages(
        (currentMessages) => [
          ...currentMessages,
          errorMessage,
        ],
      );

      setCurrentQuestion(null);
      setDiagnostic(null);
    } finally {
      setIsLoading(false);
    }
  }

  function handleProfileSelect(
    profile: UserProfileType,
  ): void {
    setSelectedProfile(
      profile,
    );

    setMessages(
      createInitialMessages(
        profile,
      ),
    );

    setInput("");
    setCurrentQuestion(null);
    setDiagnostic(null);
  }

  function handleChangeProfile():
    void {
    setSelectedProfile(
      null,
    );

    setMessages([]);
    setInput("");
    setCurrentQuestion(null);
    setDiagnostic(null);
    setIsLoading(false);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    await sendMessage(input);
  }

  async function handleOptionClick(
    option: QuestionOption,
  ): Promise<void> {
    await sendMessage(
      option.label,
      option.value,
    );
  }

  function handleTextareaKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ): void {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      if (
        input.trim().length > 0 &&
        !isLoading
      ) {
        void sendMessage(input);
      }
    }
  }

  if (
    selectedProfile ===
    null
  ) {
    return (
      <UserProfileSelector
        onSelect={
          handleProfileSelect
        }
      />
    );
  }

  const hasQuickReplies =
    !isLoading &&
    currentQuestion !== null &&
    Array.isArray(
      currentQuestion.options,
    ) &&
    currentQuestion.options.length > 0;

  return (
    <section className="mx-auto flex min-h-[680px] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <header className="border-b border-gray-200 px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
          <h2 className="text-2xl font-bold text-gray-900">
  Ta Pièces Auto AI
</h2>

<p className="mt-2 text-base font-medium text-gray-700">
  Identifier la bonne pièce avec le minimum de questions et le risque d'erreur
              <br />
              le plus faible possible.
</p>

<p className="mt-2 text-sm text-blue-700">
  L'IA qui raisonne comme un vendeur expert en pièces automobiles.
</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800">
              {profileLabels[selectedProfile]}
            </span>

            <button
              type="button"
              onClick={
                handleChangeProfile
              }
              className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              Changer de profil
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto bg-gray-50 p-6">
        {messages
          .filter(
            (message) =>
              !message.hidden,
          )
          .map(
            (message) => (
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
                    ? "max-w-[85%] whitespace-pre-line rounded-2xl rounded-br-md bg-blue-700 px-5 py-3 text-white"
                    : "max-w-[85%] whitespace-pre-line rounded-2xl rounded-bl-md border border-gray-200 bg-white px-5 py-3 text-gray-800"
                }
              >
                <p className="leading-7">
                  {message.content}
                </p>
              </div>
            </div>
          ),
        )}

        {diagnostic && (
          <div className="flex justify-start">
            <DiagnosticCard
              diagnostic={diagnostic}
            />
          </div>
        )}

        {hasQuickReplies && (
          <div className="flex justify-start">
            <div className="w-full max-w-[85%]">
              <p className="mb-3 text-sm font-medium text-gray-600">
                Choisissez une réponse ou
                écrivez la vôtre :
              </p>

              <div className="flex flex-wrap gap-2">
                {currentQuestion.options?.map(
                  (option, index) => (
                    <button
                      key={`${currentQuestion.id}-${option.id}-${index}`}
                      type="button"
                      disabled={isLoading}
                      onClick={() => {
                        void handleOptionClick(
                          option,
                        );
                      }}
                      className="rounded-xl border border-blue-200 bg-white px-4 py-3 text-left text-sm font-medium text-blue-800 transition hover:border-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {option.label}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md border border-gray-200 bg-white px-5 py-3 text-gray-500">
              Analyse en cours...
            </div>
          </div>
        )}

        <div
          ref={conversationEndRef}
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-200 bg-white p-4"
      >
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(event) =>
              setInput(
                event.target.value,
              )
            }
            onKeyDown={
              handleTextareaKeyDown
            }
            rows={2}
            disabled={isLoading}
            placeholder={
              hasQuickReplies
                ? "Choisissez une réponse ci-dessus ou écrivez votre propre réponse..."
                : diagnostic
                  ? "Ajoutez une précision ou décrivez un autre symptôme..."
                  : "Exemple : Ma voiture ne démarre plus à froid..."
            }
            className="min-h-14 flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
          />

          <button
            type="submit"
            disabled={
              isLoading ||
              input.trim().length === 0
            }
            className="rounded-xl bg-blue-700 px-6 py-4 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading
              ? "Analyse..."
              : "Envoyer"}
          </button>
        </div>

        <p className="mt-2 text-xs text-gray-400">
          Entrée pour envoyer — Maj + Entrée
          pour revenir à la ligne
        </p>
      </form>
    </section>
  );
}




