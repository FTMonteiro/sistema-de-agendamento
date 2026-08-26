import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    /*
     * =====================================================
     * UTILIZADOR AUTENTICADO
     * =====================================================
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
     * EMPLOYEE:
     *
     * User.id
     *    ↓
     * Professional.userId
     *
     * A FOTO DO FUNCIONÁRIO VEM DE:
     *
     * Professional.avatar
     *
     */

    let professional = null;

    if (
      user.role?.toUpperCase() ===
      "EMPLOYEE"
    ) {
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

            /*
             * =================================================
             * IMPORTANTE
             * =================================================
             *
             * Buscar a foto personalizada do funcionário.
             */

            avatar: true,

            active: true,

            emailVerified: true,

            businessId: true,

            userId: true,
          },
        });

      /*
       * ===================================================
       * VALIDAR VÍNCULO COM A EMPRESA
       * ===================================================
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
     * AVATAR DO UTILIZADOR
     * =====================================================
     *
     * OWNER:
     *   → não possui Professional
     *   → avatar = null
     *
     * EMPLOYEE:
     *   → usa Professional.avatar
     *
     */

    const userAvatar =
      user.role?.toUpperCase() ===
        "EMPLOYEE"
        ? professional?.avatar ??
          null
        : null;

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

          name:
            professional?.name ??
            user.name,

          email: user.email,

          role: user.role,

          businessId:
            user.businessId,

          /*
           * =================================================
           * FOTO DO FUNCIONÁRIO
           * =================================================
           *
           * O Header usa:
           *
           * user.avatar
           *
           * Agora ele recebe o valor de:
           *
           * Professional.avatar
           *
           */

          avatar: userAvatar,

          /*
           * =================================================
           * LOGO DA EMPRESA
           * =================================================
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