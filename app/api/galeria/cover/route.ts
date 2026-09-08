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
 * PATCH
 *
 * Define uma imagem específica como capa.
 *
 * PATCH /api/galeria/cover
 *
 * Body:
 * {
 *   "imageId": "cm..."
 * }
 */
export async function PATCH(
  request: NextRequest
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

    const imageId = data.imageId;

    if (
      typeof imageId !== "string" ||
      imageId.trim().length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "O ID da imagem é obrigatório.",
        },
        {
          status: 400,
        }
      );
    }

    const image =
      await prisma.galleryImage.findFirst({
        where: {
          id: imageId,
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
          error:
            "Imagem não encontrada na galeria deste espaço.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Primeiro removemos a capa atual.
     * Depois definimos a imagem escolhida
     * como a nova capa.
     *
     * Tudo acontece dentro de uma transação.
     */
    const updatedImage =
      await prisma.$transaction(
        async (transaction) => {
          await transaction.galleryImage.updateMany(
            {
              where: {
                businessId:
                  user.businessId,
                isCover: true,
              },
              data: {
                isCover: false,
              },
            }
          );

          return transaction.galleryImage.update(
            {
              where: {
                id: image.id,
              },
              data: {
                isCover: true,
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
            }
          );
        }
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Imagem definida como capa com sucesso.",
        image: updatedImage,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Erro ao definir capa da galeria:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Não foi possível definir a imagem como capa.",
      },
      {
        status: 500,
      }
    );
  }
}