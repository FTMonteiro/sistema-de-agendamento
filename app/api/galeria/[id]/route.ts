import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface AuthUser {
  id: string;
  role: string;
  businessId: string;
}

async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthUser | null> {
  try {
    const origin =
      request.headers.get("origin") ||
      request.nextUrl.origin;

    const response = await fetch(
      `${origin}/api/auth/me`,
      {
        method: "GET",
        headers: {
          cookie: request.headers.get("cookie") ?? "",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data?.user) {
      return null;
    }

    const user = data.user;

    if (
      typeof user.id !== "string" ||
      typeof user.businessId !== "string" ||
      typeof user.role !== "string"
    ) {
      return null;
    }

    return {
      id: user.id,
      role: user.role,
      businessId: user.businessId,
    };
  } catch (error) {
    console.error(
      "Erro ao autenticar utilizador:",
      error
    );

    return null;
  }
}

function unauthorizedResponse() {
  return NextResponse.json(
    {
      success: false,
      error: "Não autenticado.",
    },
    {
      status: 401,
    }
  );
}

function forbiddenResponse() {
  return NextResponse.json(
    {
      success: false,
      error:
        "Não tem permissão para gerir a galeria.",
    },
    {
      status: 403,
    }
  );
}

/**
 * GET
 * Buscar uma imagem específica pelo ID.
 *
 * GET /api/galeria/:id
 */
export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const user =
      await getAuthenticatedUser(request);

    if (!user) {
      return unauthorizedResponse();
    }

    if (
      user.role.toUpperCase() !== "OWNER"
    ) {
      return forbiddenResponse();
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID da imagem não informado.",
        },
        {
          status: 400,
        }
      );
    }

    const image =
      await prisma.galleryImage.findFirst({
        where: {
          id,
          businessId: user.businessId,
        },
        select: {
          id: true,
          name: true,
          url: true,
          size: true,
          isCover: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    if (!image) {
      return NextResponse.json(
        {
          success: false,
          error: "Imagem não encontrada.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        image,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Erro ao buscar imagem da galeria:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Não foi possível carregar a imagem.",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * PATCH
 * Atualizar informações da imagem.
 *
 * Atualmente permite alterar:
 * - name
 *
 * A capa é tratada separadamente em:
 * PATCH /api/galeria/cover
 */
export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const user =
      await getAuthenticatedUser(request);

    if (!user) {
      return unauthorizedResponse();
    }

    if (
      user.role.toUpperCase() !== "OWNER"
    ) {
      return forbiddenResponse();
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID da imagem não informado.",
        },
        {
          status: 400,
        }
      );
    }

    const existingImage =
      await prisma.galleryImage.findFirst({
        where: {
          id,
          businessId: user.businessId,
        },
        select: {
          id: true,
          name: true,
          url: true,
          size: true,
          isCover: true,
        },
      });

    if (!existingImage) {
      return NextResponse.json(
        {
          success: false,
          error: "Imagem não encontrada.",
        },
        {
          status: 404,
        }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Dados enviados são inválidos.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof body !== "object" ||
      body === null
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados enviados são inválidos.",
        },
        {
          status: 400,
        }
      );
    }

    const data =
      body as Record<string, unknown>;

    const updateData: {
      name?: string;
    } = {};

    if ("name" in data) {
      if (
        typeof data.name !== "string" ||
        data.name.trim().length === 0
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "O nome da imagem é inválido.",
          },
          {
            status: 400,
          }
        );
      }

      updateData.name =
        data.name.trim();
    }

    if (
      Object.keys(updateData).length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Nenhum campo válido foi enviado para atualização.",
        },
        {
          status: 400,
        }
      );
    }

    const image =
      await prisma.galleryImage.update({
        where: {
          id: existingImage.id,
        },
        data: updateData,
        select: {
          id: true,
          name: true,
          url: true,
          size: true,
          isCover: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Imagem atualizada com sucesso.",
        image,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Erro ao atualizar imagem da galeria:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Não foi possível atualizar a imagem.",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * DELETE
 * Eliminar uma imagem específica.
 *
 * DELETE /api/galeria/:id
 */
export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const user =
      await getAuthenticatedUser(request);

    if (!user) {
      return unauthorizedResponse();
    }

    if (
      user.role.toUpperCase() !== "OWNER"
    ) {
      return forbiddenResponse();
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID da imagem não informado.",
        },
        {
          status: 400,
        }
      );
    }

    const image =
      await prisma.galleryImage.findFirst({
        where: {
          id,
          businessId: user.businessId,
        },
        select: {
          id: true,
          name: true,
          isCover: true,
        },
      });

    if (!image) {
      return NextResponse.json(
        {
          success: false,
          error: "Imagem não encontrada.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.galleryImage.delete({
      where: {
        id: image.id,
      },
    });

    /*
     * Se a imagem eliminada era a capa,
     * escolhemos automaticamente outra imagem
     * para ser a nova capa.
     */
    if (image.isCover) {
      const nextCover =
        await prisma.galleryImage.findFirst({
          where: {
            businessId: user.businessId,
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
          },
        });

      if (nextCover) {
        await prisma.galleryImage.update({
          where: {
            id: nextCover.id,
          },
          data: {
            isCover: true,
          },
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Imagem eliminada com sucesso.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Erro ao eliminar imagem da galeria:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Não foi possível eliminar a imagem.",
      },
      {
        status: 500,
      }
    );
  }
}