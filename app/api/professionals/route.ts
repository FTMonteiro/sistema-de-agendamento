
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// ============================================================
// GET - LISTAR PROFISSIONAIS
// ============================================================

export async function GET() {
  try {
    // ========================================================
    // UTILIZADOR AUTENTICADO
    // ========================================================

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Não autenticado.",
        },
        {
          status: 401,
        },
      );
    }

    // ========================================================
    // BUSINESS ID VEM DA SESSÃO
    // ========================================================

    const businessId = user.businessId;

    if (!businessId) {
      return NextResponse.json(
        {
          error:
            "O utilizador autenticado não possui um estabelecimento.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // BUSCAR PROFISSIONAIS
    // ========================================================

    const professionals =
      await prisma.professional.findMany({
        where: {
          businessId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(
      professionals,
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Erro ao listar profissionais:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Erro ao carregar profissionais.",
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

export async function POST(
  request: NextRequest,
) {
  try {
    // ========================================================
    // UTILIZADOR AUTENTICADO
    // ========================================================

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Não autenticado.",
        },
        {
          status: 401,
        },
      );
    }

    // ========================================================
    // BUSINESS ID VEM DA SESSÃO
    // NÃO VEM DO FRONTEND
    // ========================================================

    const businessId = user.businessId;

    if (!businessId) {
      return NextResponse.json(
        {
          error:
            "O utilizador autenticado não possui um estabelecimento.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // BODY
    // ========================================================

    const body = await request.json();

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
    // VALIDAR CAMPOS
    // ========================================================

    if (
      !name ||
      !email ||
      !phone ||
      !specialty
    ) {
      return NextResponse.json(
        {
          error:
            "Todos os campos são obrigatórios.",
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

    const business =
      await prisma.business.findUnique({
        where: {
          id: businessId,
        },
      });

    if (!business) {
      return NextResponse.json(
        {
          error:
            "Estabelecimento não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    // ========================================================
    // VERIFICAR EMAIL
    // ========================================================

    const existing =
      await prisma.professional.findFirst({
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

    // ========================================================
    // RESPOSTA
    // ========================================================

    return NextResponse.json(
      {
        message:
          "Profissional cadastrado.",

        professional: {
          id: professional.id,
          name: professional.name,
          email: professional.email,
          phone: professional.phone,
          specialty:
            professional.specialty,
          active: professional.active,
          emailVerified:
            professional.emailVerified,
          businessId:
            professional.businessId,
          createdAt:
            professional.createdAt,
          updatedAt:
            professional.updatedAt,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Erro ao cadastrar profissional:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Erro interno ao cadastrar profissional.",
      },
      {
        status: 500,
      },
    );
  }
}

