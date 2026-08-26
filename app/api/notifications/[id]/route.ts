import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

/*
|--------------------------------------------------------------------------
| PUT
|--------------------------------------------------------------------------
| Marcar uma notificação como lida.
|--------------------------------------------------------------------------
*/

export async function PUT(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const user = await requireAuth();

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "ID da notificação não informado.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | PROCURAR NOTIFICAÇÃO
    |--------------------------------------------------------------------------
    |
    | IMPORTANTE:
    |
    | Verificamos userId + businessId.
    |
    | Assim um utilizador não consegue alterar
    | notificações de outra empresa.
    |
    |--------------------------------------------------------------------------
    */

    const notification =
      await prisma.notification.findFirst({
        where: {
          id,

          userId: user.id,

          businessId: user.businessId,
        },
      });

    if (!notification) {
      return NextResponse.json(
        {
          error:
            "Notificação não encontrada.",
        },
        {
          status: 404,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | MARCAR COMO LIDA
    |--------------------------------------------------------------------------
    */

    const updated =
      await prisma.notification.update({
        where: {
          id: notification.id,
        },

        data: {
          read: true,

          readAt:
            notification.readAt ??
            new Date(),
        },
      });

    return NextResponse.json(
      {
        success: true,

        notification: {
          id: updated.id,

          title: updated.title,

          message: updated.message,

          type: updated.type,

          read: updated.read,

          resourceId:
            updated.resourceId,

          resourceType:
            updated.resourceType,

          createdAt:
            updated.createdAt.toISOString(),

          readAt:
            updated.readAt
              ? updated.readAt.toISOString()
              : null,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "PUT /api/notifications/[id]:",
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
          "Não foi possível atualizar a notificação.",
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
| Apagar uma notificação.
|--------------------------------------------------------------------------
*/

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const user = await requireAuth();

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "ID da notificação não informado.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CONFIRMAR PROPRIEDADE
    |--------------------------------------------------------------------------
    */

    const notification =
      await prisma.notification.findFirst({
        where: {
          id,

          userId: user.id,

          businessId: user.businessId,
        },
      });

    if (!notification) {
      return NextResponse.json(
        {
          error:
            "Notificação não encontrada.",
        },
        {
          status: 404,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | APAGAR
    |--------------------------------------------------------------------------
    */

    await prisma.notification.delete({
      where: {
        id: notification.id,
      },
    });

    return NextResponse.json(
      {
        success: true,

        message:
          "Notificação apagada com sucesso.",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "DELETE /api/notifications/[id]:",
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
          "Não foi possível apagar a notificação.",
      },
      {
        status: 500,
      },
    );
  }
}