"use client";

import {
  useEffect,
  useState,
} from "react";

export default function AnimatedTpaLogo() {

  const [
    animationCycle,
    setAnimationCycle,
  ] = useState(0);

  useEffect(
    () => {

      const timer =
        window.setInterval(
          () => {
            setAnimationCycle(
              value =>
                value + 1,
            );
          },
          15000,
        );

      return () => {
        window.clearInterval(
          timer,
        );
      };
    },
    [],
  );

  return (
    <div
      key={animationCycle}
      className="tpa-logo-wrap"
      aria-label="TPA"
    >

      <div className="tpa-center-flash" />

      <div className="tpa-wave tpa-wave-1" />
      <div className="tpa-wave tpa-wave-2" />

      <div className="tpa-logo-core">

        <div className="tpa-inner-glow" />

        <div className="tpa-shine" />

        <span className="tpa-logo-text">
          TPA
        </span>

      </div>

      <style>{`

        .tpa-logo-wrap {
          position: relative;
          display: flex;
          width: 180px;
          height: 180px;
          align-items: center;
          justify-content: center;
          isolation: isolate;
        }


        /* ====================================================
           POINT D'ENERGIE CENTRAL
        ==================================================== */

        .tpa-center-flash {
          position: absolute;

          left: 50%;
          top: 50%;

          width: 12px;
          height: 12px;

          border-radius: 9999px;

          background: white;

          transform:
            translate(-50%, -50%)
            scale(.15);

          opacity: 0;

          box-shadow:
            0 0 12px white,
            0 0 30px #60a5fa,
            0 0 60px #2563eb,
            0 0 100px #1d4ed8;

          animation:
            tpaCenterExplosion
            1.25s
            cubic-bezier(.2,.8,.2,1)
            forwards;

          z-index: 10;
        }


        /* ====================================================
           ONDES QUI PARTENT DU CENTRE
        ==================================================== */

        .tpa-wave {
          position: absolute;

          left: 50%;
          top: 50%;

          width: 30px;
          height: 30px;

          border-radius: 9999px;

          border:
            2px solid
            rgba(96,165,250,.9);

          transform:
            translate(-50%, -50%)
            scale(.2);

          opacity: 0;

          box-shadow:
            0 0 18px
            rgba(59,130,246,.7);

          z-index: 2;
        }


        .tpa-wave-1 {
          animation:
            tpaWave
            1.4s
            ease-out
            .2s
            forwards;
        }


        .tpa-wave-2 {
          animation:
            tpaWave
            1.5s
            ease-out
            .48s
            forwards;
        }


        /* ====================================================
           LOGO
        ==================================================== */

        .tpa-logo-core {
          position: relative;

          z-index: 5;

          display: flex;

          width: 160px;
          height: 160px;

          align-items: center;
          justify-content: center;

          overflow: hidden;

          border-radius: 9999px;

          background:
            radial-gradient(
              circle at 50% 45%,
              #3b82f6 0%,
              #2457ef 35%,
              #1742da 70%,
              #1233bb 100%
            );

          opacity: 0;

          transform:
            scale(.55);

          animation:
            tpaLogoReveal
            1.2s
            cubic-bezier(.2,.8,.2,1)
            .35s
            forwards;
        }


        /* ====================================================
           LUMIERE DANS LE CENTRE DU CERCLE
        ==================================================== */

        .tpa-inner-glow {
          position: absolute;

          left: 50%;
          top: 50%;

          width: 15px;
          height: 15px;

          transform:
            translate(-50%, -50%);

          border-radius: 9999px;

          background:
            rgba(255,255,255,.8);

          opacity: 0;

          filter:
            blur(5px);

          animation:
            tpaInnerGlow
            1.3s
            ease-out
            .35s
            forwards;
        }


        /* ====================================================
           TEXTE
        ==================================================== */

        .tpa-logo-text {
          position: relative;

          z-index: 8;

          color: white;

          font-size: 62px;
          font-weight: 900;

          line-height: 1;

          letter-spacing: -4px;

          opacity: 0;

          transform:
            scale(.45);

          animation:
            tpaTextReveal
            .75s
            cubic-bezier(.2,.8,.2,1)
            .8s
            forwards;
        }


        /* ====================================================
           BRILLANCE
        ==================================================== */

        .tpa-shine {
          position: absolute;

          z-index: 9;

          top: -25%;
          bottom: -25%;

          left: -60%;

          width: 28%;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.8),
              transparent
            );

          transform:
            rotate(20deg);

          opacity: 0;

          animation:
            tpaShine
            1s
            ease-in-out
            1.25s
            forwards;
        }


        /* ====================================================
           ANIMATIONS
        ==================================================== */

        @keyframes tpaCenterExplosion {

          0% {
            opacity: 0;
            transform:
              translate(-50%, -50%)
              scale(.1);
          }

          20% {
            opacity: 1;
          }

          45% {
            opacity: 1;

            transform:
              translate(-50%, -50%)
              scale(2.8);
          }

          100% {
            opacity: 0;

            transform:
              translate(-50%, -50%)
              scale(8);
          }
        }


        @keyframes tpaWave {

          0% {
            opacity: 0;

            transform:
              translate(-50%, -50%)
              scale(.2);
          }

          20% {
            opacity: .95;
          }

          100% {
            opacity: 0;

            transform:
              translate(-50%, -50%)
              scale(6);
          }
        }


        @keyframes tpaLogoReveal {

          0% {
            opacity: 0;
            transform: scale(.45);
          }

          55% {
            opacity: 1;
            transform: scale(1.08);
          }

          100% {
            opacity: 1;
            transform: scale(1);
          }
        }


        @keyframes tpaTextReveal {

          0% {
            opacity: 0;
            transform: scale(.45);
            filter: blur(8px);
          }

          65% {
            opacity: 1;
            transform: scale(1.08);
            filter: blur(0);
          }

          100% {
            opacity: 1;
            transform: scale(1);
          }
        }


        @keyframes tpaInnerGlow {

          0% {
            opacity: 0;
            transform:
              translate(-50%, -50%)
              scale(.2);
          }

          40% {
            opacity: .9;
          }

          100% {
            opacity: 0;

            transform:
              translate(-50%, -50%)
              scale(9);
          }
        }


        @keyframes tpaShine {

          0% {
            left: -60%;
            opacity: 0;
          }

          25% {
            opacity: .7;
          }

          100% {
            left: 140%;
            opacity: 0;
          }
        }


        /* ====================================================
           PETITE RESPIRATION APRES L'INTRO
        ==================================================== */

        .tpa-logo-core {
          animation:
            tpaLogoReveal
              1.2s
              cubic-bezier(.2,.8,.2,1)
              .35s
              forwards,

            tpaBreath
              4s
              ease-in-out
              2.1s
              infinite;
        }


        @keyframes tpaBreath {

          0%,
          100% {
            box-shadow:
              0 0 20px
              rgba(37,99,235,.25);
          }

          50% {
            box-shadow:
              0 0 38px
              rgba(37,99,235,.55);
          }
        }


        @media (prefers-reduced-motion: reduce) {

          .tpa-center-flash,
          .tpa-wave,
          .tpa-inner-glow,
          .tpa-shine {
            display: none;
          }

          .tpa-logo-core,
          .tpa-logo-text {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }

      `}</style>

    </div>
  );
}
