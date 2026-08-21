import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

const BUSINESS_ID =
  process.env.NEXT_PUBLIC_BUSINESS_ID;

export async function PUT(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } =
      await context.params;

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

    const existing =
      await prisma.service.findFirst({
        where: {
          id,
          businessId: BUSINESS_ID,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Serviço não encontrado.",
        },
        { status: 404 },
      );
    }

    const service =
      await prisma.service.update({
        where: {
          id,
        },
        data: {
          name,
          description: description || null,
          price,
          duration,
          active,
        },
      });

    return NextResponse.json(service);
  } catch (error) {
    console.error(
      "Erro ao atualizar serviço:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível atualizar o serviço.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { id } =
      await context.params;

    if (!BUSINESS_ID) {
      return NextResponse.json(
        {
          error:
            "Business ID não configurado.",
        },
        { status: 500 },
      );
    }

    const existing =
      await prisma.service.findFirst({
        where: {
          id,
          businessId: BUSINESS_ID,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Serviço não encontrado.",
        },
        { status: 404 },
      );
    }

    await prisma.service.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message:
        "Serviço excluído com sucesso.",
    });
  } catch (error) {
    console.error(
      "Erro ao excluir serviço:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível excluir o serviço.",
      },
      { status: 500 },
    );
  }
}