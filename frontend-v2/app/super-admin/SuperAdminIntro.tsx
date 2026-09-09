"use client";

import { useEffect, useState } from "react";

export default function SuperAdminIntro() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3200);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-950 via-slate-950 to-blue-900 text-white">
      <div className="absolute left-6 top-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-blue-300/30 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 font-black shadow-[0_0_35px_rgba(37,99,235,0.55)]">
          TPA
        </div>
      </div>

      <div className="relative flex flex-col items-center">
        <div className="relative flex h-[420px] w-[420px] items-center justify-center">

          <div className="zt-ring-one absolute h-[390px] w-[390px] rounded-full border-2 border-blue-400/70 shadow-[0_0_45px_rgba(59,130,246,0.8)]" />

          <div className="zt-ring-two absolute h-[330px] w-[430px] rounded-[50%] border border-cyan-300/70 shadow-[0_0_30px_rgba(56,189,248,0.8)]" />

          <div className="absolute h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />

          <img
            src="/zt-consult-logo.png"
            alt="ZT Consult"
            className="zt-logo relative z-10 h-72 w-72 rounded-[3rem] object-contain drop-shadow-[0_0_45px_rgba(37,99,235,0.9)]"
          />
        </div>

        <h1 className="mt-2 text-4xl font-black">
          Super Admin <span className="text-blue-400">TPA</span>
        </h1>

        <p className="mt-3 text-lg text-blue-100">
          Accès Super Administrateur actif.
        </p>

        <div className="mt-8 h-1.5 w-72 overflow-hidden rounded-full bg-white/20">
          <div className="zt-loading h-full rounded-full bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,1)]" />
        </div>

        <p className="mt-4 text-xs tracking-[0.4em] text-blue-200">
          CHARGEMENT...
        </p>
      </div>

      <style>{`
        @keyframes ztLogoSpin {
          0% { transform: rotateY(0deg) scale(0.92); }
          50% { transform: rotateY(180deg) scale(1.04); }
          100% { transform: rotateY(360deg) scale(0.92); }
        }

        @keyframes ztRingOne {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes ztRingTwo {
          from { transform: rotateX(68deg) rotateZ(360deg); }
          to { transform: rotateX(68deg) rotateZ(0deg); }
        }

        @keyframes ztLoading {
          from { width: 0%; }
          to { width: 100%; }
        }

        .zt-logo {
          animation: ztLogoSpin 3.2s ease-in-out infinite;
          transform-style: preserve-3d;
        }

        .zt-ring-one {
          animation: ztRingOne 5s linear infinite;
        }

        .zt-ring-two {
          animation: ztRingTwo 4s linear infinite;
        }

        .zt-loading {
          animation: ztLoading 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
