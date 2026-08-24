
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};


export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    // ============================================================
    // SOMENTE OWNER
    // ============================================================

    const user = await requireOwner();

    const { id } = await context.params;

    // ============================================================
    // BODY
    // ============================================================

    const body = await request.json();

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    // ============================================================
    // VALIDAR PASSWORD
    // ============================================================

    if (!password) {
      return NextResponse.json(
        {
          error:
            "A palavra-passe é obrigatória.",
        },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error:
            "A palavra-passe deve ter pelo menos 8 caracteres.",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // BUSCAR PROFISSIONAL
    // ============================================================

    const professional =
      await prisma.professional.findFirst({
        where: {
          id,
          businessId: user.businessId,
        },
      });

    if (!professional) {
      return NextResponse.json(
        {
          error:
            "Profissional não encontrado.",
        },
        { status: 404 },
      );
    }

    // ============================================================
    // EMAIL É NECESSÁRIO PARA LOGIN
    // ============================================================

    if (!professional.email) {
      return NextResponse.json(
        {
          error:
            "Este profissional não possui email. Adicione um email antes de criar o acesso.",
        },
        { status: 400 },
      );
    }

    const email =
      professional.email
        .trim()
        .toLowerCase();

    // ============================================================
    // VERIFICAR SE JÁ POSSUI ACESSO
    // ============================================================

    if (professional.userId) {
      return NextResponse.json(
        {
          error:
            "Este profissional já possui acesso ao sistema.",
        },
        { status: 409 },
      );
    }

    // ============================================================
    // VERIFICAR SE O EMAIL JÁ É UTILIZADO
    // ============================================================

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "Este email já está associado a uma conta no sistema.",
        },
        { status: 409 },
      );
    }

    // ============================================================
    // CRIAR HASH
    // ============================================================

    const hashedPassword =
      await bcrypt.hash(
        password,
        12,
      );

    // ============================================================
    // CRIAR USER + VINCULAR AO PROFISSIONAL
    // ============================================================

    const result =
      await prisma.$transaction(
        async (transaction) => {
          const employee =
            await transaction.user.create({
              data: {
                name: professional.name,
                email,
                password: hashedPassword,
                role: "EMPLOYEE",
                businessId:
                  user.businessId,
              },
            });

          const updatedProfessional =
            await transaction.professional.update({
              where: {
                id: professional.id,
              },
              data: {
                userId: employee.id,
              },
            });

          return {
            employee,
            updatedProfessional,
          };
        },
      );

    // ============================================================
    // RESPOSTA
    // ============================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Acesso ao sistema criado com sucesso.",

        employee: {
          id: result.employee.id,
          name: result.employee.name,
          email: result.employee.email,
          role: result.employee.role,
        },

        professional: {
          id:
            result.updatedProfessional.id,
          userId:
            result.updatedProfessional.userId,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Erro ao criar acesso do profissional:",
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
          error:
            "Não autenticado.",
        },
        { status: 401 },
      );
    }

    // ============================================================
    // NÃO É OWNER
    // ============================================================

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          error:
            "Apenas o proprietário pode criar acessos para funcionários.",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        error:
          "Não foi possível criar o acesso do funcionário.",
      },
      { status: 500 },
    );
  }
}

