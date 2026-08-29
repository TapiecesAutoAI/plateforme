"use client";

import {
  useState,
} from "react";

import {
  detectTechnicalSourceBrand,
  TECHNICAL_SOURCE_BRANDS,
} from "./TechnicalSourceRegistry";

type Props = {
  sourceName: string;

  compact?: boolean;
};

export function TechnicalSourceBadge({
  sourceName,
  compact = false,
}: Props) {

  const [
    imageFailed,
    setImageFailed,
  ] = useState(false);

  const brandId =
    detectTechnicalSourceBrand(
      sourceName,
    );

  const brand =
    TECHNICAL_SOURCE_BRANDS[
      brandId
    ];

  return (
    <div
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm"
      title={`Source technique : ${brand.name}`}
    >

      {
        brand.logoUrl &&
        !imageFailed
          ? (
              <img
                src={brand.logoUrl}
                alt={`Logo ${brand.name}`}
                className={
                  compact
                    ? "h-6 w-10 object-contain"
                    : "h-8 w-14 object-contain"
                }
                onError={
                  () =>
                    setImageFailed(
                      true,
                    )
                }
              />
            )
          : (
              <div
                className={
                  compact
                    ? "flex h-6 min-w-8 items-center justify-center rounded-md bg-slate-900 px-2 text-[9px] font-black text-white"
                    : "flex h-8 min-w-10 items-center justify-center rounded-md bg-slate-900 px-2 text-[10px] font-black text-white"
                }
              >
                {
                  brand.name
                    .slice(
                      0,
                      4,
                    )
                    .toUpperCase()
                }
              </div>
            )
      }

      <div>

        <div className="text-xs font-black text-slate-900">
          {brand.name}
        </div>

        {
          !compact && (
            <div className="text-[10px] text-slate-500">
              Source technique
            </div>
          )
        }

      </div>

    </div>
  );
}