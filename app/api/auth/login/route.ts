import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { createSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        {
          error:
            "Email e palavra-passe são obrigatórios.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Email ou palavra-passe incorretos.",
        },
        { status: 401 }
      );
    }

    const passwordCorrect = await compare(
      password,
      user.password
    );

    if (!passwordCorrect) {
      return NextResponse.json(
        {
          error:
            "Email ou palavra-passe incorretos.",
        },
        { status: 401 }
      );
    }

    /*
     * Cria a sessão segura:
     *
     * nevrix_session
     */
    await createSession(user.id);

    return NextResponse.json({
      message: "Login realizado com sucesso.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);

    return NextResponse.json(
      {
        error:
          "Não foi possível realizar o login.",
      },
      { status: 500 }
    );
  }
}