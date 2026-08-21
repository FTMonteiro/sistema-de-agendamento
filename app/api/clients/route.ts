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

    const clients =
      await prisma.client.findMany({
        where: {
          businessId: BUSINESS_ID,
        },
        orderBy: {
          name: "asc",
        },
      });

    return NextResponse.json(clients);
  } catch (error) {
    console.error(
      "Erro ao buscar clientes:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível carregar os clientes.",
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
          error:
            "O nome do cliente é obrigatório.",
        },
        { status: 400 },
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          error:
            "O telefone do cliente é obrigatório.",
        },
        { status: 400 },
      );
    }

    const client =
      await prisma.client.create({
        data: {
          name,
          email,
          phone,
          active,
          businessId: BUSINESS_ID,
        },
      });

    return NextResponse.json(
      client,
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Erro ao criar cliente:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível criar o cliente.",
      },
      { status: 500 },
    );
  }
}
