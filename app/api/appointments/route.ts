import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// ============================================================
// GET - LISTAR PROFISSIONAIS
// ============================================================

export async function GET() {
  try {
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

    if (!user.businessId) {
      return NextResponse.json(
        {
          error:
            "O utilizador não está associado a nenhum estabelecimento.",
        },
        {
          status: 403,
        },
      );
    }

    const professionals =
      await prisma.professional.findMany({
        where: {
          businessId: user.businessId,
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

    if (!user.businessId) {
      return NextResponse.json(
        {
          error:
            "O utilizador não está associado a nenhum estabelecimento.",
        },
        {
          status: 403,
        },
      );
    }

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

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error:
            "Informe um email válido.",
        },
        {
          status: 400,
        },
      );
    }

    const business =
      await prisma.business.findUnique({
        where: {
          id: user.businessId,
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

    const existing =
      await prisma.professional.findFirst({
        where: {
          email,
          businessId: user.businessId,
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

    const professional =
      await prisma.professional.create({
        data: {
          name,
          email,
          phone,
          specialty,
          active: true,
          emailVerified: false,

          // IMPORTANTE:
          // vem da sessão do utilizador
          businessId: user.businessId,
        },
      });

    return NextResponse.json(
      {
        message:
          "Profissional cadastrado.",

        professional,
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