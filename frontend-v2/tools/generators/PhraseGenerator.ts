export class PhraseGenerator {

  public generate(
    templates: string[],
    replacements: Record<string, string[]>,
  ): string[] {

    const results = new Set<string>();

    for (const template of templates) {
      this.expand(
        template,
        replacements,
        results,
      );
    }

    return [...results];
  }

  private expand(
    text: string,
    replacements: Record<string, string[]>,
    output: Set<string>,
  ) {
    const match =
      text.match(/\{(.*?)\}/);

    if (!match) {
      output.add(
        text.replace(/\s+/g, " ").trim(),
      );
      return;
    }

    const token = match[1];

    const values =
      replacements[token] ??
      [];

    for (const value of values) {
      this.expand(
        text.replace(
          `{${token}}`,
          value,
        ),
        replacements,
        output,
      );
    }
  }
}