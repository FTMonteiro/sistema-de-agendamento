
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
| OWNER + EMPLOYEE
|
| Pode visualizar somente serviços da própria empresa.
|
*/

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const user =
      await requireAuth();

    const { id } =
      await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "ID do serviço não informado.",
        },
        {
          status: 400,
        },
      );
    }

    const service =
      await prisma.service.findFirst({
        where: {
          id,

          businessId:
            user.businessId,
        },
      });

    if (!service) {
      return NextResponse.json(
        {
          error:
            "Serviço não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      service,
    );
  } catch (error) {
    console.error(
      "GET /api/services/[id]:",
      error,
    );

    if (
      error instanceof Error &&
      error.message ===
        "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          error:
            "Não autenticado.",
        },
        {
          status: 401,
        },
      );
    }

    return NextResponse.json(
      {
        error:
          "Erro ao buscar serviço.",
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
| Editar serviço.
|
*/

export async function PUT(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const user =
      await requireOwner();

    const { id } =
      await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "ID do serviço não informado.",
        },
        {
          status: 400,
        },
      );
    }

    const body =
      await request.json();

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
      typeof body.description ===
      "string"
        ? body.description.trim()
        : null;

    /*
    |--------------------------------------------------------------------------
    | PREÇO
    |--------------------------------------------------------------------------
    */

    const price =
      Number(body.price);

    /*
    |--------------------------------------------------------------------------
    | DURAÇÃO
    |--------------------------------------------------------------------------
    */

    const duration =
      Number(body.duration);

    /*
    |--------------------------------------------------------------------------
    | ATIVO
    |--------------------------------------------------------------------------
    */

    const active =
      typeof body.active ===
      "boolean"
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
      Math.round(price * 100) /
        100 !==
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
      !Number.isInteger(
        duration,
      ) ||
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
    | LIMITE RAZOÁVEL
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
    | BUSCAR SERVIÇO
    |--------------------------------------------------------------------------
    |
    | O ID + businessId impedem acesso a serviços
    | pertencentes a outra empresa.
    |
    */

    const existingService =
      await prisma.service.findFirst({
        where: {
          id,

          businessId:
            user.businessId,
        },
      });

    if (!existingService) {
      return NextResponse.json(
        {
          error:
            "Serviço não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | ATUALIZAR
    |--------------------------------------------------------------------------
    */

    const service =
      await prisma.service.update({
        where: {
          id:
            existingService.id,
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

    return NextResponse.json(
      service,
    );
  } catch (error) {
    console.error(
      "PUT /api/services/[id]:",
      error,
    );

    if (
      error instanceof Error
    ) {
      if (
        error.message ===
        "UNAUTHORIZED"
      ) {
        return NextResponse.json(
          {
            error:
              "Não autenticado.",
          },
          {
            status: 401,
          },
        );
      }

      if (
        error.message ===
        "FORBIDDEN"
      ) {
        return NextResponse.json(
          {
            error:
              "Apenas o proprietário pode editar serviços.",
          },
          {
            status: 403,
          },
        );
      }
    }

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
*/

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const user =
      await requireOwner();

    const { id } =
      await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "ID do serviço não informado.",
        },
        {
          status: 400,
        },
      );
    }

    const body =
      await request.json();

    /*
    |--------------------------------------------------------------------------
    | VALIDAR ACTIVE
    |--------------------------------------------------------------------------
    */

    if (
      typeof body.active !==
      "boolean"
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
    | BUSCAR SERVIÇO DA EMPRESA
    |--------------------------------------------------------------------------
    */

    const existingService =
      await prisma.service.findFirst({
        where: {
          id,

          businessId:
            user.businessId,
        },
      });

    if (!existingService) {
      return NextResponse.json(
        {
          error:
            "Serviço não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | ATUALIZAR
    |--------------------------------------------------------------------------
    */

    const service =
      await prisma.service.update({
        where: {
          id:
            existingService.id,
        },

        data: {
          active:
            body.active,
        },
      });

    return NextResponse.json(
      service,
    );
  } catch (error) {
    console.error(
      "PATCH /api/services/[id]:",
      error,
    );

    if (
      error instanceof Error
    ) {
      if (
        error.message ===
        "UNAUTHORIZED"
      ) {
        return NextResponse.json(
          {
            error:
              "Não autenticado.",
          },
          {
            status: 401,
          },
        );
      }

      if (
        error.message ===
        "FORBIDDEN"
      ) {
        return NextResponse.json(
          {
            error:
              "Apenas o proprietário pode alterar serviços.",
          },
          {
            status: 403,
          },
        );
      }
    }

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
| Não permite excluir serviços que possuem histórico
| de agendamentos.
|
*/

export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const user =
      await requireOwner();

    const { id } =
      await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "ID do serviço não informado.",
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
    */

    const existingService =
      await prisma.service.findFirst({
        where: {
          id,

          businessId:
            user.businessId,
        },
      });

    if (!existingService) {
      return NextResponse.json(
        {
          error:
            "Serviço não encontrado.",
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
          serviceId: existingService.id,

          businessId:
            user.businessId,
        },
      });

    /*
    |--------------------------------------------------------------------------
    | NÃO APAGAR HISTÓRICO
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
        id:
          existingService.id,
      },
    });

    return NextResponse.json({
      success: true,

      message:
        "Serviço excluído com sucesso.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/services/[id]:",
      error,
    );

    if (
      error instanceof Error
    ) {
      if (
        error.message ===
        "UNAUTHORIZED"
      ) {
        return NextResponse.json(
          {
            error:
              "Não autenticado.",
          },
          {
            status: 401,
          },
        );
      }

      if (
        error.message ===
        "FORBIDDEN"
      ) {
        return NextResponse.json(
          {
            error:
              "Apenas o proprietário pode excluir serviços.",
          },
          {
            status: 403,
          },
        );
      }
    }

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

