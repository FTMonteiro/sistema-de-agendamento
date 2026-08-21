import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// ============================================================
// GET - LISTAR PROFISSIONAIS
// ============================================================

export async function GET() {
  try {
    const businessId = process.env.NEXT_PUBLIC_BUSINESS_ID;

    if (!businessId) {
      return NextResponse.json(
        {
          error: "Business ID não configurado.",
        },
        {
          status: 500,
        },
      );
    }

    const professionals = await prisma.professional.findMany({
      where: {
        businessId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(professionals, {
      status: 200,
    });
  } catch (error) {
    console.error("Erro ao listar profissionais:", error);

    return NextResponse.json(
      {
        error: "Erro ao carregar profissionais.",
      },
      {
        status: 500,
      },
    );
  }
}

// ============================================================
// POST - CADASTRAR PROFISSIONAL
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // ========================================================
    // LER BODY
    // ========================================================

    const body = await request.json();

    // ========================================================
    // RECEBER DADOS
    // ========================================================

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : "";

    const specialty =
      typeof body.specialty === "string"
        ? body.specialty.trim()
        : "";

    // ========================================================
    // BUSINESS ID
    // ========================================================
    //
    // Primeiro tenta pegar do body.
    // Se não existir, usa o .env.
    //

    const businessId =
      typeof body.businessId === "string" &&
      body.businessId.trim()
        ? body.businessId.trim()
        : process.env.NEXT_PUBLIC_BUSINESS_ID?.trim() || "";

    // ========================================================
    // LOG DOS DADOS
    // ========================================================

    console.log("========================================");
    console.log("CADASTRO DE PROFISSIONAL");
    console.log("Nome:", name);
    console.log("Email:", email);
    console.log("Telefone:", phone);
    console.log("Especialidade:", specialty);
    console.log("Business ID:", businessId);
    console.log("========================================");

    // ========================================================
    // VALIDAR CAMPOS
    // ========================================================

    if (
      !name ||
      !email ||
      !phone ||
      !specialty ||
      !businessId
    ) {
      return NextResponse.json(
        {
          error: "Todos os campos são obrigatórios.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // VALIDAR EMAIL
    // ========================================================

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: "Informe um email válido.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // VERIFICAR BUSINESS
    // ========================================================

    const business = await prisma.business.findUnique({
      where: {
        id: businessId,
      },
    });

    if (!business) {
      return NextResponse.json(
        {
          error: "Estabelecimento não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    // ========================================================
    // VERIFICAR EMAIL EXISTENTE
    // ========================================================

    const existing = await prisma.professional.findFirst({
      where: {
        email,
        businessId,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "Já existe um profissional com este email.",
        },
        {
          status: 409,
        },
      );
    }

    // ========================================================
    // CRIAR PROFISSIONAL
    // ========================================================

    const professional =
      await prisma.professional.create({
        data: {
          name,
          email,
          phone,
          specialty,

          active: true,

          emailVerified: false,

          businessId,
        },
      });

    console.log(
      "Profissional criado:",
      professional.id,
    );

    // ========================================================
    // RETORNAR PROFISSIONAL
    // ========================================================

    return NextResponse.json(
      {
        message: "Profissional cadastrado.",

        professional: {
          id: professional.id,

          name: professional.name,

          email: professional.email,

          phone: professional.phone,

          specialty:
            professional.specialty,

          active:
            professional.active,

          emailVerified:
            professional.emailVerified,

          createdAt:
            professional.createdAt,

          updatedAt:
            professional.updatedAt,

          businessId:
            professional.businessId,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    // ========================================================
    // ERRO GERAL
    // ========================================================

    console.error(
      "========================================",
    );

    console.error(
      "ERRO INTERNO AO CADASTRAR PROFISSIONAL:",
    );

    console.error(error);

    console.error(
      "========================================",
    );

    return NextResponse.json(
      {
        error:
          "Erro interno ao cadastrar profissional.",

        details:
          process.env.NODE_ENV ===
          "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      {
        status: 500,
      },
    );
  }
}