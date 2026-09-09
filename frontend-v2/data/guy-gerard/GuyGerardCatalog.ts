import catalogData from "./catalog.json";

export type GuyGerardProduct = {
  id: string;
  catalog: string | null;
  section: string | null;
  product_name: string;
  supplier_code: string;
  attributes: string | null;
  description: string | null;
  effective_price: number | null;
  currency: string | null;
  name_fr: string | null;
  name_nl: string | null;
  barcode: string | null;
  image_path: string | null;
  match_method: string | null;
  search_text: string;
};

const products =
  (catalogData.products ?? []) as GuyGerardProduct[];

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function conceptGroups(query: string): string[][] {
  const text = normalize(query);
  const groups: string[][] = [];

  if (
    text.includes("pneu") ||
    text.includes("pneus") ||
    text.includes("tyre")
  ) {
    groups.push([
      "pneu",
      "pneus",
      "tyre",
      "tyres",
      "banden",
    ]);
  }

  if (
    text.includes("polish") ||
    text.includes("brill") ||
    text.includes("lustr")
  ) {
    groups.push([
      "polish",
      "brillant",
      "brillance",
      "lustr",
      "noir",
      "gel",
      "shine",
      "wax",
    ]);
  }

  if (
    text.includes("jante") ||
    text.includes("jantes")
  ) {
    groups.push([
      "jante",
      "jantes",
      "velg",
      "wheel",
    ]);
  }

  return groups;
}

export function searchGuyGerardCatalog(
  query: string,
  limit = 12,
): GuyGerardProduct[] {
  const normalizedQuery =
    normalize(query);

  const terms =
    normalizedQuery
      .split(/\s+/)
      .filter(
        term =>
          term.length >= 3 &&
          ![
            "pour",
            "avec",
            "des",
            "les",
            "une",
            "veux",
            "voudrais",
            "je",
            "du",
            "de",
            "la",
            "le",
          ].includes(term),
      );

  const groups =
    conceptGroups(query);

  return products
    .map(product => {
      const title =
        normalize(
          [
            product.name_fr,
            product.product_name,
          ]
            .filter(Boolean)
            .join(" "),
        );

      const section =
        normalize(
          [
            product.catalog,
            product.section,
          ]
            .filter(Boolean)
            .join(" "),
        );

      const full =
        normalize(
          product.search_text,
        );

      let score = 0;

      for (const term of terms) {
        if (title.includes(term)) {
          score += 8;
        } else if (full.includes(term)) {
          score += 2;
        }
      }

      let matchedGroups = 0;

      for (const group of groups) {
        const matched =
          group.some(
            synonym =>
              title.includes(synonym) ||
              full.includes(synonym),
          );

        if (matched) {
          matchedGroups += 1;
          score += 15;
        }
      }

      if (
        groups.length > 1 &&
        matchedGroups < groups.length
      ) {
        score -= 50;
      }

      if (
        groups.some(
          group =>
            group.includes("polish"),
        ) &&
        section.includes("nettoyage")
      ) {
        score += 10;
      }

      return {
        product,
        score,
        matchedGroups,
      };
    })
    .filter(
      item =>
        item.score > 0 &&
        (
          groups.length === 0 ||
          item.matchedGroups === groups.length
        ),
    )
    .sort(
      (a, b) =>
        b.score - a.score,
    )
    .slice(0, limit)
    .map(
      item =>
        item.product,
    );
}

export function findGuyGerardByCode(
  code: string,
): GuyGerardProduct | null {
  const normalized =
    normalize(code);

  return (
    products.find(
      product =>
        normalize(
          product.supplier_code,
        ) === normalized,
    ) ?? null
  );
}