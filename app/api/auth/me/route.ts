
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    /*
     * =====================================================
     * UTILIZADOR AUTENTICADO
     * =====================================================
     *
     * O getCurrentUser() já:
     *
     * - valida o cookie
     * - valida o JWT
     * - procura o utilizador no banco
     * - retorna OWNER ou EMPLOYEE
     *
     */

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
     * BUSCAR ESTABELECIMENTO
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
     * BUSCAR PROFISSIONAL
     * =====================================================
     *
     * Somente EMPLOYEE precisa de Professional.
     *
     * A ligação é:
     *
     * User.id
     *      ↓
     * Professional.userId
     *
     */

    let professional = null;

    if (user.role === "EMPLOYEE") {
      professional =
        await prisma.professional.findUnique({
          where: {
            userId: user.id,
          },

          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            specialty: true,
            active: true,
            emailVerified: true,
            businessId: true,
            userId: true,
          },
        });

      /*
       * ===================================================
       * VALIDAR VÍNCULO
       * ===================================================
       *
       * O profissional precisa pertencer à mesma empresa
       * do funcionário.
       */

      if (
        professional &&
        professional.businessId !==
          user.businessId
      ) {
        console.error(
          "❌ Profissional pertence a outra empresa:",
          user.id,
        );

        professional = null;
      }
    }

    /*
     * =====================================================
     * RESPOSTA
     * =====================================================
     */

    return NextResponse.json(
      {
        /*
         * =================================================
         * UTILIZADOR
         * =================================================
         */

        user: {
          id: user.id,

          name: user.name,

          email: user.email,

          role: user.role,

          businessId:
            user.businessId,

          /*
           * OWNER
           *
           * O Header continua utilizando a logo
           * do estabelecimento.
           *
           * EMPLOYEE também pode visualizar a logo
           * do estabelecimento no Header.
           */

          logo:
            business?.logo ??
            null,

          businessName:
            business?.name ??
            null,
        },

        /*
         * =================================================
         * ESTABELECIMENTO
         * =================================================
         *
         * Continua disponível para o frontend.
         *
         * Porém, futuramente podemos limitar os dados
         * enviados para EMPLOYEE se necessário.
         */

        business: business
          ? {
              id: business.id,

              name: business.name,

              logo:
                business.logo ??
                null,
            }
          : null,

        /*
         * =================================================
         * PROFISSIONAL
         * =================================================
         *
         * OWNER:
         *
         * professional = null
         *
         * EMPLOYEE:
         *
         * professional = dados do profissional
         */

        professional,
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

