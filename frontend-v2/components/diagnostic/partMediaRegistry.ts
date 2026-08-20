export type PartMediaFamily = {
  id: string;

  keywords: string[];

  images: string[];

  fallbackImage: string;
};

export const PART_MEDIA_FAMILIES:
  PartMediaFamily[] = [
  {
    id: "battery",

    keywords: [
      "batterie",
      "cosse",
      "cable positif",
      "cable negatif",
      "liaison de masse",
    ],

    images: [
      "/media/parts/battery/generic-01.webp",
    ],

    fallbackImage:
      "/parts/battery.svg",
  },

  {
    id: "starter",

    keywords: [
      "demarreur",
      "solenoide",
      "lanceur",
      "contacteur de demarrage",
      "contacteur demarrage",
      "commande du demarreur",
      "circuit de commande du demarreur",
    ],

    images: [
      "/media/parts/starter/generic-01.webp",
      "/media/parts/starter/generic-02.webp",
      "/media/parts/starter/generic-03.webp",
    ],

    fallbackImage:
      "/parts/starter.svg",
  },

  {
    id: "alternator",

    keywords: [
      "alternateur",
      "regulateur",
      "poulie alternateur",
    ],

    images: [
      "/media/parts/alternator/generic-01.webp",
      "/media/parts/alternator/generic-02.webp",
      "/media/parts/alternator/generic-03.webp",
    ],

    fallbackImage:
      "/parts/generic-part.svg",
  },

  {
    id: "brake-pad",

    keywords: [
      "plaquette",
      "plaquettes",
    ],

    images: [
      "/media/parts/brake-pad/generic-01.webp",
      "/media/parts/brake-pad/generic-02.webp",
      "/media/parts/brake-pad/generic-03.webp",
    ],

    fallbackImage:
      "/parts/generic-part.svg",
  },

  {
    id: "brake-disc",

    keywords: [
      "disque de frein",
      "disques de frein",
    ],

    images: [
      "/media/parts/brake-disc/generic-01.webp",
      "/media/parts/brake-disc/generic-02.webp",
      "/media/parts/brake-disc/generic-03.webp",
    ],

    fallbackImage:
      "/parts/generic-part.svg",
  },

  {
    id: "brake-caliper",

    keywords: [
      "etrier",
      "étrier",
    ],

    images: [
      "/media/parts/brake-caliper/generic-01.webp",
      "/media/parts/brake-caliper/generic-02.webp",
      "/media/parts/brake-caliper/generic-03.webp",
    ],

    fallbackImage:
      "/parts/generic-part.svg",
  },

  {
    id: "shock-absorber",

    keywords: [
      "amortisseur",
      "jambe de force",
    ],

    images: [
      "/media/parts/shock-absorber/generic-01.webp",
      "/media/parts/shock-absorber/generic-02.webp",
      "/media/parts/shock-absorber/generic-03.webp",
    ],

    fallbackImage:
      "/parts/generic-part.svg",
  },

  {
    id: "control-arm",

    keywords: [
      "triangle",
      "bras de suspension",
    ],

    images: [
      "/media/parts/control-arm/generic-01.webp",
      "/media/parts/control-arm/generic-02.webp",
      "/media/parts/control-arm/generic-03.webp",
    ],

    fallbackImage:
      "/parts/generic-part.svg",
  },

  {
    id: "wheel-bearing",

    keywords: [
      "roulement",
      "moyeu",
    ],

    images: [
      "/media/parts/wheel-bearing/generic-01.webp",
      "/media/parts/wheel-bearing/generic-02.webp",
      "/media/parts/wheel-bearing/generic-03.webp",
    ],

    fallbackImage:
      "/parts/generic-part.svg",
  },

  {
    id: "clutch",

    keywords: [
      "embrayage",
      "volant moteur",
      "butée",
      "butee",
    ],

    images: [
      "/media/parts/clutch/generic-01.webp",
      "/media/parts/clutch/generic-02.webp",
      "/media/parts/clutch/generic-03.webp",
    ],

    fallbackImage:
      "/parts/generic-part.svg",
  },

  {
    id: "radiator",

    keywords: [
      "radiateur",
      "condenseur",
    ],

    images: [
      "/media/parts/radiator/generic-01.webp",
      "/media/parts/radiator/generic-02.webp",
      "/media/parts/radiator/generic-03.webp",
    ],

    fallbackImage:
      "/parts/generic-part.svg",
  },

  {
    id: "water-pump",

    keywords: [
      "pompe a eau",
      "pompe à eau",
    ],

    images: [
      "/media/parts/water-pump/generic-01.webp",
      "/media/parts/water-pump/generic-02.webp",
      "/media/parts/water-pump/generic-03.webp",
    ],

    fallbackImage:
      "/parts/generic-part.svg",
  },

  {
    id: "fuel-pump",

    keywords: [
      "pompe a carburant",
      "pompe à carburant",
      "pompe essence",
      "pompe diesel",
      "pompe de gavage",
    ],

    images: [
      "/media/parts/fuel-pump/generic-01.webp",
      "/media/parts/fuel-pump/generic-02.webp",
      "/media/parts/fuel-pump/generic-03.webp",
    ],

    fallbackImage:
      "/parts/generic-part.svg",
  },

  {
    id: "ignition-coil",

    keywords: [
      "bobine",
      "bobine d'allumage",
    ],

    images: [
      "/media/parts/ignition-coil/generic-01.webp",
      "/media/parts/ignition-coil/generic-02.webp",
      "/media/parts/ignition-coil/generic-03.webp",
    ],

    fallbackImage:
      "/parts/generic-part.svg",
  },

  {
    id: "spark-plug",

    keywords: [
      "bougie",
      "bougies",
    ],

    images: [
      "/media/parts/spark-plug/generic-01.webp",
      "/media/parts/spark-plug/generic-02.webp",
      "/media/parts/spark-plug/generic-03.webp",
    ],

    fallbackImage:
      "/parts/generic-part.svg",
  },

  {
    id: "air-filter",

    keywords: [
      "filtre a air",
      "filtre à air",
    ],

    images: [
      "/media/parts/air-filter/generic-01.webp",
      "/media/parts/air-filter/generic-02.webp",
      "/media/parts/air-filter/generic-03.webp",
    ],

    fallbackImage:
      "/parts/generic-part.svg",
  },

  {
    id: "oil-filter",

    keywords: [
      "filtre a huile",
      "filtre à huile",
    ],

    images: [
      "/media/parts/oil-filter/generic-01.webp",
      "/media/parts/oil-filter/generic-02.webp",
      "/media/parts/oil-filter/generic-03.webp",
    ],

    fallbackImage:
      "/parts/generic-part.svg",
  },

  {
    id: "generic",

    keywords: [],

    images: [],

    fallbackImage:
      "/parts/generic-part.svg",
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
    .toLowerCase();
}

export function resolvePartMedia(
  partName:
    string,
): PartMediaFamily {
  const normalizedName =
    normalize(
      partName,
    );

  return (
    PART_MEDIA_FAMILIES.find(
      family =>
        family.id !==
          "generic" &&
        family.keywords.some(
          keyword =>
            normalizedName.includes(
              normalize(
                keyword,
              ),
            ),
        ),
    ) ??
    PART_MEDIA_FAMILIES[
      PART_MEDIA_FAMILIES.length -
        1
    ]
  );
}
