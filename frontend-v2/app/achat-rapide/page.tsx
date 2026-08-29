"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";


type Role =
  | "user"
  | "assistant";


type Message = {
  id: number;
  role: Role;
  text: string;
};


type ConversationState = {
  intent:
    | "none"
    | "clean"
    | "tyre"
    | "travel"
    | "smell"
    | "equipment";

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


const INSPIRATIONS: Inspiration[] = [
  {
    id: "clean",
    icon: "\u{1F9FD}",
    title: "Nettoyer",
    prompt: "Je veux nettoyer mon vehicule",
    className: "from-blue-950/85 via-blue-800/65 to-slate-950/90",
    imageUrl: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "tyre",
    icon: "\u{1F6DE}",
    title: "Pneu / crevaison",
    prompt: "Mon pneu est creve",
    className: "from-orange-950/90 via-orange-700/55 to-slate-950/90",
    imageUrl: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "interior",
    icon: "\u2728",
    title: "Interieur",
    prompt: "Je veux rafraichir mon interieur",
    className: "from-emerald-950/90 via-emerald-700/55 to-slate-950/90",
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "travel",
    icon: "\u{1F9F0}",
    title: "Preparer un trajet",
    prompt: "Je pars en voyage et je veux quelques accessoires utiles",
    className: "from-indigo-950/90 via-indigo-700/55 to-slate-950/90",
    imageUrl: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=900&q=85",
  },
];


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
): ConversationState["intent"] {

  const text =
    normalize(
      value,
    );

  if (
    text.includes("nettoy") ||
    text.includes("lav") ||
    text.includes("jante") ||
    text.includes("vitre") ||
    text.includes("interieur")
  ) {
    return "clean";
  }

  if (
    text.includes("pneu") ||
    text.includes("crev") ||
    text.includes("gonfl")
  ) {
    return "tyre";
  }

  if (
    text.includes("voyage") ||
    text.includes("trajet") ||
    text.includes("vacance") ||
    text.includes("partir")
  ) {
    return "travel";
  }

  if (
    text.includes("odeur") ||
    text.includes("sent") ||
    text.includes("parfum")
  ) {
    return "smell";
  }

  if (
    text.includes("accessoire") ||
    text.includes("equip") ||
    text.includes("kit")
  ) {
    return "equipment";
  }

  return "none";
}


export default function QuickPurchasePage() {

  const [
    input,
    setInput,
  ] = useState("");

  const [
    messages,
    setMessages,
  ] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      text:
        "Bonjour. Dites-moi simplement ce que vous voulez faire ou ce dont vous avez besoin.",
    },
  ]);

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
  ] = useState<string[]>([
    "Nettoyer mon vehicule",
    "Mon pneu est creve",
    "Rafraichir l'interieur",
    "Preparer un trajet",
  ]);

  const nextId =
    useRef(2);

  const chatEnd =
    useRef<HTMLDivElement | null>(
      null,
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
  ) {

    setMessages(
      previous => [
        ...previous,
        {
          id:
            nextId.current++,
          role,
          text,
        },
      ],
    );
  }


  function assistant(
    text: string,
    choices: string[] = [],
  ) {

    window.setTimeout(
      () => {

        addMessage(
          "assistant",
          text,
        );

        setSuggestions(
          choices,
        );

      },
      180,
    );
  }


  function startIntent(
    intent:
      ConversationState["intent"],
  ) {

    if (intent === "clean") {

      setConversation({
        intent,
        step: 1,
      });

      assistant(
        "Que voulez-vous nettoyer en priorite ?",
        [
          "Carrosserie",
          "Jantes et pneus",
          "Vitres",
          "Interieur",
        ],
      );

      return;
    }


    if (intent === "tyre") {

      setConversation({
        intent,
        step: 1,
      });

      assistant(
        "Que constatez-vous sur le pneu ?",
        [
          "Il est simplement degonfle",
          "Petit objet plante dedans",
          "Crevaison sans objet visible",
          "Flanc abime ou dechire",
        ],
      );

      return;
    }


    if (intent === "travel") {

      setConversation({
        intent,
        step: 1,
      });

      assistant(
        "Qu'aimeriez-vous surtout prevoir pour votre trajet ?",
        [
          "Crevaison",
          "Nettoyage en route",
          "Accessoires pratiques",
          "Petit kit complet",
        ],
      );

      return;
    }


    if (intent === "smell") {

      setConversation({
        intent,
        step: 1,
      });

      assistant(
        "Souhaitez-vous masquer une odeur ou la traiter a la source ?",
        [
          "Simplement parfumer",
          "Supprimer une mauvaise odeur",
        ],
      );

      return;
    }


    if (intent === "equipment") {

      setConversation({
        intent,
        step: 1,
      });

      assistant(
        "Quel type d'equipement recherchez-vous ?",
        [
          "Depannage",
          "Nettoyage",
          "Rangement",
          "Confort",
        ],
      );

      return;
    }


    assistant(
      "Je n'ai pas encore bien compris. Decrivez le besoin avec vos mots, par exemple : nettoyer mes jantes, pneu creve ou preparer un voyage.",
    );
  }


  function continueConversation(
    value: string,
  ) {

    const text =
      normalize(
        value,
      );


    if (
      conversation.intent === "clean" &&
      conversation.step === 1
    ) {

      setConversation({
        intent: "clean",
        step: 2,
      });


      if (
        text.includes("jante") ||
        text.includes("pneu")
      ) {

        assistant(
          "Quel resultat recherchez-vous ?",
          [
            "Nettoyage courant",
            "Beaucoup de poussiere de frein",
            "Faire briller aussi les pneus",
          ],
        );

        return;
      }


      if (
        text.includes("interieur")
      ) {

        assistant(
          "Quelle zone voulez-vous traiter ?",
          [
            "Plastiques",
            "Sieges et tissus",
            "Tapis",
            "Tout l'interieur",
          ],
        );

        return;
      }


      if (
        text.includes("vitre")
      ) {

        assistant(
          "Quel type de nettoyage ?",
          [
            "Vitres interieur/exterieur",
            "Insectes et traces tenaces",
          ],
        );

        return;
      }


      assistant(
        "Souhaitez-vous un lavage rapide ou un nettoyage plus soigne ?",
        [
          "Lavage rapide",
          "Nettoyage soigne",
        ],
      );

      return;
    }


    if (
      conversation.intent === "clean" &&
      conversation.step === 2
    ) {

      setConversation({
        intent: "none",
        step: 0,
      });

      setSuggestions([]);

      assistant(
        "Pour ce besoin, je partirais sur un petit ensemble de 2 a 3 produits maximum. Je vais ensuite pouvoir vous proposer les produits disponibles au magasin, avec leur prix et leur quantite.",
      );

      return;
    }


    if (
      conversation.intent === "tyre" &&
      conversation.step === 1
    ) {

      setConversation({
        intent: "none",
        step: 0,
      });

      setSuggestions([]);


      if (
        text.includes("flanc") ||
        text.includes("dechir")
      ) {

        assistant(
          "Un flanc endommage ne doit pas etre repare avec une meche ou une bombe. Pour un depannage temporaire, je peux proposer un compresseur si le pneu garde encore la pression, mais le pneu devra etre controle ou remplace.",
        );

        return;
      }


      if (
        text.includes("objet")
      ) {

        assistant(
          "Pour une petite perforation dans la bande de roulement, un kit de meches et un compresseur peuvent servir de depannage temporaire. Je peux vous montrer les deux.",
        );

        return;
      }


      assistant(
        "Je vous proposerais d'abord un compresseur 12 V avec manometre. Si le pneu ne tient pas la pression, on passe ensuite au kit anti-crevaison.",
      );

      return;
    }


    if (
      conversation.intent === "travel" &&
      conversation.step === 1
    ) {

      setConversation({
        intent: "none",
        step: 0,
      });

      setSuggestions([]);

      assistant(
        "Je vous preparerais une selection courte : uniquement les accessoires utiles pour votre choix, sans remplir inutilement le coffre.",
      );

      return;
    }


    if (
      conversation.intent === "smell" &&
      conversation.step === 1
    ) {

      setConversation({
        intent: "none",
        step: 0,
      });

      setSuggestions([]);

      assistant(
        text.includes("supprim")
          ? "Pour une odeur persistante, je conseillerais d'abord un nettoyant textile ou interieur adapte, puis un neutralisant d'odeurs. Le parfum vient seulement apres."
          : "Dans ce cas, un desodorisant simple suffit. Je pourrai vous proposer plusieurs parfums sans vous imposer un produit specifique.",
      );

      return;
    }


    if (
      conversation.intent === "equipment" &&
      conversation.step === 1
    ) {

      setConversation({
        intent: "none",
        step: 0,
      });

      setSuggestions([]);

      assistant(
        "Tres bien. Je vais limiter la proposition a quelques accessoires universels utiles dans cette categorie.",
      );

      return;
    }


    const intent =
      detectIntent(
        value,
      );

    startIntent(
      intent,
    );
  }


  function send(
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

    if (
      conversation.intent === "none"
    ) {

      startIntent(
        detectIntent(
          clean,
        ),
      );

      return;
    }

    continueConversation(
      clean,
    );
  }


  function submit(
    event:
      FormEvent<HTMLFormElement>,
  ) {

    event.preventDefault();

    send(
      input,
    );
  }


  return (
    <main className="h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 text-slate-950 w-full min-w-0 overflow-x-hidden">

      <div className="mx-auto flex h-full max-w-7xl flex-col px-5 py-5">

        <header className="flex shrink-0 items-center justify-between gap-5">

          <div>

            <div className="text-sm font-bold text-blue-700">
              Ta Pieces Auto AI
            </div>

            <h1 className="text-2xl font-black">
              J&apos;ai besoin d&apos;un produit
            </h1>

          </div>

          <Link
            href="/showroom"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold shadow-sm"
          >
            Retour
          </Link>

        </header>


        <div className="mt-5 grid min-h-0 flex-1 gap-5 lg:grid-cols-[330px_1fr]">

          <aside className="hidden min-h-0 flex-col lg:flex">

            <div className="mb-3">

              <h2 className="font-black">
                Besoin d&apos;une idee ?
              </h2>

              <p className="text-sm text-slate-500">
                Quelques situations courantes.
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
                          send(
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
              Ici, uniquement des produits universels : aucune identification du vehicule.
            </div>

          </aside>


          <section className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-xl">

            <div className="border-b border-blue-100 bg-gradient-to-r from-blue-950 via-blue-900 to-blue-700 px-6 py-4 text-white">

              <h2 className="font-black">
                Assistant Ta Pieces Auto
              </h2>

              <p className="text-sm text-blue-100">
                Expliquez votre besoin naturellement.
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
                              : "max-w-[78%] rounded-2xl rounded-bl-md bg-slate-100 px-5 py-3 leading-6 text-slate-800"
                          }
                        >
                          {message.text}
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
                                  send(
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
                  placeholder="Ecrivez votre reponse..."
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