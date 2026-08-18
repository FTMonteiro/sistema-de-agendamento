import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    const client = await prisma.client.findUnique({
      where: {
        id,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Cliente não encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);

    return NextResponse.json(
      { error: "Erro ao buscar cliente." },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    const body = await request.json();

    const { name, email, phone, active } = body;

    if (!name || !phone) {
      return NextResponse.json(
        {
          error: "Nome e telefone são obrigatórios.",
        },
        { status: 400 },
      );
    }

    const client = await prisma.client.update({
      where: {
        id,
      },
      data: {
        name,
        email: email || null,
        phone,
        active:
          typeof active === "boolean"
            ? active
            : true,
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);

    return NextResponse.json(
      { error: "Erro ao atualizar cliente." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    const client = await prisma.client.findUnique({
      where: {
        id,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Cliente não encontrado." },
        { status: 404 },
      );
    }

    await prisma.client.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Cliente excluído com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);

    return NextResponse.json(
      { error: "Erro ao excluir cliente." },
      { status: 500 },
    );
  }
}