"use client";

import { useRouter } from "next/navigation";

import DiagnosisResultCard from "../../components/diagnostic/DiagnosisResultCard";

export default function DiagnosticResultDemoPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 sm:py-12">
      <DiagnosisResultCard
        title="Démarreur"
        confidence={91}
        reasons={[
          "Un seul clic est entendu au démarrage",
          "Les phares restent puissants",
          "La batterie est récente",
        ]}
        estimatedRemainingSeconds={30}
        estimatedGainPercentage={6}
        alternatives={[
          {
            id: "starter-solenoid",
            label: "Solénoïde de démarreur",
            confidence: 6,
          },
          {
            id: "starter-power-cable",
            label: "Câble d’alimentation",
            confidence: 2,
          },
          {
            id: "ignition-switch",
            label: "Contacteur de démarrage",
            confidence: 1,
          },
        ]}
        onOrder={() => {
          router.push("/piece?diagnosis=starter");
        }}
        onContinue={() => {
          router.push("/diagnostic-v2");
        }}
      />
    </main>
  );
}
