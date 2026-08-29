export type TechnicalSourceBrand =
  | "castrol"
  | "motul"
  | "shell"
  | "liqui-moly"
  | "totalenergies"
  | "mobil"
  | "tecalliance"
  | "tecdoc"
  | "manufacturer"
  | "unknown";

export type TechnicalSourceBrandInfo = {
  id: TechnicalSourceBrand;

  name: string;

  logoUrl?: string;

  domain?: string;
};

export const TECHNICAL_SOURCE_BRANDS:
  Record<
    TechnicalSourceBrand,
    TechnicalSourceBrandInfo
  > = {

    castrol: {
      id: "castrol",
      name: "Castrol",
      domain: "castrol.com",
      logoUrl:
        "/brands/castrol.svg",
    },

    motul: {
      id: "motul",
      name: "Motul",
      domain: "motul.com",
      logoUrl:
        "/brands/motul.svg",
    },

    shell: {
      id: "shell",
      name: "Shell",
      domain: "shell.com",
      logoUrl:
        "https://logo.clearbit.com/shell.com",
    },

    "liqui-moly": {
      id: "liqui-moly",
      name: "Liqui Moly",
      domain: "liqui-moly.com",
      logoUrl:
        "https://logo.clearbit.com/liqui-moly.com",
    },

    totalenergies: {
      id: "totalenergies",
      name: "TotalEnergies",
      domain: "totalenergies.com",
      logoUrl:
        "https://logo.clearbit.com/totalenergies.com",
    },

    mobil: {
      id: "mobil",
      name: "Mobil",
      domain: "mobil.com",
      logoUrl:
        "https://logo.clearbit.com/mobil.com",
    },

    tecalliance: {
      id: "tecalliance",
      name: "TecAlliance",
      domain: "tecalliance.net",
      logoUrl:
        "https://logo.clearbit.com/tecalliance.net",
    },

    tecdoc: {
      id: "tecdoc",
      name: "TecDoc",
      domain: "tecalliance.net",
      logoUrl:
        "https://logo.clearbit.com/tecalliance.net",
    },

    manufacturer: {
      id: "manufacturer",
      name: "Constructeur",
    },

    unknown: {
      id: "unknown",
      name: "Source technique",
    },
  };

export function detectTechnicalSourceBrand(
  sourceName: string,
): TechnicalSourceBrand {

  const value =
    sourceName
      .trim()
      .toLowerCase();

  if (
    value.includes("castrol")
  ) {
    return "castrol";
  }

  if (
    value.includes("motul")
  ) {
    return "motul";
  }

  if (
    value.includes("shell")
  ) {
    return "shell";
  }

  if (
    value.includes("liqui")
  ) {
    return "liqui-moly";
  }

  if (
    value.includes("total")
  ) {
    return "totalenergies";
  }

  if (
    value.includes("mobil")
  ) {
    return "mobil";
  }

  if (
    value.includes("tecdoc")
  ) {
    return "tecdoc";
  }

  if (
    value.includes("tecalliance")
  ) {
    return "tecalliance";
  }

  return "unknown";
}