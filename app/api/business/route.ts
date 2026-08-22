import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// ============================================================
// GET - BUSCAR CONFIGURAÇÕES DO ESTABELECIMENTO
// ============================================================

export async function GET() {
  try {
    // ========================================================
    // PEGAR UTILIZADOR AUTENTICADO
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
            "O utilizador não está associado a nenhum estabelecimento.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // BUSCAR ESTABELECIMENTO
    // ========================================================

    const business = await prisma.business.findUnique({
      where: {
        id: businessId,
      },
      include: {
        _count: {
          select: {
            clients: true,
            professionals: true,
            services: true,
            appointments: true,
          },
        },
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

    return NextResponse.json(business);
  } catch (error) {
    console.error(
      "Erro ao carregar estabelecimento:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível carregar o estabelecimento.",
      },
      {
        status: 500,
      },
    );
  }
}

// ============================================================
// PUT - ATUALIZAR CONFIGURAÇÕES
// ============================================================

export async function PUT(request: NextRequest) {
  try {
    // ========================================================
    // PEGAR UTILIZADOR AUTENTICADO
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
    // BUSINESS ID DA SESSÃO
    // ========================================================

    const businessId = user.businessId;

    if (!businessId) {
      return NextResponse.json(
        {
          error:
            "O utilizador não está associado a nenhum estabelecimento.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // LER BODY
    // ========================================================

    const body = await request.json();

    // ========================================================
    // NORMALIZAR DADOS
    // ========================================================

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const address =
      typeof body.address === "string"
        ? body.address.trim()
        : "";

    const logo =
      typeof body.logo === "string"
        ? body.logo.trim()
        : "";

    const openingTime =
      typeof body.openingTime === "string"
        ? body.openingTime.trim()
        : "";

    const closingTime =
      typeof body.closingTime === "string"
        ? body.closingTime.trim()
        : "";

    const workingDays = Array.isArray(
      body.workingDays,
    )
      ? body.workingDays
          .map(Number)
          .filter(
            (day: number) =>
              Number.isInteger(day) &&
              day >= 0 &&
              day <= 6,
          )
      : [1, 2, 3, 4, 5, 6];

    const slotInterval =
      Number(body.slotInterval) || 30;

    const rules =
      typeof body.rules === "string"
        ? body.rules.trim()
        : "";

    // ========================================================
    // VALIDAR NOME
    // ========================================================

    if (!name) {
      return NextResponse.json(
        {
          error:
            "O nome do estabelecimento é obrigatório.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // ATUALIZAR
    // ========================================================

    const business =
      await prisma.business.update({
        where: {
          id: businessId,
        },
        data: {
          name,
          phone,
          email,
          address,
          logo,
          openingTime,
          closingTime,
          workingDays,
          slotInterval,
          rules,
        },
        include: {
          _count: {
            select: {
              clients: true,
              professionals: true,
              services: true,
              appointments: true,
            },
          },
        },
      });

    return NextResponse.json(business);
  } catch (error) {
    console.error(
      "Erro ao atualizar estabelecimento:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível salvar as configurações.",
      },
      {
        status: 500,
      },
    );
  }
}