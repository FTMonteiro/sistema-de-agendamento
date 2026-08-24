
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  requireAuth,
  requireOwner,
} from "@/lib/auth";

/*
|--------------------------------------------------------------------------
| GET /api/services
|--------------------------------------------------------------------------
|
| OWNER     → pode visualizar
| EMPLOYEE  → pode visualizar
|
*/

export async function GET() {
  try {
    const user = await requireAuth();

    const services = await prisma.service.findMany({
      where: {
        businessId: user.businessId,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error(
      "❌ Erro ao buscar serviços:",
      error,
    );

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          error: "Não autenticado.",
        },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        error: "Erro ao buscar serviços.",
      },
      { status: 500 },
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST /api/services
|--------------------------------------------------------------------------
|
| OWNER     → pode criar
| EMPLOYEE  → NÃO pode criar
|
*/

export async function POST(
  request: NextRequest,
) {
  try {
    /*
     * Somente OWNER pode criar serviços.
     */
    const user = await requireOwner();

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
    | VALIDAÇÕES
    |--------------------------------------------------------------------------
    */

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
      price <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Informe o preço do serviço. Tem de ser maior que zero.",
        },
        { status: 400 },
      );
    }

    if (
      !Number.isInteger(duration) ||
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

    /*
    |--------------------------------------------------------------------------
    | CRIAR SERVIÇO
    |--------------------------------------------------------------------------
    |
    | Usamos o businessId do utilizador autenticado.
    |
    */

    const service =
      await prisma.service.create({
        data: {
          name,
          description: description || null,
          price,
          duration,
          active,

          businessId: user.businessId,
        },
      });

    console.log(
      "✅ Serviço criado:",
      service.id,
      "por:",
      user.email,
      "role:",
      user.role,
    );

    return NextResponse.json(
      service,
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "❌ Erro ao criar serviço:",
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
        { status: 401 },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | SEM PERMISSÃO
    |--------------------------------------------------------------------------
    */

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          error:
            "Apenas o administrador da conta pode criar serviços.",
          code: "FORBIDDEN",
        },
        { status: 403 },
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
          "Não foi possível criar o serviço.",
      },
      { status: 500 },
    );
  }
}

