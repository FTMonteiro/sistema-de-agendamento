
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";

// ============================================================
// GET - LISTAR PROFISSIONAIS
// SOMENTE OWNER
// ============================================================

export async function GET() {
  try {
    // ============================================================
    // SOMENTE OWNER PODE ACESSAR A EQUIPE
    // ============================================================

    const owner = await requireOwner();

    // ============================================================
    // BUSCAR PROFISSIONAIS DA EMPRESA DO OWNER
    // ============================================================

    const professionals =
      await prisma.professional.findMany({
        where: {
          businessId: owner.businessId,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(
      professionals,
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Erro ao listar profissionais:",
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
        },
        {
          status: 401,
        },
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
            "Apenas o proprietário pode acessar a equipe.",
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
          "Erro ao carregar profissionais.",
      },
      {
        status: 500,
      },
    );
  }
}

// ============================================================
// POST - CADASTRAR PROFISSIONAL
// SOMENTE OWNER
//
// createAccess = false
// → cria apenas o profissional.
//
// createAccess = true
// → cria profissional + utilizador EMPLOYEE.
// ============================================================

export async function POST(
  request: NextRequest,
) {
  try {
    // ============================================================
    // SOMENTE OWNER
    // ============================================================

    const owner = await requireOwner();

    // ============================================================
    // BUSINESS ID VEM DA SESSÃO
    // Nunca confiamos no frontend.
    // ============================================================

    const businessId = owner.businessId;

    // ============================================================
    // BODY
    // ============================================================

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : "";

    const specialty =
      typeof body.specialty === "string"
        ? body.specialty.trim()
        : "";

    const createAccess =
      body.createAccess === true;

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    // ============================================================
    // VALIDAR CAMPOS
    // ============================================================

    if (
      !name ||
      !email ||
      !phone ||
      !specialty
    ) {
      return NextResponse.json(
        {
          error:
            "Todos os campos do profissional são obrigatórios.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // VALIDAR EMAIL
    // ============================================================

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error:
            "Informe um email válido.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // VALIDAR PASSWORD QUANDO CRIAR ACESSO
    // ============================================================

    if (createAccess && !password) {
      return NextResponse.json(
        {
          error:
            "Defina uma palavra-passe para criar o acesso ao sistema.",
          code: "PASSWORD_REQUIRED",
        },
        {
          status: 400,
        },
      );
    }

    if (
      createAccess &&
      password.length < 8
    ) {
      return NextResponse.json(
        {
          error:
            "A palavra-passe deve ter pelo menos 8 caracteres.",
          code: "PASSWORD_TOO_SHORT",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // VERIFICAR ESTABELECIMENTO
    // ============================================================

    const business =
      await prisma.business.findUnique({
        where: {
          id: businessId,
        },

        select: {
          id: true,
        },
      });

    if (!business) {
      return NextResponse.json(
        {
          error:
            "Estabelecimento não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    // ============================================================
    // VERIFICAR PROFISSIONAL DUPLICADO
    // DENTRO DA MESMA EMPRESA
    // ============================================================

    const existingProfessional =
      await prisma.professional.findFirst({
        where: {
          email,
          businessId,
        },

        select: {
          id: true,
        },
      });

    if (existingProfessional) {
      return NextResponse.json(
        {
          error:
            "Já existe um profissional com este email nesta empresa.",
          code: "PROFESSIONAL_EMAIL_EXISTS",
        },
        {
          status: 409,
        },
      );
    }

    // ============================================================
    // VERIFICAR USER
    //
    // User.email é UNIQUE globalmente.
    // Só precisamos verificar quando vamos criar acesso.
    // ============================================================

    if (createAccess) {
      const existingUser =
        await prisma.user.findUnique({
          where: {
            email,
          },

          select: {
            id: true,
            businessId: true,
          },
        });

      if (existingUser) {
        return NextResponse.json(
          {
            error:
              "Este email já está associado a uma conta de utilizador.",
            code: "USER_EMAIL_EXISTS",
          },
          {
            status: 409,
          },
        );
      }
    }

    // ============================================================
    // HASH PASSWORD
    // ============================================================

    let hashedPassword:
      | string
      | null = null;

    if (createAccess) {
      hashedPassword =
        await bcrypt.hash(
          password,
          12,
        );
    }

    // ============================================================
    // TRANSAÇÃO
    //
    // createAccess = false
    // → Professional
    //
    // createAccess = true
    // → User EMPLOYEE
    // → Professional ligado ao User
    //
    // Se alguma operação falhar,
    // toda a transação é revertida.
    // ============================================================

    const result =
      await prisma.$transaction(
        async (transaction) => {
          let createdUser = null;

          // ======================================================
          // CRIAR USER EMPLOYEE
          // ======================================================

          if (createAccess) {
            createdUser =
              await transaction.user.create({
                data: {
                  name,
                  email,
                  password:
                    hashedPassword,
                  role: "EMPLOYEE",
                  businessId,
                },
              });
          }

          // ======================================================
          // CRIAR PROFISSIONAL
          // ======================================================

          const professional =
            await transaction.professional.create({
              data: {
                name,
                email,
                phone,
                specialty,

                active: true,

                emailVerified: false,

                businessId,

                userId:
                  createdUser?.id ?? null,
              },
            });

          return {
            professional,
            user: createdUser,
          };
        },
      );

    // ============================================================
    // RESPOSTA
    // ============================================================

    return NextResponse.json(
      {
        success: true,

        message: createAccess
          ? "Profissional cadastrado e acesso ao sistema criado com sucesso."
          : "Profissional cadastrado com sucesso.",

        accessCreated:
          createAccess,

        professional: {
          id:
            result.professional.id,

          name:
            result.professional.name,

          email:
            result.professional.email,

          phone:
            result.professional.phone,

          specialty:
            result.professional.specialty,

          active:
            result.professional.active,

          emailVerified:
            result.professional.emailVerified,

          businessId:
            result.professional.businessId,

          userId:
            result.professional.userId,

          createdAt:
            result.professional.createdAt,

          updatedAt:
            result.professional.updatedAt,
        },

        user: result.user
          ? {
              id:
                result.user.id,

              name:
                result.user.name,

              email:
                result.user.email,

              role:
                result.user.role,

              businessId:
                result.user.businessId,
            }
          : null,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Erro ao cadastrar profissional:",
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
        },
        {
          status: 401,
        },
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
            "Apenas o proprietário pode cadastrar profissionais.",
        },
        {
          status: 403,
        },
      );
    }

    // ============================================================
    // PRISMA - EMAIL DUPLICADO
    // ============================================================

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error:
            "Este email já está associado a uma conta ou profissional.",
          code: "EMAIL_EXISTS",
        },
        {
          status: 409,
        },
      );
    }

    // ============================================================
    // ERRO GERAL
    // ============================================================

    return NextResponse.json(
      {
        error:
          "Erro interno ao cadastrar profissional.",
      },
      {
        status: 500,
      },
    );
  }
}

