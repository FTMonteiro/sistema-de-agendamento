import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PATCH() {
  try {
    const user = await requireAuth();

    const result =
      await prisma.notification.updateMany({
        where: {
          userId: user.id,
          businessId: user.businessId,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Todas as notificações foram marcadas como lidas.",
        updatedCount: result.count,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "PATCH /api/notifications/read-all:",
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
          "Não foi possível marcar as notificações como lidas.",
      },
      {
        status: 500,
      },
    );
  }
}