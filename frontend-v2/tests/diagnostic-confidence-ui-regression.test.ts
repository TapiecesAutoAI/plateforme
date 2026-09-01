import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("diagnostic confidence UI regression", () => {
  const componentPath = path.resolve(
    process.cwd(),
    "components/diagnostic/DiagnosticConfirmationCard.tsx",
  );

  const source = fs.readFileSync(componentPath, "utf8");

  it("does not present missing final confidence as 0 percent", () => {
    expect(source).toContain("confidence: number | null;");
    expect(source).toContain(
      'confidence === null ? "À confirmer" : `${confidence}%`',
    );

    expect(source).not.toMatch(
      />\s*\{confidence\}%\s*</,
    );
  });

  it("does not authorize the price threshold with missing confidence", () => {
    expect(source).toContain(
      "partName && confidence !== null && confidence >= 85",
    );

    expect(source).toContain(
      "confidence === null || confidence < 85 || !partName",
    );
  });
});