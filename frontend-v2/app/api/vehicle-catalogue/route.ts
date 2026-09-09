import { readFile } from "node:fs/promises";
import path from "node:path";

type CatalogueEngine = {
  make: string;
  model: string;
  generation: string;
  yearStart: number;
  yearEnd: number | null;
  label: string;
  fuel: string | null;
  powerHp: number | null;
  powerKw: number | null;
};

type Catalogue = {
  engines: CatalogueEngine[];
};

let cachedCatalogue: Catalogue | null = null;

async function getCatalogue(): Promise<Catalogue> {
  if (cachedCatalogue) {
    return cachedCatalogue;
  }

  const filePath = path.join(
    process.cwd(),
    "data",
    "vehicle-catalogue",
    "catalogue.json",
  );

  const raw = await readFile(filePath, "utf8");
  cachedCatalogue = JSON.parse(raw) as Catalogue;

  return cachedCatalogue;
}

function normalize(value: string | null): string {
  return (value ?? "").trim().toLocaleLowerCase();
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "fr", { sensitivity: "base" }),
  );
}

export async function GET(request: Request) {
  try {
    const catalogue = await getCatalogue();
    const url = new URL(request.url);

    const mode = url.searchParams.get("mode") ?? "brands";
    const brand = url.searchParams.get("brand") ?? "";
    const model = url.searchParams.get("model") ?? "";
    const fuel = url.searchParams.get("fuel") ?? "";
    const requestedYear = url.searchParams.get("year");
    const year = requestedYear ? Number(requestedYear) : NaN;

    if (mode === "brands") {
      return Response.json({
        values: uniqueStrings(catalogue.engines.map(item => item.make)),
      });
    }

    const brandRows = catalogue.engines.filter(
      item => normalize(item.make) === normalize(brand),
    );

    const currentYear = new Date().getFullYear();

    if (mode === "years") {
      const years = new Set<number>();

      for (const item of brandRows) {
        const start = Number(item.yearStart);
        const end = item.yearEnd ?? currentYear;

        for (let current = start; current <= end; current++) {
          years.add(current);
        }
      }

      return Response.json({
        values: [...years].sort((a, b) => b - a),
      });
    }

    const brandYearRows = brandRows.filter(
      item =>
        Number.isFinite(year) &&
        year >= item.yearStart &&
        year <= (item.yearEnd ?? currentYear),
    );

    if (mode === "models") {
      return Response.json({
        values: uniqueStrings(brandYearRows.map(item => item.model)),
      });
    }

    const modelRows = brandYearRows.filter(
      item => normalize(item.model) === normalize(model),
    );

    const yearRows = modelRows;

    if (mode === "fuels") {
      return Response.json({
        values: uniqueStrings(yearRows.map(item => item.fuel ?? "")),
      });
    }

    if (mode === "engines") {
      const selected = yearRows.filter(
        item => !fuel || normalize(item.fuel) === normalize(fuel),
      );

      const seen = new Set<string>();

      const engines = selected
        .filter(item => {
          const key = [
            item.label,
            item.fuel,
            item.powerHp,
            item.powerKw,
          ].join("|");

          if (seen.has(key)) {
            return false;
          }

          seen.add(key);
          return true;
        })
        .map(item => ({
          label: item.label,
          fuel: item.fuel ?? "",
          hp: item.powerHp ?? undefined,
          kw: item.powerKw ?? undefined,
          fromYear: item.yearStart,
          toYear: item.yearEnd ?? undefined,
        }));

      return Response.json({ engines });
    }

    return Response.json(
      { error: "Mode catalogue inconnu." },
      { status: 400 },
    );
  } catch (error) {
    console.error("vehicle-catalogue", error);

    return Response.json(
      { error: "Catalogue vehicule indisponible." },
      { status: 500 },
    );
  }
}