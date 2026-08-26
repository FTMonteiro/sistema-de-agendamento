
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth";

// ============================================================
// HELPERS
// ============================================================

function isUnauthorized(error: unknown) {
  return (
    error instanceof Error &&
    error.message === "UNAUTHORIZED"
  );
}

function isForbidden(error: unknown) {
  return (
    error instanceof Error &&
    error.message === "FORBIDDEN"
  );
}

// ============================================================
// GET
// ============================================================

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const owner = await requireOwner();

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: "ID do profissional não informado.",
        },
        {
          status: 400,
        },
      );
    }

    const professional =
      await prisma.professional.findFirst({
        where: {
          id,
          businessId: owner.businessId,
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
          createdAt: true,
          updatedAt: true,

          user: {
            select: {
              id: true,
              email: true,
              role: true,
              active: true,
            },
          },
        },
      });

    if (!professional) {
      return NextResponse.json(
        {
          error: "Profissional não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      professional,
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "GET /api/professionals/[id]:",
      error,
    );

    if (isUnauthorized(error)) {
      return NextResponse.json(
        {
          error: "Não autenticado.",
        },
        {
          status: 401,
        },
      );
    }

    if (isForbidden(error)) {
      return NextResponse.json(
        {
          error:
            "Apenas o proprietário pode acessar este profissional.",
        },
        {
          status: 403,
        },
      );
    }

    return NextResponse.json(
      {
        error:
          "Não foi possível carregar o profissional.",
      },
      {
        status: 500,
      },
    );
  }
}

// ============================================================
// PUT
//
// EDITAR PROFISSIONAL
//
// Também permite alterar a senha da conta EMPLOYEE.
//
// password vazio:
// mantém senha atual
//
// password preenchido:
// altera senha
// ============================================================

export async function PUT(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const owner = await requireOwner();

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: "ID do profissional não informado.",
        },
        {
          status: 400,
        },
      );
    }

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

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const confirmPassword =
      typeof body.confirmPassword === "string"
        ? body.confirmPassword
        : "";

    // ==========================================================
    // VALIDAR CAMPOS
    // ==========================================================

    if (
      !name ||
      !email ||
      !phone ||
      !specialty
    ) {
      return NextResponse.json(
        {
          error:
            "Nome, email, telefone e especialidade são obrigatórios.",
        },
        {
          status: 400,
        },
      );
    }

    // ==========================================================
    // VALIDAR EMAIL
    // ==========================================================

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: "Digite um email válido.",
        },
        {
          status: 400,
        },
      );
    }

    // ==========================================================
    // VALIDAR NOVA SENHA
    // ==========================================================

    if (password) {
      if (password.length < 8) {
        return NextResponse.json(
          {
            error:
              "A nova palavra-passe deve ter pelo menos 8 caracteres.",
            code: "PASSWORD_TOO_SHORT",
          },
          {
            status: 400,
          },
        );
      }

      if (password !== confirmPassword) {
        return NextResponse.json(
          {
            error:
              "As palavras-passe não coincidem.",
            code: "PASSWORD_MISMATCH",
          },
          {
            status: 400,
          },
        );
      }
    }

    // ==========================================================
    // BUSCAR PROFISSIONAL
    // ==========================================================

    const existingProfessional =
      await prisma.professional.findFirst({
        where: {
          id,
          businessId: owner.businessId,
        },

        select: {
          id: true,
          email: true,
          userId: true,
        },
      });

    if (!existingProfessional) {
      return NextResponse.json(
        {
          error:
            "Profissional não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    // ==========================================================
    // VERIFICAR EMAIL DUPLICADO
    // ==========================================================

    const duplicatedProfessional =
      await prisma.professional.findFirst({
        where: {
          email,
          businessId: owner.businessId,

          NOT: {
            id,
          },
        },

        select: {
          id: true,
        },
      });

    if (duplicatedProfessional) {
      return NextResponse.json(
        {
          error:
            "Já existe outro profissional com este email.",
          code:
            "PROFESSIONAL_EMAIL_EXISTS",
        },
        {
          status: 409,
        },
      );
    }

    // ==========================================================
    // VERIFICAR EMAIL NA CONTA USER
    // ==========================================================

    if (existingProfessional.userId) {
      const duplicatedUser =
        await prisma.user.findFirst({
          where: {
            email,

            NOT: {
              id:
                existingProfessional.userId,
            },
          },

          select: {
            id: true,
          },
        });

      if (duplicatedUser) {
        return NextResponse.json(
          {
            error:
              "Este email já está associado a outra conta.",
            code: "USER_EMAIL_EXISTS",
          },
          {
            status: 409,
          },
        );
      }
    } else {
      const existingUser =
        await prisma.user.findUnique({
          where: {
            email,
          },

          select: {
            id: true,
          },
        });

      if (existingUser) {
        return NextResponse.json(
          {
            error:
              "Este email já está associado a uma conta.",
            code: "USER_EMAIL_EXISTS",
          },
          {
            status: 409,
          },
        );
      }
    }

    // ==========================================================
    // HASH DA NOVA SENHA
    // ==========================================================

    let hashedPassword:
      | string
      | undefined;

    if (password) {
      hashedPassword =
        await bcrypt.hash(
          password,
          12,
        );
    }

    // ==========================================================
    // TRANSAÇÃO
    // ==========================================================

    const updated =
      await prisma.$transaction(
        async (transaction) => {
          // ====================================================
          // ATUALIZAR PROFISSIONAL
          // ====================================================

          const professional =
            await transaction.professional.update({
              where: {
                id,
              },

              data: {
                name,
                email,
                phone,
                specialty,

                ...(email !==
                  existingProfessional.email && {
                  emailVerified: false,
                }),
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
                createdAt: true,
                updatedAt: true,
              },
            });

          // ====================================================
          // ATUALIZAR CONTA EMPLOYEE
          // ====================================================

          if (existingProfessional.userId) {
            await transaction.user.update({
              where: {
                id:
                  existingProfessional.userId,
              },

              data: {
                name,
                email,

                ...(hashedPassword && {
                  password:
                    hashedPassword,
                }),
              },
            });
          }

          return professional;
        },
      );

    return NextResponse.json(
      {
        success: true,

        message: password
          ? "Profissional e palavra-passe atualizados com sucesso."
          : "Profissional atualizado com sucesso.",

        passwordChanged:
          Boolean(password),

        professional: updated,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "PUT /api/professionals/[id]:",
      error,
    );

    if (isUnauthorized(error)) {
      return NextResponse.json(
        {
          error: "Não autenticado.",
        },
        {
          status: 401,
        },
      );
    }

    if (isForbidden(error)) {
      return NextResponse.json(
        {
          error:
            "Apenas o proprietário pode editar profissionais.",
        },
        {
          status: 403,
        },
      );
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error:
            "Este email já está associado a outra conta.",
          code: "EMAIL_EXISTS",
        },
        {
          status: 409,
        },
      );
    }

    return NextResponse.json(
      {
        error:
          "Não foi possível atualizar o profissional.",
      },
      {
        status: 500,
      },
    );
  }
}

// ============================================================
// PATCH
//
// ATIVAR / DESATIVAR
//
// PROFISSIONAL E USER EMPLOYEE
// sempre ficam sincronizados.
// ============================================================

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const owner = await requireOwner();

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: "ID do profissional não informado.",
        },
        {
          status: 400,
        },
      );
    }

    const body = await request.json();

    if (typeof body.active !== "boolean") {
      return NextResponse.json(
        {
          error:
            "O campo active deve ser booleano.",
        },
        {
          status: 400,
        },
      );
    }

    const active = body.active;

    // ==========================================================
    // BUSCAR PROFISSIONAL
    // ==========================================================

    const professional =
      await prisma.professional.findFirst({
        where: {
          id,
          businessId: owner.businessId,
        },

        select: {
          id: true,
          name: true,
          userId: true,
        },
      });

    if (!professional) {
      return NextResponse.json(
        {
          error:
            "Profissional não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    // ==========================================================
    // TRANSAÇÃO
    // ==========================================================

    const updated =
      await prisma.$transaction(
        async (transaction) => {
          // ====================================================
          // PROFISSIONAL
          // ====================================================

          const updatedProfessional =
            await transaction.professional.update({
              where: {
                id,
              },

              data: {
                active,
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
                createdAt: true,
                updatedAt: true,
              },
            });

          // ====================================================
          // CONTA EMPLOYEE
          // ====================================================

          if (professional.userId) {
            await transaction.user.update({
              where: {
                id:
                  professional.userId,
              },

              data: {
                active,
              },
            });
          }

          return updatedProfessional;
        },
      );

    return NextResponse.json(
      {
        success: true,

        message: active
          ? "Profissional e conta de acesso ativados."
          : "Profissional e conta de acesso desativados.",

        active,

        professional: updated,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "PATCH /api/professionals/[id]:",
      error,
    );

    if (isUnauthorized(error)) {
      return NextResponse.json(
        {
          error: "Não autenticado.",
        },
        {
          status: 401,
        },
      );
    }

    if (isForbidden(error)) {
      return NextResponse.json(
        {
          error:
            "Apenas o proprietário pode alterar o estado.",
        },
        {
          status: 403,
        },
      );
    }

    return NextResponse.json(
      {
        error:
          "Não foi possível alterar o estado do profissional.",
      },
      {
        status: 500,
      },
    );
  }
}

// ============================================================
// DELETE
//
// EXCLUI:
// 1. AGENDAMENTOS DO PROFISSIONAL
// 2. PROFISSIONAL
// 3. CONTA USER EMPLOYEE VINCULADA
//
// IMPORTANTE:
//
// O schema atual possui:
//
// Appointment.professional
// onDelete: Cascade
//
// Portanto, ao excluir o Professional,
// os Appointment relacionados também são removidos
// automaticamente pelo banco.
//
// A conta User também é excluída manualmente.
//
// NÃO BLOQUEAMOS MAIS A EXCLUSÃO POR EXISTIREM AGENDAMENTOS.
// ============================================================

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const owner = await requireOwner();

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "ID do profissional não informado.",
        },
        {
          status: 400,
        },
      );
    }

    // ==========================================================
    // BUSCAR PROFISSIONAL
    // ==========================================================

    const professional =
      await prisma.professional.findFirst({
        where: {
          id,
          businessId: owner.businessId,
        },

        select: {
          id: true,
          name: true,
          userId: true,
          businessId: true,
        },
      });

    if (!professional) {
      return NextResponse.json(
        {
          error:
            "Profissional não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    // ==========================================================
    // CONTAR AGENDAMENTOS
    //
    // Apenas para informar quantos registros
    // estavam associados antes da exclusão.
    // ==========================================================

    const appointmentsCount =
      await prisma.appointment.count({
        where: {
          professionalId:
            professional.id,
        },
      });

    // ==========================================================
    // EXCLUSÃO
    // ==========================================================

    await prisma.$transaction(
      async (transaction) => {
        // ======================================================
        // GUARDAR USER ID
        // ======================================================

        const userId =
          professional.userId;

        // ======================================================
        // EXCLUIR PROFISSIONAL
        //
        // O banco irá remover os agendamentos relacionados
        // devido ao onDelete: Cascade definido no schema.
        // ======================================================

        await transaction.professional.delete({
          where: {
            id,
          },
        });

        // ======================================================
        // EXCLUIR CONTA EMPLOYEE
        // ======================================================

        if (userId) {
          await transaction.user.delete({
            where: {
              id: userId,
            },
          });
        }
      },
    );

    // ==========================================================
    // RESPOSTA
    // ==========================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Profissional e conta de acesso excluídos com sucesso.",

        deletedProfessional: {
          id: professional.id,
          name: professional.name,
        },

        deletedUser:
          Boolean(professional.userId),

        deletedAppointments:
          appointmentsCount,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "DELETE /api/professionals/[id]:",
      error,
    );

    if (isUnauthorized(error)) {
      return NextResponse.json(
        {
          error: "Não autenticado.",
        },
        {
          status: 401,
        },
      );
    }

    if (isForbidden(error)) {
      return NextResponse.json(
        {
          error:
            "Apenas o proprietário pode excluir profissionais.",
        },
        {
          status: 403,
        },
      );
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error
    ) {
      const prismaError =
        error as {
          code?: string;
          meta?: unknown;
        };

      if (prismaError.code === "P2003") {
        return NextResponse.json(
          {
            error:
              "Não foi possível excluir o profissional porque existem registros relacionados que impedem a exclusão.",
            code: "RELATED_RECORDS",
          },
          {
            status: 409,
          },
        );
      }

      if (prismaError.code === "P2025") {
        return NextResponse.json(
          {
            error:
              "O profissional ou a conta associada já não existe.",
            code: "NOT_FOUND",
          },
          {
            status: 404,
          },
        );
      }
    }

    return NextResponse.json(
      {
        error:
          "Não foi possível excluir o profissional.",
      },
      {
        status: 500,
      },
    );
  }
}

