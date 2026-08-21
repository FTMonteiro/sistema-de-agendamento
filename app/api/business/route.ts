import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BUSINESS_ID =
  process.env.NEXT_PUBLIC_BUSINESS_ID;

/*
 * O logo é guardado como data URL na própria coluna. Simples e sem depender de
 * armazenamento externo, mas a linha carrega a imagem inteira — daí o limite.
 */
const MAX_LOGO_LENGTH = 1_500_000;

function readOptionalText(
  value: unknown,
): string | null {
  return typeof value === "string" &&
    value.trim()
    ? value.trim()
    : null;
}

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

    const business =
      await prisma.business.findUnique({
        where: { id: BUSINESS_ID },

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
          error:
            "Estabelecimento não encontrado.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(business);
  } catch (error) {
    console.error(
      "GET /api/business:",
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

export async function PUT(
  request: Request,
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

    if (!name) {
      return NextResponse.json(
        {
          error:
            "O nome do estabelecimento é obrigatório.",
        },
        { status: 400 },
      );
    }

    const logo = readOptionalText(
      body.logo,
    );

    if (
      logo &&
      logo.length > MAX_LOGO_LENGTH
    ) {
      return NextResponse.json(
        {
          error:
            "A imagem do logo é muito grande. Use uma com menos de 1 MB.",
        },
        { status: 413 },
      );
    }

    const business =
      await prisma.business.update({
        where: { id: BUSINESS_ID },

        data: {
          name,
          email: readOptionalText(body.email),
          phone: readOptionalText(body.phone),
          address: readOptionalText(
            body.address,
          ),
          logo,
        },
      });

    return NextResponse.json(business);
  } catch (error) {
    console.error(
      "PUT /api/business:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível salvar o estabelecimento.",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
) {
  try {
    const body = await request.json();

    const { name, email, phone, address } =
      body;

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Nome do estabelecimento é obrigatório",
        },
        { status: 400 },
      );
    }

    const business =
      await prisma.business.create({
        data: {
          name,
          email: email || null,
          phone: phone || null,
          address: address || null,
        },
      });

    return NextResponse.json(business, {
      status: 201,
    });
  } catch (error) {
    console.error(
      "Erro ao criar estabelecimento:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Erro ao criar estabelecimento",
      },
      { status: 500 },
    );
  }
}
