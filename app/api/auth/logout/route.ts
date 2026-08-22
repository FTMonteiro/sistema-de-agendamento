
import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function POST() {
  try {
    await destroySession();

    return NextResponse.json(
      {
        success: true,
        message: "Sessão terminada com sucesso.",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Erro ao terminar sessão:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível terminar a sessão.",
      },
      {
        status: 500,
      },
    );
  }
}

