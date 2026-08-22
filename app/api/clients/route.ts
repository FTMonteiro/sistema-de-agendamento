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

    const clients = await prisma.client.findMany({
      where: {
        businessId,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);

    return NextResponse.json(
      {
        error: "Não foi possível carregar os clientes.",
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

    const email =
      typeof body.email === "string" &&
      body.email.trim()
        ? body.email.trim()
        : null;

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : "";

    const active =
      typeof body.active === "boolean"
        ? body.active
        : true;

    if (!name) {
      return NextResponse.json(
        {
          error: "O nome do cliente é obrigatório.",
        },
        { status: 400 },
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          error: "O telefone do cliente é obrigatório.",
        },
        { status: 400 },
      );
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        active,
        businessId,
      },
    });

    return NextResponse.json(client, {
      status: 201,
    });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);

    return NextResponse.json(
      {
        error: "Não foi possível criar o cliente.",
      },
      { status: 500 },
    );
  }
}