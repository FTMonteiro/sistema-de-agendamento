import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const BUSINESS_ID =
  process.env.NEXT_PUBLIC_BUSINESS_ID;

export async function GET() {
  try {
    if (!BUSINESS_ID) {
      return NextResponse.json(
        {
          error:
            "Business ID não configurado.",
        },
        { status: 500 },
      );
    }

    const services =
      await prisma.service.findMany({
        where: {
          businessId: BUSINESS_ID,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(services);
  } catch (error) {
    console.error(
      "Erro ao buscar serviços:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível carregar os serviços.",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
) {
  try {
    if (!BUSINESS_ID) {
      return NextResponse.json(
        {
          error:
            "Business ID não configurado.",
        },
        { status: 500 },
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : null;

    const price = Number(body.price);

    const duration = Number(body.duration);

    const active =
      typeof body.active === "boolean"
        ? body.active
        : true;

    if (!name) {
      return NextResponse.json(
        {
          error:
            "O nome do serviço é obrigatório.",
        },
        { status: 400 },
      );
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      return NextResponse.json(
        {
          error:
            "O preço do serviço é inválido.",
        },
        { status: 400 },
      );
    }

    if (
      !Number.isFinite(duration) ||
      duration <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "A duração do serviço é inválida.",
        },
        { status: 400 },
      );
    }

    const service =
      await prisma.service.create({
        data: {
          name,
          description: description || null,
          price,
          duration,
          active,
          businessId: BUSINESS_ID,
        },
      });

    return NextResponse.json(
      service,
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Erro ao criar serviço:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível criar o serviço.",
      },
      { status: 500 },
    );
  }
}