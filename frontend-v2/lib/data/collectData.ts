export async function collectData(
  payload:
    Record<string, unknown>,
) {

  try {

    await fetch(
      "/api/data/collect",
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            payload,
          ),
      },
    );

  } catch {

    /*
     * La collecte de données ne doit jamais
     * bloquer le parcours commercial.
     */
  }
}
