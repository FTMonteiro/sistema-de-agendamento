import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

// ============================================================
// GET - PERFIL DO UTILIZADOR AUTENTICADO
//
// OWNER:
//   → não utiliza esta rota no SettingsPage.
//
// EMPLOYEE:
//   → retorna o seu próprio perfil profissional.
//
// RELAÇÃO:
//
// User
//   ↓
// Professional.userId
//
// IMPORTANTE:
// Nunca recebemos userId pelo frontend.
// O utilizador vem da sessão autenticada.
// ============================================================

export async function GET() {
  try {
    // ============================================================
    // AUTENTICAÇÃO
    // ============================================================

    const user = await requireStaff();

    // ============================================================
    // ESTA ROTA É DESTINADA AO PERFIL PROFISSIONAL
    //
    // O SettingsPage só chama esta rota para EMPLOYEE.
    // Mesmo assim, mantemos a proteção no backend.
    // ============================================================

    if (user.role !== "EMPLOYEE") {
      return NextResponse.json(
        {
          error:
            "Esta rota é destinada ao perfil profissional.",
          code: "PROFILE_NOT_AVAILABLE",
        },
        {
          status: 403,
        },
      );
    }

    // ============================================================
    // BUSCAR PERFIL PROFISSIONAL
    //
    // NÃO usamos email.
    //
    // O vínculo correto é:
    //
    // Professional.userId = User.id
    //
    // Também verificamos businessId para impedir que um
    // profissional seja associado a outra empresa.
    // ============================================================

    const professional =
      await prisma.professional.findFirst({
        where: {
          userId: user.id,
          businessId: user.businessId,
        },
      });

    // ============================================================
    // PROFISSIONAL NÃO ENCONTRADO
    // ============================================================

    if (!professional) {
      return NextResponse.json(
        {
          error:
            "Perfil profissional não encontrado.",
          code: "PROFESSIONAL_PROFILE_NOT_FOUND",
        },
        {
          status: 404,
        },
      );
    }

    // ============================================================
    // RESPOSTA
    // ============================================================

    return NextResponse.json(
      {
        success: true,

        profile: {
          id: professional.id,

          name:
            professional.name,

          email:
            professional.email,

          phone:
            professional.phone,

          specialty:
            professional.specialty,

          avatar:
            professional.avatar ?? null,

          active:
            professional.active,

          emailVerified:
            professional.emailVerified,

          businessId:
            professional.businessId,

          userId:
            professional.userId,

          createdAt:
            professional.createdAt,

          updatedAt:
            professional.updatedAt,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "GET /api/profile:",
      error,
    );

    // ============================================================
    // NÃO AUTENTICADO
    // ============================================================

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          error: "Não autenticado.",
          code: "UNAUTHORIZED",
        },
        {
          status: 401,
        },
      );
    }

    // ============================================================
    // SEM PERMISSÃO
    // ============================================================

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          error:
            "Não tem permissão para acessar este perfil.",
          code: "FORBIDDEN",
        },
        {
          status: 403,
        },
      );
    }

    // ============================================================
    // ERRO GERAL
    // ============================================================

    return NextResponse.json(
      {
        error:
          "Erro ao carregar o perfil profissional.",
        code: "PROFILE_LOAD_ERROR",
      },
      {
        status: 500,
      },
    );
  }
}