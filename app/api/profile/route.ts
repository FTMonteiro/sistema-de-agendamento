import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/*
|--------------------------------------------------------------------------
| GET /api/profile
|--------------------------------------------------------------------------
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

    if (user.role !== "EMPLOYEE") {
      return NextResponse.json(
        {
          error:
            "Esta área é destinada aos funcionários.",
        },
        {
          status: 403,
        },
      );
    }

    const professional =
      await prisma.professional.findUnique({
        where: {
          userId: user.id,
        },
      });

    if (!professional) {
      return NextResponse.json(
        {
          error:
            "Perfil profissional não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      profile: {
        id: professional.id,
        name: professional.name,
        email: professional.email ?? "",
        phone: professional.phone ?? "",
        specialty:
          professional.specialty ?? "",
        avatar:
          professional.avatar ?? null,
        active: professional.active,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/profile:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Erro ao carregar o perfil profissional.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
|--------------------------------------------------------------------------
| PUT /api/profile
|--------------------------------------------------------------------------
*/

export async function PUT(
  request: Request,
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

    if (user.role !== "EMPLOYEE") {
      return NextResponse.json(
        {
          error:
            "Apenas funcionários podem alterar este perfil.",
        },
        {
          status: 403,
        },
      );
    }

    const body = await request.json();

    const professional =
      await prisma.professional.findUnique({
        where: {
          userId: user.id,
        },
      });

    if (!professional) {
      return NextResponse.json(
        {
          error:
            "Perfil profissional não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : professional.name;

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : professional.phone;

    const specialty =
      typeof body.specialty === "string"
        ? body.specialty.trim()
        : professional.specialty;

    if (!name) {
      return NextResponse.json(
        {
          error:
            "O nome é obrigatório.",
        },
        {
          status: 400,
        },
      );
    }

    let avatar =
      professional.avatar;

    /*
    |--------------------------------------------------------------------------
    | AVATAR
    |--------------------------------------------------------------------------
    |
    | undefined = mantém
    | null      = remove
    | string    = atualiza
    |
    */

    if (body.avatar === null) {
      avatar = null;
    }

    if (
      typeof body.avatar === "string"
    ) {
      avatar = body.avatar;
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDAR IMAGEM
    |--------------------------------------------------------------------------
    */

    if (
      avatar &&
      !avatar.startsWith("data:image/")
    ) {
      return NextResponse.json(
        {
          error:
            "A imagem enviada não é válida.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | LIMITE
    |--------------------------------------------------------------------------
    */

    if (
      avatar &&
      avatar.length >
        7 * 1024 * 1024
    ) {
      return NextResponse.json(
        {
          error:
            "A imagem é demasiado grande.",
        },
        {
          status: 400,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | ATUALIZAR
    |--------------------------------------------------------------------------
    */

    const updated =
      await prisma.professional.update({
        where: {
          id: professional.id,
        },

        data: {
          name,
          phone: phone || null,
          specialty:
            specialty || null,
          avatar,
        },
      });

    return NextResponse.json({
      success: true,

      profile: {
        id: updated.id,
        name: updated.name,
        email: updated.email ?? "",
        phone: updated.phone ?? "",
        specialty:
          updated.specialty ?? "",
        avatar:
          updated.avatar ?? null,
        active: updated.active,
      },
    });
  } catch (error) {
    console.error(
      "PUT /api/profile:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Erro ao atualizar o perfil profissional.",
      },
      {
        status: 500,
      },
    );
  }
}