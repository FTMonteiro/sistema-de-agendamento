import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireAuth,
  requireOwner,
} from "@/lib/auth";

import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/*
|--------------------------------------------------------------------------
| GET /api/services/:id
|--------------------------------------------------------------------------
|
| OWNER
|   → pode visualizar serviços ativos e inativos
|
| EMPLOYEE
|   → pode visualizar SOMENTE serviços ativos
|
| Ambos:
|   → somente serviços da própria empresa
|
|--------------------------------------------------------------------------
*/

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const user = await requireAuth();

    const { id } = await context.params;

    /*
    |--------------------------------------------------------------------------
    | VALIDAR ID
    |--------------------------------------------------------------------------
    */

    if (!id) {
      return NextResponse.json(
        {
          error: "ID do serviço não informado.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | BUSCAR SERVIÇO
    |--------------------------------------------------------------------------
    |
    | OWNER:
    |   pode acessar qualquer serviço.
    |
    | EMPLOYEE:
    |   só pode acessar serviços ativos.
    |
    */

    const service =
      await prisma.service.findFirst({
        where: {
          id,

          businessId: user.businessId,

          ...(user.role?.toUpperCase() ===
          "EMPLOYEE"
            ? {
                active: true,
              }
            : {}),
        },
      });

    /*
    |--------------------------------------------------------------------------
    | SERVIÇO NÃO ENCONTRADO
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | RESPOSTA
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      service,
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "GET /api/services/[id]:",
      error,
    );

    /*
    |--------------------------------------------------------------------------
    | NÃO AUTENTICADO
    |--------------------------------------------------------------------------
    */

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          error: "Não autenticado.",
        },
        {
          status: 401,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | ERRO GERAL
    |--------------------------------------------------------------------------
    */

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

/*
|--------------------------------------------------------------------------
| PUT /api/services/:id
|--------------------------------------------------------------------------
|
| SOMENTE OWNER
|
| O EMPLOYEE NÃO PODE EDITAR SERVIÇOS.
|
|--------------------------------------------------------------------------
*/

export async function PUT(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    /*
    |--------------------------------------------------------------------------
    | SOMENTE OWNER
    |--------------------------------------------------------------------------
    |
    | Se for EMPLOYEE:
    |
    | requireOwner()
    |      ↓
    | FORBIDDEN
    |
    */

    const user = await requireOwner();

    const { id } = await context.params;

    /*
    |--------------------------------------------------------------------------
    | VALIDAR ID
    |--------------------------------------------------------------------------
    */

    if (!id) {
      return NextResponse.json(
        {
          error: "ID do serviço não informado.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | BODY
    |--------------------------------------------------------------------------
    */

    const body = await request.json();

    /*
    |--------------------------------------------------------------------------
    | NOME
    |--------------------------------------------------------------------------
    */

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    /*
    |--------------------------------------------------------------------------
    | DESCRIÇÃO
    |--------------------------------------------------------------------------
    */

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : null;

    /*
    |--------------------------------------------------------------------------
    | PREÇO
    |--------------------------------------------------------------------------
    */

    const price = Number(body.price);

    /*
    |--------------------------------------------------------------------------
    | DURAÇÃO
    |--------------------------------------------------------------------------
    */

    const duration = Number(body.duration);

    /*
    |--------------------------------------------------------------------------
    | ATIVO
    |--------------------------------------------------------------------------
    */

    const active =
      typeof body.active === "boolean"
        ? body.active
        : true;

    /*
    |--------------------------------------------------------------------------
    | VALIDAR NOME
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | VALIDAR PREÇO
    |--------------------------------------------------------------------------
    */

    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Informe um preço válido maior que zero.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | LIMITAR CASAS DECIMAIS
    |--------------------------------------------------------------------------
    */

    if (
      Math.round(price * 100) / 100 !==
      price
    ) {
      return NextResponse.json(
        {
          error:
            "O preço pode ter no máximo duas casas decimais.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDAR DURAÇÃO
    |--------------------------------------------------------------------------
    */

    if (
      !Number.isInteger(duration) ||
      duration <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "A duração do serviço é inválida.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | LIMITE DE DURAÇÃO
    |--------------------------------------------------------------------------
    */

    if (duration > 1440) {
      return NextResponse.json(
        {
          error:
            "A duração não pode ultrapassar 24 horas.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | BUSCAR SERVIÇO DA EMPRESA
    |--------------------------------------------------------------------------
    |
    | Nunca confiamos no businessId enviado pelo frontend.
    |
    | Usamos:
    |
    | id
    | +
    | businessId da sessão
    |
    */

    const existingService =
      await prisma.service.findFirst({
        where: {
          id,

          businessId: user.businessId,
        },
      });

    /*
    |--------------------------------------------------------------------------
    | NÃO ENCONTRADO
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | ATUALIZAR SERVIÇO
    |--------------------------------------------------------------------------
    */

    const service =
      await prisma.service.update({
        where: {
          id: existingService.id,
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

    /*
    |--------------------------------------------------------------------------
    | RESPOSTA
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      service,
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "PUT /api/services/[id]:",
      error,
    );

    /*
    |--------------------------------------------------------------------------
    | NÃO AUTENTICADO
    |--------------------------------------------------------------------------
    */

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          error: "Não autenticado.",
        },
        {
          status: 401,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | NÃO É OWNER
    |--------------------------------------------------------------------------
    */

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          error:
            "Apenas o proprietário pode editar serviços.",

          code: "FORBIDDEN",
        },
        {
          status: 403,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | ERRO GERAL
    |--------------------------------------------------------------------------
    */

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

/*
|--------------------------------------------------------------------------
| PATCH /api/services/:id
|--------------------------------------------------------------------------
|
| SOMENTE OWNER
|
| Ativar / desativar serviço.
|
| EMPLOYEE NÃO PODE ALTERAR.
|
|--------------------------------------------------------------------------
*/

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    /*
    |--------------------------------------------------------------------------
    | SOMENTE OWNER
    |--------------------------------------------------------------------------
    */

    const user = await requireOwner();

    const { id } = await context.params;

    /*
    |--------------------------------------------------------------------------
    | VALIDAR ID
    |--------------------------------------------------------------------------
    */

    if (!id) {
      return NextResponse.json(
        {
          error: "ID do serviço não informado.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | BODY
    |--------------------------------------------------------------------------
    */

    const body = await request.json();

    /*
    |--------------------------------------------------------------------------
    | VALIDAR ACTIVE
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | BUSCAR SERVIÇO
    |--------------------------------------------------------------------------
    */

    const existingService =
      await prisma.service.findFirst({
        where: {
          id,

          businessId: user.businessId,
        },
      });

    /*
    |--------------------------------------------------------------------------
    | NÃO ENCONTRADO
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | ATUALIZAR ESTADO
    |--------------------------------------------------------------------------
    */

    const service =
      await prisma.service.update({
        where: {
          id: existingService.id,
        },

        data: {
          active: body.active,
        },
      });

    /*
    |--------------------------------------------------------------------------
    | RESPOSTA
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      service,
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "PATCH /api/services/[id]:",
      error,
    );

    /*
    |--------------------------------------------------------------------------
    | NÃO AUTENTICADO
    |--------------------------------------------------------------------------
    */

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          error: "Não autenticado.",
        },
        {
          status: 401,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | NÃO É OWNER
    |--------------------------------------------------------------------------
    */

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          error:
            "Apenas o proprietário pode alterar o estado dos serviços.",

          code: "FORBIDDEN",
        },
        {
          status: 403,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | ERRO GERAL
    |--------------------------------------------------------------------------
    */

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

/*
|--------------------------------------------------------------------------
| DELETE /api/services/:id
|--------------------------------------------------------------------------
|
| SOMENTE OWNER
|
| EMPLOYEE NÃO PODE EXCLUIR.
|
| Também não permitimos apagar serviços que já possuem
| histórico de agendamentos.
|
|--------------------------------------------------------------------------
*/

export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    /*
    |--------------------------------------------------------------------------
    | SOMENTE OWNER
    |--------------------------------------------------------------------------
    */

    const user = await requireOwner();

    const { id } = await context.params;

    /*
    |--------------------------------------------------------------------------
    | VALIDAR ID
    |--------------------------------------------------------------------------
    */

    if (!id) {
      return NextResponse.json(
        {
          error: "ID do serviço não informado.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | BUSCAR SERVIÇO
    |--------------------------------------------------------------------------
    */

    const existingService =
      await prisma.service.findFirst({
        where: {
          id,

          businessId: user.businessId,
        },
      });

    /*
    |--------------------------------------------------------------------------
    | NÃO ENCONTRADO
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | VERIFICAR HISTÓRICO
    |--------------------------------------------------------------------------
    */

    const appointments =
      await prisma.appointment.count({
        where: {
          serviceId:
            existingService.id,

          businessId:
            user.businessId,
        },
      });

    /*
    |--------------------------------------------------------------------------
    | NÃO APAGAR SE EXISTIR HISTÓRICO
    |--------------------------------------------------------------------------
    */

    if (appointments > 0) {
      const registros =
        appointments === 1
          ? "1 agendamento registrado"
          : `${appointments} agendamentos registrados`;

      return NextResponse.json(
        {
          error:
            `Não é possível excluir ${existingService.name}: há ${registros}. Para preservar o histórico, desative o serviço.`,

          reason:
            "has_appointments",

          appointments,
        },
        {
          status: 409,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | EXCLUIR
    |--------------------------------------------------------------------------
    */

    await prisma.service.delete({
      where: {
        id: existingService.id,
      },
    });

    /*
    |--------------------------------------------------------------------------
    | RESPOSTA
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        success: true,

        message:
          "Serviço excluído com sucesso.",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "DELETE /api/services/[id]:",
      error,
    );

    /*
    |--------------------------------------------------------------------------
    | NÃO AUTENTICADO
    |--------------------------------------------------------------------------
    */

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          error: "Não autenticado.",
        },
        {
          status: 401,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | NÃO É OWNER
    |--------------------------------------------------------------------------
    */

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          error:
            "Apenas o proprietário pode excluir serviços.",

          code: "FORBIDDEN",
        },
        {
          status: 403,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | ERRO GERAL
    |--------------------------------------------------------------------------
    */

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