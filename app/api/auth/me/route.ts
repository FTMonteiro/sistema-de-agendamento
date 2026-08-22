
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    /*
     * =====================================================
     * BUSCAR ESTABELECIMENTO DO UTILIZADOR
     * =====================================================
     */

    const business =
      await prisma.business.findUnique({
        where: {
          id: user.businessId,
        },

        select: {
          id: true,
          name: true,
          logo: true,
        },
      });

    /*
     * =====================================================
     * RESPOSTA
     * =====================================================
     */

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          businessId: user.businessId,

          /*
           * Logo do estabelecimento.
           *
           * Assim o Header pode usar:
           *
           * data.user.logo
           */
          logo: business?.logo ?? null,

          /*
           * Nome do estabelecimento.
           */
          businessName:
            business?.name ?? null,
        },

        business: business
          ? {
              id: business.id,
              name: business.name,
              logo: business.logo ?? null,
            }
          : null,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Erro ao carregar utilizador:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível carregar os dados do utilizador.",
      },
      {
        status: 500,
      },
    );
  }
}

