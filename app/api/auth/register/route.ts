import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const company =
      typeof body.company === "string"
        ? body.company.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    // ============================================================
    // VALIDAÇÃO
    // ============================================================

    if (!name) {
      return NextResponse.json(
        {
          error: "O nome completo é obrigatório.",
        },
        { status: 400 },
      );
    }

    if (!company) {
      return NextResponse.json(
        {
          error: "O nome da empresa é obrigatório.",
        },
        { status: 400 },
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          error: "O email é obrigatório.",
        },
        { status: 400 },
      );
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: "Informe um email válido.",
        },
        { status: 400 },
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          error: "A palavra-passe é obrigatória.",
        },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error:
            "A palavra-passe deve ter pelo menos 8 caracteres.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // VERIFICAR EMAIL
    // ============================================================

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "Já existe uma conta com este email.",
        },
        { status: 409 },
      );
    }

    // ============================================================
    // HASH DA PASSWORD
    // ============================================================

    const hashedPassword =
      await bcrypt.hash(password, 12);

    // ============================================================
    // CRIAR BUSINESS + USER
    // ============================================================

    const result =
      await prisma.$transaction(
        async (transaction) => {
          const business =
            await transaction.business.create({
              data: {
                name: company,
                email,
              },
            });

          const user =
            await transaction.user.create({
              data: {
                name,
                email,
                password: hashedPassword,
                role: "OWNER",
                businessId: business.id,
              },
            });

          return {
            business,
            user,
          };
        },
      );

    // ============================================================
    // RESPOSTA
    // Nunca enviar a password para o frontend
    // ============================================================

    return NextResponse.json(
      {
        message: "Conta criada com sucesso.",

        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          businessId: result.user.businessId,
        },

        business: {
          id: result.business.id,
          name: result.business.name,
          email: result.business.email,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Erro ao criar conta:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível criar a conta.",
      },
      { status: 500 },
    );
  }
}