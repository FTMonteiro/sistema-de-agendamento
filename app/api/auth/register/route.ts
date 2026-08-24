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
    // VALIDAÇÕES
    // ============================================================

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "O nome completo é obrigatório.",
          code: "NAME_REQUIRED",
        },
        { status: 400 },
      );
    }

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          error: "O nome da empresa é obrigatório.",
          code: "COMPANY_REQUIRED",
        },
        { status: 400 },
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "O email é obrigatório.",
          code: "EMAIL_REQUIRED",
        },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Informe um email válido.",
          code: "INVALID_EMAIL",
        },
        { status: 400 },
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          error: "A palavra-passe é obrigatória.",
          code: "PASSWORD_REQUIRED",
        },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A palavra-passe deve ter pelo menos 8 caracteres.",
          code: "PASSWORD_TOO_SHORT",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // VERIFICAR SE O EMAIL JÁ EXISTE
    // ============================================================

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      console.log(
        "⚠️ Tentativa de criar conta com email existente:",
        email,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Não foi possível criar essa conta porque esse email já está cadastrado.",
          code: "ACCOUNT_EXISTS",
        },
        { status: 409 },
      );
    }

    // ============================================================
    // CRIAR HASH DA PALAVRA-PASSE
    // ============================================================

    const hashedPassword = await bcrypt.hash(
      password,
      12,
    );

    // ============================================================
    // CRIAR EMPRESA + UTILIZADOR
    // ============================================================

    const result = await prisma.$transaction(
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
    // SUCESSO
    // ============================================================

    console.log(
      "✅ Conta criada com sucesso:",
      result.user.email,
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Conta criada com sucesso. Faça login para continuar.",

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

        redirectTo: "/login",
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error(
      "❌ Erro ao criar conta:",
      error,
    );

    // ============================================================
    // EMAIL DUPLICADO
    // ============================================================

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Não foi possível criar essa conta porque esse email já está cadastrado.",
          code: "ACCOUNT_EXISTS",
        },
        { status: 409 },
      );
    }

    // ============================================================
    // ERRO GERAL
    // ============================================================

    return NextResponse.json(
      {
        success: false,
        error:
          "Não foi possível criar a conta. Tente novamente.",
        code: "REGISTER_ERROR",
      },
      { status: 500 },
    );
  }
}