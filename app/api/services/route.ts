import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const businessId = process.env.NEXT_PUBLIC_BUSINESS_ID;

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID não configurado." },
        { status: 500 },
      );
    }

    const services = await prisma.service.findMany({
      where: {
        businessId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);

    return NextResponse.json(
      {
        error: "Erro ao buscar serviços.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const businessId = process.env.NEXT_PUBLIC_BUSINESS_ID;

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID não configurado." },
        { status: 500 },
      );
    }

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
          error: "O nome do serviço é obrigatório.",
        },
        { status: 400 },
      );
    }

    // Preço 0 nao e servico valido: Number("") tambem da 0, entao um campo
    // vazio passava por aqui antes.
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        {
          error:
            "Informe o preço do serviço. Tem de ser maior que zero.",
        },
        { status: 400 },
      );
    }

    if (
      !Number.isInteger(duration) ||
      duration <= 0
    ) {
      return NextResponse.json(
        {
          error: "A duração do serviço é inválida.",
        },
        { status: 400 },
      );
    }

    const service = await prisma.service.create({
      data: {
        name,
        description: description || null,
        price,
        duration,
        active,
        businessId,
      },
    });

    return NextResponse.json(
      service,
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao criar serviço:", error);

    return NextResponse.json(
      {
        error: "Não foi possível criar o serviço.",
      },
      { status: 500 },
    );
  }
}