import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/*GET /api/clients*/

export async function GET() {
  try {
    const businessId =
      process.env.NEXT_PUBLIC_BUSINESS_ID;

    if (!businessId) {
      return NextResponse.json(
        {
          error:
            "Business ID não configurado.",
        },
        {
          status: 500,
        },
      );
    }

    const clients =
      await prisma.client.findMany({
        where: {
          businessId,
        },

        orderBy: {
          createdAt: "desc",
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
          "Erro ao buscar clientes.",
      },
      {
        status: 500,
      },
    );
  }
}

/* POST /api/clients*/

export async function POST(
  request: NextRequest,
) {
  try {
    const body = await request.json();

    const businessId =
      process.env.NEXT_PUBLIC_BUSINESS_ID;

    if (!businessId) {
      return NextResponse.json(
        {
          error:
            "Business ID não configurado.",
        },
        {
          status: 500,
        },
      );
    }

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string"
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

    /*VALIDAÇÕES*/

    if (!name) {
      return NextResponse.json(
        {
          error:
            "O nome do cliente é obrigatório.",
        },
        {
          status: 400,
        },
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          error:
            "O telefone do cliente é obrigatório.",
        },
        {
          status: 400,
        },
      );
    }

    /*CRIAR CLIENTE*/

    const client =
      await prisma.client.create({
        data: {
          name,
          email: email || null,
          phone,
          active,
          businessId,
        },
      });

    return NextResponse.json(
      client,
      {
        status: 201,
      },
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
      {
        status: 500,
      },
    );
  }
}