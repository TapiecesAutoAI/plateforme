"use client";

import type {
  DeveloperPipelineMetrics,
} from "@/engine/confirmation-v2";

interface Props {

  enabled:
    boolean;

  metrics:
    DeveloperPipelineMetrics;

}

export default function DeveloperDiagnosticPanel({

  enabled,

  metrics,

}: Props) {

  if (!enabled) {

    return null;

  }

  return (

    <section className="mt-8 rounded-2xl border border-slate-300 bg-slate-950 text-white shadow-xl">

      <div className="border-b border-slate-700 px-6 py-4">

        <h2 className="text-xl font-bold">

          Developer Pipeline

        </h2>

      </div>

      <div className="grid grid-cols-2 gap-4 p-6 text-sm">

        <Metric
          title="Hypothèses"
          value={metrics.hypothesisCount}
        />

        <Metric
          title="Preuves"
          value={metrics.evidenceCount}
        />

        <Metric
          title="Questions"
          value={metrics.questionCount}
        />

        <Metric
          title="Score moyen"
          value={metrics.averageScore}
        />

        <Metric
          title="Meilleur score"
          value={metrics.bestScore}
        />

        <Metric
          title="Gain d'information"
          value={metrics.informationGain}
        />

      </div>

    </section>

  );

}

function Metric({

  title,

  value,

}: {

  title:
    string;

  value:
    string | number;

}) {

  return (

    <div className="rounded-xl bg-slate-800 p-4">

      <div className="text-xs uppercase text-slate-400">

        {title}

      </div>

      <div className="mt-2 text-2xl font-bold text-emerald-400">

        {value}

      </div>

    </div>

  );

}
