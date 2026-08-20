import { NextResponse } from "next/server";

import {
  KnowledgeEvolutionEngine,
  KnowledgeLoader,
  KnowledgeOptimizer,
  type KnowledgeDomain,
  type KnowledgeOptimizerPackage,
} from "../../../engine/knowledge";

const DOMAINS: KnowledgeDomain[] = [
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

export async function GET() {
  try {
    const loader =
      new KnowledgeLoader();

    const optimizer =
      new KnowledgeOptimizer();

    const evolutionEngine =
      new KnowledgeEvolutionEngine();

    const reports =
      DOMAINS.map(domain => {
        const knowledge =
          loader.loadDomain(
            domain,
          );

        const optimizerPackage =
          knowledge as unknown as
            KnowledgeOptimizerPackage;

        const optimizerReport =
          optimizer.analyze(
            optimizerPackage,
          );

        const evolutionReport =
          evolutionEngine.analyze(
            optimizerPackage,
            optimizerReport,
          );

        return {
          domain,
          optimizer:
            optimizerReport,
          evolution:
            evolutionReport,
        };
      });

    const globalQualityScore =
      reports.length > 0
        ? Math.round(
            reports.reduce(
              (total, report) =>
                total +
                report.optimizer
                  .qualityScore,
              0,
            ) /
              reports.length,
          )
        : 0;

    const projectedGlobalQualityScore =
      reports.length > 0
        ? Math.round(
            reports.reduce(
              (total, report) =>
                total +
                report.evolution
                  .projectedQualityScore,
              0,
            ) /
              reports.length,
          )
        : 0;

    const totalIssues =
      reports.reduce(
        (total, report) =>
          total +
          report.optimizer
            .issues.length,
        0,
      );

    const totalSuggestions =
      reports.reduce(
        (total, report) =>
          total +
          report.evolution
            .suggestions.length,
        0,
      );

    const criticalSuggestions =
      reports.reduce(
        (total, report) =>
          total +
          report.evolution
            .criticalCount,
        0,
      );

    return NextResponse.json({
      generatedAt:
        new Date().toISOString(),

      summary: {
        domainCount:
          reports.length,

        globalQualityScore,

        projectedGlobalQualityScore,

        totalIssues,

        totalSuggestions,

        criticalSuggestions,
      },

      reports,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erreur inconnue.";

    return NextResponse.json(
      {
        error:
          "Impossible d'analyser la base de connaissances.",

        message,
      },
      {
        status: 500,
      },
    );
  }
}
