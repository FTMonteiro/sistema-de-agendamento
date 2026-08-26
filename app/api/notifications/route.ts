
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

/*
|--------------------------------------------------------------------------
| TIPOS PERMITIDOS
|--------------------------------------------------------------------------
*/

const ALLOWED_TYPES = [
  "INFO",
  "SUCCESS",
  "WARNING",
  "ERROR",
] as const;

type NotificationType =
  (typeof ALLOWED_TYPES)[number];

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
|
| Buscar notificações do utilizador autenticado.
|
| IMPORTANTE:
| A origem dos dados é o PostgreSQL.
| Não existe localStorage aqui.
|
|--------------------------------------------------------------------------
*/

export async function GET() {
  try {
    const user = await requireAuth();

    const notifications =
      await prisma.notification.findMany({
        where: {
          userId: user.id,
          businessId: user.businessId,
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 100,
      });

    const unreadCount =
      await prisma.notification.count({
        where: {
          userId: user.id,
          businessId: user.businessId,
          read: false,
        },
      });

    const formattedNotifications =
      notifications.map(
        (notification) => ({
          id: notification.id,

          title: notification.title,

          message: notification.message,

          type: notification.type,

          read: notification.read,

          resourceId:
            notification.resourceId,

          resourceType:
            notification.resourceType,

          createdAt:
            notification.createdAt.toISOString(),

          readAt:
            notification.readAt
              ? notification.readAt.toISOString()
              : null,
        }),
      );

    return NextResponse.json(
      {
        success: true,

        notifications:
          formattedNotifications,

        total:
          formattedNotifications.length,

        unreadCount,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "GET /api/notifications:",
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
        {
          status: 401,
        },
      );
    }

    return NextResponse.json(
      {
        error:
          "Não foi possível carregar as notificações.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
|
| Criar uma notificação.
|
| O userId e businessId vêm SEMPRE da sessão.
|
|--------------------------------------------------------------------------
*/

export async function POST(
  request: NextRequest,
) {
  try {
    const user = await requireAuth();

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Corpo da requisição inválido.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !body ||
      typeof body !== "object"
    ) {
      return NextResponse.json(
        {
          error:
            "Dados da notificação inválidos.",
        },
        {
          status: 400,
        },
      );
    }

    const data =
      body as Record<
        string,
        unknown
      >;

    /*
    |--------------------------------------------------------------------------
    | TÍTULO
    |--------------------------------------------------------------------------
    */

    const title =
      typeof data.title === "string"
        ? data.title.trim()
        : "";

    /*
    |--------------------------------------------------------------------------
    | MENSAGEM
    |--------------------------------------------------------------------------
    */

    const message =
      typeof data.message === "string"
        ? data.message.trim()
        : "";

    /*
    |--------------------------------------------------------------------------
    | TIPO
    |--------------------------------------------------------------------------
    */

    const type =
      typeof data.type === "string"
        ? data.type.toUpperCase()
        : "INFO";

    /*
    |--------------------------------------------------------------------------
    | RECURSO
    |--------------------------------------------------------------------------
    */

    const resourceId =
      typeof data.resourceId === "string" &&
      data.resourceId.trim()
        ? data.resourceId.trim()
        : null;

    const resourceType =
      typeof data.resourceType === "string" &&
      data.resourceType.trim()
        ? data.resourceType.trim()
        : null;

    /*
    |--------------------------------------------------------------------------
    | VALIDAR TÍTULO
    |--------------------------------------------------------------------------
    */

    if (!title) {
      return NextResponse.json(
        {
          error:
            "O título da notificação é obrigatório.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDAR MENSAGEM
    |--------------------------------------------------------------------------
    */

    if (!message) {
      return NextResponse.json(
        {
          error:
            "A mensagem da notificação é obrigatória.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDAR TIPO
    |--------------------------------------------------------------------------
    */

    if (
      !ALLOWED_TYPES.includes(
        type as NotificationType,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Tipo de notificação inválido.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CRIAR NOTIFICAÇÃO
    |--------------------------------------------------------------------------
    */

    const notification =
      await prisma.notification.create({
        data: {
          userId: user.id,

          businessId:
            user.businessId,

          title,

          message,

          type:
            type as NotificationType,

          resourceId,

          resourceType,
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

        notification: {
          id: notification.id,

          title: notification.title,

          message: notification.message,

          type: notification.type,

          read: notification.read,

          resourceId:
            notification.resourceId,

          resourceType:
            notification.resourceType,

          createdAt:
            notification.createdAt.toISOString(),

          readAt:
            notification.readAt
              ? notification.readAt.toISOString()
              : null,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "POST /api/notifications:",
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
        {
          status: 401,
        },
      );
    }

    return NextResponse.json(
      {
        error:
          "Não foi possível criar a notificação.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
|
| APAGAR TODAS AS NOTIFICAÇÕES
|
| Só apaga as notificações:
|
| userId     = utilizador autenticado
| businessId = empresa do utilizador
|
| Portanto um utilizador nunca consegue apagar
| notificações de outra empresa.
|
|--------------------------------------------------------------------------
*/

export async function DELETE() {
  try {
    const user = await requireAuth();

    const result =
      await prisma.notification.deleteMany({
        where: {
          userId: user.id,

          businessId:
            user.businessId,
        },
      });

    return NextResponse.json(
      {
        success: true,

        message:
          "Notificações apagadas com sucesso.",

        deletedCount:
          result.count,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "DELETE /api/notifications:",
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
        {
          status: 401,
        },
      );
    }

    return NextResponse.json(
      {
        error:
          "Não foi possível apagar as notificações.",
      },
      {
        status: 500,
      },
    );
  }
}

