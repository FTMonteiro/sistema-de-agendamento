
import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";
import {
  getCurrentUser,
  requireOwner,
} from "@/lib/auth";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/*
|--------------------------------------------------------------------------
| GET - BUSCAR CLIENTE
|--------------------------------------------------------------------------
|
| OWNER    → pode visualizar
| EMPLOYEE → pode visualizar
|
*/

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Não autenticado.",
        },
        {
          status: 401,
        },
      );
    }

    const { id } = await context.params;

    const client =
      await prisma.client.findFirst({
        where: {
          id,
          businessId: user.businessId,
        },
      });

    if (!client) {
      return NextResponse.json(
        {
          error: "Cliente não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error(
      "Erro ao buscar cliente:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível buscar o cliente.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
|--------------------------------------------------------------------------
| PUT - EDITAR CLIENTE
|--------------------------------------------------------------------------
|
| OWNER    → pode editar
| EMPLOYEE → NÃO pode editar
|
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
    */

    const user = await requireOwner();

    const { id } = await context.params;

    /*
    |--------------------------------------------------------------------------
    | BUSCAR CLIENTE DENTRO DA EMPRESA
    |--------------------------------------------------------------------------
    */

    const existing =
      await prisma.client.findFirst({
        where: {
          id,
          businessId: user.businessId,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Cliente não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | BODY
    |--------------------------------------------------------------------------
    */

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string" &&
      body.email.trim()
        ? body.email.trim().toLowerCase()
        : null;

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : "";

    const active =
      typeof body.active === "boolean"
        ? body.active
        : existing.active;

    /*
    |--------------------------------------------------------------------------
    | VALIDAR NOME
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | VALIDAR TELEFONE
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | VALIDAR EMAIL
    |--------------------------------------------------------------------------
    */

    if (email) {
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        return NextResponse.json(
          {
            error:
              "Informe um email válido.",
          },
          {
            status: 400,
          },
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | ATUALIZAR
    |--------------------------------------------------------------------------
    */

    const client =
      await prisma.client.update({
        where: {
          id,
        },
        data: {
          name,
          email,
          phone,
          active,
        },
      });

    return NextResponse.json(client);
  } catch (error) {
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
            "Apenas o proprietário pode editar clientes.",
        },
        {
          status: 403,
        },
      );
    }

    console.error(
      "Erro ao atualizar cliente:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível atualizar o cliente.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
|--------------------------------------------------------------------------
| DELETE - EXCLUIR CLIENTE
|--------------------------------------------------------------------------
|
| OWNER    → pode excluir
| EMPLOYEE → NÃO pode excluir
|
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
    | BUSCAR CLIENTE
    |--------------------------------------------------------------------------
    */

    const existing =
      await prisma.client.findFirst({
        where: {
          id,
          businessId: user.businessId,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Cliente não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | VERIFICAR AGENDAMENTOS
    |--------------------------------------------------------------------------
    */

    const appointments =
      await prisma.appointment.count({
        where: {
          clientId: id,
        },
      });

    /*
    |--------------------------------------------------------------------------
    | NÃO APAGAR CLIENTE COM HISTÓRICO
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
            `Não é possível excluir ${existing.name}: há ${registros}, e a exclusão apagaria esse histórico. Use "Inativo" para manter o histórico do cliente.`,

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

    await prisma.client.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Cliente excluído com sucesso.",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
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
            "Apenas o proprietário pode excluir clientes.",
        },
        {
          status: 403,
        },
      );
    }

    console.error(
      "Erro ao excluir cliente:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível excluir o cliente.",
      },
      {
        status: 500,
      },
    );
  }
}

