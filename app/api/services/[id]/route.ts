import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/services/:id
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    const service = await prisma.service.findUnique({
      where: {
        id,
      },
    });

    if (!service) {
      return NextResponse.json(
        {
          error: "Serviço não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error(
      "Erro ao buscar serviço:",
      error,
    );

    return NextResponse.json(
      {
        error: "Erro ao buscar serviço.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * PUT /api/services/:id
 *
 * Editar serviço
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

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
        {
          status: 400,
        },
      );
    }

    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Informe o preço do serviço. Tem de ser maior que zero.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !Number.isFinite(duration) ||
      duration <= 0
    ) {
      return NextResponse.json(
        {
          error: "Duração inválida.",
        },
        {
          status: 400,
        },
      );
    }

    const existingService =
      await prisma.service.findUnique({
        where: {
          id,
        },
      });

    if (!existingService) {
      return NextResponse.json(
        {
          error: "Serviço não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    const service =
      await prisma.service.update({
        where: {
          id,
        },
        data: {
          name,
          description:
            description || null,
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
      {
        status: 500,
      },
    );
  }
}

/**
 * PATCH /api/services/:id
 *
 * Ativar / desativar serviço
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    const body = await request.json();

    if (
      typeof body.active !== "boolean"
    ) {
      return NextResponse.json(
        {
          error:
            "O campo active deve ser boolean.",
        },
        {
          status: 400,
        },
      );
    }

    const existingService =
      await prisma.service.findUnique({
        where: {
          id,
        },
      });

    if (!existingService) {
      return NextResponse.json(
        {
          error: "Serviço não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    const service =
      await prisma.service.update({
        where: {
          id,
        },
        data: {
          active: body.active,
        },
      });

    return NextResponse.json(service);
  } catch (error) {
    console.error(
      "Erro ao alterar estado do serviço:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível alterar o estado do serviço.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * DELETE /api/services/:id
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    const existingService =
      await prisma.service.findUnique({
        where: {
          id,
        },
      });

    if (!existingService) {
      return NextResponse.json(
        {
          error: "Serviço não encontrado.",
        },
        {
          status: 404,
        },
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
      {
        status: 500,
      },
    );
  }
}