
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// ============================================================
// GET
// OWNER     → configurações do estabelecimento
// EMPLOYEE  → dados do próprio perfil profissional
// ============================================================

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

    // ========================================================
    // EMPLOYEE
    // ========================================================

    if (user.role === "EMPLOYEE") {
      const employee = await prisma.professional.findUnique({
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
        },
      });

      /*
       * É possível que o funcionário tenha uma conta User
       * mas ainda não tenha um Professional associado.
       */

      return NextResponse.json(
        {
          role: "EMPLOYEE",

          employee: employee
            ? {
                id: employee.id,
                name: employee.name,
                email: employee.email ?? user.email,
                phone: employee.phone ?? "",
                specialty: employee.specialty ?? "",
                active: employee.active,
              }
            : {
                id: "",
                name: user.name,
                email: user.email,
                phone: "",
                specialty: "",
                active: true,
              },
        },
        {
          status: 200,
        },
      );
    }

    // ========================================================
    // OWNER
    // ========================================================

    const business = await prisma.business.findUnique({
      where: {
        id: user.businessId,
      },

      include: {
        _count: {
          select: {
            clients: true,
            professionals: true,
            services: true,
            appointments: true,
          },
        },
      },
    });

    if (!business) {
      return NextResponse.json(
        {
          error: "Estabelecimento não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      {
        role: "OWNER",

        business,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Erro ao carregar configurações:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível carregar as configurações.",
      },
      {
        status: 500,
      },
    );
  }
}

// ============================================================
// PUT
// SOMENTE OWNER
// ============================================================

export async function PUT(request: NextRequest) {
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

    // ========================================================
    // BLOQUEAR EMPLOYEE
    // ========================================================

    if (user.role !== "OWNER") {
      return NextResponse.json(
        {
          error:
            "Apenas o proprietário pode alterar as configurações do estabelecimento.",
        },
        {
          status: 403,
        },
      );
    }

    // ========================================================
    // LER BODY
    // ========================================================

    const body = await request.json();

    // ========================================================
    // NORMALIZAR DADOS
    // ========================================================

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const address =
      typeof body.address === "string"
        ? body.address.trim()
        : "";

    const logo =
      typeof body.logo === "string"
        ? body.logo.trim()
        : "";

    const openingTime =
      typeof body.openingTime === "string"
        ? body.openingTime.trim()
        : "";

    const closingTime =
      typeof body.closingTime === "string"
        ? body.closingTime.trim()
        : "";

    const workingDays = Array.isArray(
      body.workingDays,
    )
      ? body.workingDays
          .map(Number)
          .filter(
            (day: number) =>
              Number.isInteger(day) &&
              day >= 0 &&
              day <= 6,
          )
      : [1, 2, 3, 4, 5, 6];

    const slotInterval =
      Number(body.slotInterval) || 30;

    const rules =
      typeof body.rules === "string"
        ? body.rules.trim()
        : "";

    // ========================================================
    // VALIDAR NOME
    // ========================================================

    if (!name) {
      return NextResponse.json(
        {
          error:
            "O nome do estabelecimento é obrigatório.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // ATUALIZAR BUSINESS
    // ========================================================

    const business =
      await prisma.business.update({
        where: {
          id: user.businessId,
        },

        data: {
          name,
          phone,
          email,
          address,
          logo,
          openingTime,
          closingTime,
          workingDays,
          slotInterval,
          rules,
        },

        include: {
          _count: {
            select: {
              clients: true,
              professionals: true,
              services: true,
              appointments: true,
            },
          },
        },
      });

    // ========================================================
    // RESPOSTA
    // ========================================================

    return NextResponse.json(
      {
        role: "OWNER",

        business,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Erro ao atualizar estabelecimento:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível salvar as configurações.",
      },
      {
        status: 500,
      },
    );
  }
}

