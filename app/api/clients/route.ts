import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/*
|--------------------------------------------------------------------------
| GET - LISTAR CLIENTES
|--------------------------------------------------------------------------
|
| OWNER + EMPLOYEE
|
| Agora também retorna:
| - número real de visitas
| - total realmente gasto
| - última visita
|
*/

export async function GET() {
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

    if (!user.businessId) {
      return NextResponse.json(
        {
          error:
            "O utilizador não está associado a um estabelecimento.",
        },
        {
          status: 403,
        },
      );
    }

    const clients = await prisma.client.findMany({
      where: {
        businessId: user.businessId,
      },

      orderBy: {
        name: "asc",
      },

      include: {
        visits: {
          orderBy: {
            visitedAt: "desc",
          },

          select: {
            id: true,
            visitedAt: true,

            payment: {
              select: {
                id: true,
                amount: true,
                status: true,
              },
            },
          },
        },
      },
    });

    const formattedClients = clients.map(
      (client) => {
        const visits = client.visits.length;

        const totalSpent = client.visits.reduce(
          (total, visit) => {
            if (
              visit.payment &&
              visit.payment.status === "PAID"
            ) {
              return (
                total +
                Number(visit.payment.amount)
              );
            }

            return total;
          },
          0,
        );

        const lastVisit =
          client.visits.length > 0
            ? client.visits[0].visitedAt.toISOString()
            : null;

        return {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          active: client.active,
          businessId: client.businessId,
          createdAt:
            client.createdAt.toISOString(),
          updatedAt:
            client.updatedAt.toISOString(),

          visits,
          totalSpent,
          lastVisit,
        };
      },
    );

    return NextResponse.json(
      formattedClients,
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "GET /api/clients:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os clientes.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST - CADASTRAR CLIENTE
|--------------------------------------------------------------------------
*/

export async function POST(
  request: NextRequest,
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

    const businessId = user.businessId;

    if (!businessId) {
      return NextResponse.json(
        {
          error:
            "O utilizador não possui um estabelecimento.",
        },
        {
          status: 400,
        },
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
        ? body.email.trim().toLowerCase()
        : null;

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : "";

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
    | VERIFICAR BUSINESS
    |--------------------------------------------------------------------------
    */

    const business =
      await prisma.business.findUnique({
        where: {
          id: businessId,
        },

        select: {
          id: true,
        },
      });

    if (!business) {
      return NextResponse.json(
        {
          error:
            "Estabelecimento não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CRIAR CLIENTE
    |--------------------------------------------------------------------------
    */

    const client =
      await prisma.client.create({
        data: {
          name,
          email,
          phone,
          active,
          businessId,
        },
      });

    return NextResponse.json(
      {
        ...client,

        visits: 0,
        totalSpent: 0,
        lastVisit: null,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "POST /api/clients:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível criar o cliente.",
      },
      {
        status: 500,
      },
    );
  }
}