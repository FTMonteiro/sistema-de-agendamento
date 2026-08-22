import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

async function getBusinessId() {
  const userId = await getSessionUserId();

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      businessId: true,
    },
  });

  return user?.businessId ?? null;
}

export async function GET() {
  try {
    const businessId = await getBusinessId();

    if (!businessId) {
      return NextResponse.json(
        {
          error: "Sessão inválida ou empresa não encontrada.",
        },
        { status: 401 },
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
    const businessId = await getBusinessId();

    if (!businessId) {
      return NextResponse.json(
        {
          error: "Sessão inválida ou empresa não encontrada.",
        },
        { status: 401 },
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
          error: "O nome do serviço é obrigatório.",
        },
        { status: 400 },
      );
    }

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

    return NextResponse.json(service, {
      status: 201,
    });
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