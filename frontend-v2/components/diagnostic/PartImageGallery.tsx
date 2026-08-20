"use client";

import Image from "next/image";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  resolvePartMedia,
} from "./partMediaRegistry";

type Props = {
  partName:
    string;

  fallbackImage:
    string;
};

export default function PartImageGallery({
  partName,
  fallbackImage,
}: Props) {
  const media =
    useMemo(
      () =>
        resolvePartMedia(
          partName,
        ),
      [
        partName,
      ],
    );

  const initialImages =
    useMemo(
      () =>
        media.images.length >
        0
          ? media.images
          : [
              media.fallbackImage ??
              fallbackImage,
            ],
      [
        media,
        fallbackImage,
      ],
    );

  const [
    images,
    setImages,
  ] = useState<string[]>(
    initialImages,
  );

  const [
    activeIndex,
    setActiveIndex,
  ] = useState(
    0,
  );

  const [
    zoomed,
    setZoomed,
  ] = useState(
    false,
  );

  useEffect(
    () => {
      setImages(
        initialImages,
      );

      setActiveIndex(
        0,
      );

      setZoomed(
        false,
      );
    },
    [
      initialImages,
    ],
  );

  const activeImage =
    images[
      activeIndex
    ] ??
    media.fallbackImage ??
    fallbackImage;

  function handleImageError() {
    setImages(
      currentImages => {
        const remaining =
          currentImages.filter(
            (
              _,
              index,
            ) =>
              index !==
              activeIndex,
          );

        if (
          remaining.length >
          0
        ) {
          return remaining;
        }

        return [
          media.fallbackImage ??
          fallbackImage,
        ];
      },
    );

    setActiveIndex(
      0,
    );
  }

  function previousImage() {
    setActiveIndex(
      current =>
        current ===
        0
          ? images.length -
            1
          : current -
            1,
    );
  }

  function nextImage() {
    setActiveIndex(
      current =>
        current ===
        images.length -
          1
          ? 0
          : current +
            1,
    );
  }

  return (
    <>
      <div className="relative mx-auto w-full max-w-md">
        <button
          type="button"
          onClick={() =>
            setZoomed(
              true,
            )
          }
          className="relative block aspect-square w-full overflow-hidden rounded-2xl border border-slate-200 bg-white"
          aria-label={`Agrandir la photo de ${partName}`}
        >
          <Image
            key={
              activeImage
            }
            src={
              activeImage
            }
            alt={
              `Photo générique : ${partName}`
            }
            fill
            priority
            unoptimized
            onError={
              handleImageError
            }
            className="object-contain p-8"
            sizes="(max-width: 768px) 80vw, 420px"
          />

          <span className="absolute bottom-3 right-3 rounded-full bg-slate-950/80 px-3 py-1.5 text-xs font-bold text-white">
            Agrandir
          </span>


        </button>

        {images.length >
          1 && (
          <>
            <button
              type="button"
              onClick={
                previousImage
              }
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-2xl font-bold text-slate-900 shadow-md"
              aria-label="Photo précédente"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={
                nextImage
              }
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-2xl font-bold text-slate-900 shadow-md"
              aria-label="Photo suivante"
            >
              ›
            </button>
          </>
        )}
      </div>

      {images.length >
        1 && (
        <div className="mt-4 flex justify-center gap-2">
          {images.map(
            (
              image,
              index,
            ) => (
              <button
                key={
                  image
                }
                type="button"
                onClick={() =>
                  setActiveIndex(
                    index,
                  )
                }
                className={
                  index ===
                  activeIndex
                    ? "h-2.5 w-8 rounded-full bg-blue-950"
                    : "h-2.5 w-2.5 rounded-full bg-slate-300"
                }
                aria-label={`Afficher la photo ${index + 1}`}
              />
            ),
          )}
        </div>
      )}

      <p className="mt-3 text-center text-xs text-slate-500">
        Photo générique détourée. La pièce exacte sera affichée après identification du véhicule.
      </p>

      {zoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-5"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo agrandie de ${partName}`}
          onClick={() =>
            setZoomed(
              false,
            )
          }
        >
          <button
            type="button"
            onClick={() =>
              setZoomed(
                false,
              )
            }
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl font-bold text-slate-950"
            aria-label="Fermer"
          >
            ×
          </button>

          <div className="relative h-[80vh] w-full max-w-5xl">
            <Image
              src={
                activeImage
              }
              alt={
                `Photo agrandie : ${partName}`
              }
              fill
              unoptimized
              onError={
                handleImageError
              }
              className="object-contain"
              sizes="95vw"
            />
          </div>
        </div>
      )}
    </>
  );
}
