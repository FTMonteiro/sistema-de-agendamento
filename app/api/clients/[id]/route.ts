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

    const existing =
      await prisma.client.findFirst({
        where: {
          id,
          businessId: BUSINESS_ID,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Cliente não encontrado.",
        },
        { status: 404 },
      );
    }

    const client =
      await prisma.client.update({
        where: { id },
        data: {
          name,
          email,
          phone,
          active,
        },
      });

    return NextResponse.json(client);
  } catch (error) {
    console.error(
      "Erro ao atualizar cliente:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível atualizar o cliente.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
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
      await prisma.client.findFirst({
        where: {
          id,
          businessId: BUSINESS_ID,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Cliente não encontrado.",
        },
        { status: 404 },
      );
    }

    const appointments =
      await prisma.appointment.count({
        where: {
          clientId: id,
        },
      });

    if (appointments > 0) {
      // Igual ao profissional: o schema tem onDelete Cascade, entao excluir o
      // cliente levaria os agendamentos dele embora.
      const registros =
        appointments === 1
          ? "1 agendamento registrado"
          : `${appointments} agendamentos registrados`;

      return NextResponse.json(
        {
          error: `Não é possível excluir ${existing.name}: há ${registros}, e a exclusão apagaria esse histórico. Use "Inativo" — o cliente deixa de aparecer em novos agendamentos e os anteriores permanecem.`,

          reason: "has_appointments",

          appointments,
        },
        { status: 409 },
      );
    }

    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message:
        "Cliente excluído com sucesso.",
    });
  } catch (error) {
    console.error(
      "Erro ao excluir cliente:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível excluir o cliente.",
      },
      { status: 500 },
    );
  }
}
