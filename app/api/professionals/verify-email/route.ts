
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// =====================================================
// GET - BUSCAR ESTABELECIMENTO DO UTILIZADOR
// =====================================================

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Não autenticado.",
        },
        { status: 401 },
      );
    }

    if (!user.businessId) {
      return NextResponse.json(
        {
          error:
            "O utilizador não está associado a nenhum estabelecimento.",
        },
        { status: 400 },
      );
    }

    const business = await prisma.business.findUnique({
      where: {
        id: user.businessId,
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
        { status: 404 },
      );
    }

    return NextResponse.json(business, {
      status: 200,
    });
  } catch (error) {
    console.error(
      "Erro ao buscar estabelecimento:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível carregar o estabelecimento.",
      },
      { status: 500 },
    );
  }
}

// =====================================================
// PUT - ATUALIZAR ESTABELECIMENTO
// =====================================================

export async function PUT(
  request: NextRequest,
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Não autenticado.",
        },
        { status: 401 },
      );
    }

    if (!user.businessId) {
      return NextResponse.json(
        {
          error:
            "O utilizador não está associado a nenhum estabelecimento.",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

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
      : [];

    const slotInterval =
      Number(body.slotInterval) || 30;

    const rules =
      typeof body.rules === "string"
        ? body.rules.trim()
        : "";

    if (!name) {
      return NextResponse.json(
        {
          error:
            "O nome do estabelecimento é obrigatório.",
        },
        { status: 400 },
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
        { status: 404 },
      );
    }

    const updated =
      await prisma.business.update({
        where: {
          id: user.businessId,
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

    return NextResponse.json(updated, {
      status: 200,
    });
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
      { status: 500 },
    );
  }
}

