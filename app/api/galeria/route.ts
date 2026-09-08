
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

/* CONFIGURAÇÕES*/

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

/*
 * ============================================================
 * TIPOS
 * ============================================================
 */

interface AuthUser {
  id: string;
  role: string;
  businessId: string;
}

/*
 * ============================================================
 * AUTENTICAÇÃO
 * ============================================================
 *
 * IMPORTANTE:
 * Substitui esta função pelo teu helper de autenticação
 * existente, caso já tenhas um requireStaff().
 *
 * Não devemos confiar em businessId enviado pelo frontend.
 * O businessId deve vir sempre do utilizador autenticado.
 * ============================================================
 */

async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthUser | null> {
  /*
   * Aqui vamos ligar ao sistema de autenticação do SLOTIX.
   *
   * Por enquanto, tentamos obter o utilizador através
   * do endpoint interno /api/auth/me.
   */

  try {
    const origin =
      request.headers.get("origin") ||
      request.nextUrl.origin;

    const response = await fetch(
      `${origin}/api/auth/me`,
      {
        method: "GET",
        headers: {
          cookie:
            request.headers.get("cookie") ?? "",
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

/*
 * ============================================================
 * RESPOSTAS
 * ============================================================
 */

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

/*
 * ============================================================
 * GET
 * ============================================================
 *
 * GET /api/galeria
 *
 * Retorna todas as imagens pertencentes ao Business
 * do utilizador autenticado.
 * ============================================================
 */

export async function GET(
  request: NextRequest
) {
  try {
    const user =
      await getAuthenticatedUser(request);

    if (!user) {
      return unauthorizedResponse();
    }

    /*
     * Apenas OWNER pode gerir a galeria.
     */
    if (
      user.role.toUpperCase() !== "OWNER"
    ) {
      return forbiddenResponse();
    }

    const images =
      await prisma.galleryImage.findMany({
        where: {
          businessId: user.businessId,
        },

        orderBy: [
          {
            isCover: "desc",
          },
          {
            createdAt: "desc",
          },
        ],

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
        images,
        total: images.length,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Erro ao buscar galeria:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Não foi possível carregar a galeria.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * ============================================================
 * POST
 * ============================================================
 *
 * POST /api/galeria
 *
 * Recebe uma imagem através de multipart/form-data.
 *
 * Campo esperado:
 *
 * image: File
 *
 * NOTA:
 * Nesta primeira implementação a imagem é convertida
 * para Data URL.
 *
 * Para produção, recomendamos trocar isso por Cloudinary,
 * S3, Cloudflare R2 ou Supabase Storage.
 * ============================================================
 */

export async function POST(
  request: NextRequest
) {
  try {
    /*
     * --------------------------------------------------------
     * AUTENTICAÇÃO
     * --------------------------------------------------------
     */

    const user =
      await getAuthenticatedUser(request);

    if (!user) {
      return unauthorizedResponse();
    }

    /*
     * --------------------------------------------------------
     * PERMISSÃO
     * --------------------------------------------------------
     */

    if (
      user.role.toUpperCase() !== "OWNER"
    ) {
      return forbiddenResponse();
    }

    /*
     * --------------------------------------------------------
     * FORM DATA
     * --------------------------------------------------------
     */

    const formData =
      await request.formData();

    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Nenhuma imagem foi enviada.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * --------------------------------------------------------
     * VALIDAR TIPO
     * --------------------------------------------------------
     */

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Formato de imagem não permitido. Use JPG, PNG ou WEBP.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * --------------------------------------------------------
     * VALIDAR TAMANHO
     * --------------------------------------------------------
     */

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A imagem não pode ultrapassar 10 MB.",
        },
        {
          status: 400,
        }
      );
    }

    if (file.size <= 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "O ficheiro enviado está vazio.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * --------------------------------------------------------
     * LER IMAGEM
     * --------------------------------------------------------
     */

    const buffer =
      Buffer.from(
        await file.arrayBuffer()
      );

    /*
     * --------------------------------------------------------
     * CONVERTER PARA DATA URL
     * --------------------------------------------------------
     *
     * Isto funciona para desenvolvimento.
     *
     * Em produção devemos usar storage externo.
     * --------------------------------------------------------
     */

    const base64 =
      buffer.toString("base64");

    const url =
      `data:${file.type};base64,${base64}`;

    /*
     * --------------------------------------------------------
     * VERIFICAR SE É A PRIMEIRA IMAGEM
     * --------------------------------------------------------
     */

    const totalImages =
      await prisma.galleryImage.count({
        where: {
          businessId: user.businessId,
        },
      });

    const isFirstImage =
      totalImages === 0;

    /*
     * --------------------------------------------------------
     * CRIAR REGISTO
     * --------------------------------------------------------
     */

    const image =
      await prisma.galleryImage.create({
        data: {
          name: file.name,
          url,
          size: file.size,
          isCover: isFirstImage,
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

    /*
     * --------------------------------------------------------
     * RESPOSTA
     * --------------------------------------------------------
     */

    return NextResponse.json(
      {
        success: true,
        message:
          "Imagem adicionada com sucesso.",
        image,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Erro ao adicionar imagem:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Não foi possível adicionar a imagem.",
      },
      {
        status: 500,
      }
    );
  }
}

