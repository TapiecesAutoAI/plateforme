import {
  NextResponse,
} from "next/server";

import {
  OpenAICatalogIntentProvider,
} from "../../../../lib/ai/OpenAICatalogIntentProvider";


export async function POST(
  request: Request,
) {

  try {

    const body =
      await request.json();

    const text =
      typeof body?.text === "string"
        ? body.text.trim()
        : "";

    if (!text) {
      return NextResponse.json(
        {
          ok: false,
          error: "TEXT_REQUIRED",
        },
        {
          status: 400,
        },
      );
    }


    const provider =
      new OpenAICatalogIntentProvider();

    const interpretation =
      await provider.interpret(
        text,
      );


    return NextResponse.json({
      ok: true,
      interpretation,
    });

  } catch {

    return NextResponse.json(
      {
        ok: false,
        error: "CATALOG_INTERPRETATION_FAILED",
      },
      {
        status: 500,
      },
    );
  }
}