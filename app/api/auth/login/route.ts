
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
          error: "Email e palavra-passe são obrigatórios.",
        },
        { status: 400 }
      );
    }

    console.log("LOGIN: procurando utilizador:", email);

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      console.log("LOGIN: utilizador não encontrado");

      return NextResponse.json(
        {
          error: "Email ou palavra-passe incorretos.",
        },
        { status: 401 }
      );
    }

    console.log("LOGIN: utilizador encontrado:", user.id);

    const passwordCorrect = await compare(
      password,
      user.password
    );

    console.log(
      "LOGIN: palavra-passe correta:",
      passwordCorrect
    );

    if (!passwordCorrect) {
      return NextResponse.json(
        {
          error: "Email ou palavra-passe incorretos.",
        },
        { status: 401 }
      );
    }

    console.log("LOGIN: criando sessão...");

    await createSession(user.id);

    console.log("LOGIN: sessão criada com sucesso");

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
    console.error("LOGIN: ERRO COMPLETO");

    if (error instanceof Error) {
      console.error("Nome:", error.name);
      console.error("Mensagem:", error.message);
      console.error("Stack:", error.stack);
    } else {
      console.error(error);
    }

    return NextResponse.json(
      {
        error: "Não foi possível realizar o login.",
      },
      { status: 500 }
    );
  }
}

