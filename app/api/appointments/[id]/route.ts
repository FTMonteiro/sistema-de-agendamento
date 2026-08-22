import {
  NextRequest,
  NextResponse,
} from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// ============================================================
// GET - BUSCAR PROFISSIONAL
// ============================================================

export async function GET(
  _request: NextRequest,
  context: RouteContext,
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

    if (!user.businessId) {
      return NextResponse.json(
        {
          error:
            "O utilizador não está associado a nenhum estabelecimento.",
        },
        {
          status: 403,
        },
      );
    }

    const { id } =
      await context.params;

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
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(
      professional,
    );
  } catch (error) {
    console.error(
      "Erro ao buscar profissional:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Erro ao buscar profissional.",
      },
      {
        status: 500,
      },
    );
  }
}

// ============================================================
// PUT - EDITAR PROFISSIONAL
// ============================================================

export async function PUT(
  request: NextRequest,
  context: RouteContext,
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

    if (!user.businessId) {
      return NextResponse.json(
        {
          error:
            "O utilizador não está associado a nenhum estabelecimento.",
        },
        {
          status: 403,
        },
      );
    }

    const { id } =
      await context.params;

    const body =
      await request.json();

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

    if (
      !name ||
      !email ||
      !phone ||
      !specialty
    ) {
      return NextResponse.json(
        {
          error:
            "Todos os campos são obrigatórios.",
        },
        {
          status: 400,
        },
      );
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error:
            "Digite um email válido.",
        },
        {
          status: 400,
        },
      );
    }

    const existing =
      await prisma.professional.findFirst({
        where: {
          id,
          businessId: user.businessId,
        },
      });

    if (!existing) {
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

    if (email !== existing.email) {
      const emailUsed =
        await prisma.professional.findFirst({
          where: {
            email,
            businessId: user.businessId,

            NOT: {
              id,
            },
          },
        });

      if (emailUsed) {
        return NextResponse.json(
          {
            error:
              "Este email já está sendo usado.",
          },
          {
            status: 409,
          },
        );
      }
    }

    const emailChanged =
      email !== existing.email;

    const updated =
      await prisma.professional.update({
        where: {
          id,
        },

        data: {
          name,
          email,
          phone,
          specialty,

          ...(emailChanged && {
            emailVerified: false,
            emailVerificationToken:
              null,
            emailVerificationExpires:
              null,
          }),
        },
      });

    return NextResponse.json(
      updated,
    );
  } catch (error) {
    console.error(
      "Erro ao editar profissional:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível editar o profissional.",
      },
      {
        status: 500,
      },
    );
  }
}

// ============================================================
// PATCH - ATIVAR / DESATIVAR
// ============================================================

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
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

    if (!user.businessId) {
      return NextResponse.json(
        {
          error:
            "O utilizador não está associado a nenhum estabelecimento.",
        },
        {
          status: 403,
        },
      );
    }

    const { id } =
      await context.params;

    const body =
      await request.json();

    if (
      typeof body.active !== "boolean"
    ) {
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

    const existing =
      await prisma.professional.findFirst({
        where: {
          id,
          businessId: user.businessId,
        },
      });

    if (!existing) {
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

    const updated =
      await prisma.professional.update({
        where: {
          id,
        },

        data: {
          active: body.active,
        },
      });

    return NextResponse.json(
      updated,
    );
  } catch (error) {
    console.error(
      "Erro ao alterar estado:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível alterar o estado.",
      },
      {
        status: 500,
      },
    );
  }
}

// ============================================================
// DELETE - EXCLUIR
// ============================================================

export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
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

    if (!user.businessId) {
      return NextResponse.json(
        {
          error:
            "O utilizador não está associado a nenhum estabelecimento.",
        },
        {
          status: 403,
        },
      );
    }

    const { id } =
      await context.params;

    const existing =
      await prisma.professional.findFirst({
        where: {
          id,
          businessId: user.businessId,
        },
      });

    if (!existing) {
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

    const appointments =
      await prisma.appointment.count({
        where: {
          professionalId: id,
        },
      });

    if (appointments > 0) {
      const registros =
        appointments === 1
          ? "1 agendamento registrado"
          : `${appointments} agendamentos registrados`;

      return NextResponse.json(
        {
          error:
            `Não é possível excluir ${existing.name}: há ${registros}, e a exclusão apagaria esse histórico. Use "Desativar" — o profissional deixa de aparecer em novos agendamentos e os anteriores permanecem.`,

          reason:
            "has_appointments",

          appointments,
        },
        {
          status: 409,
        },
      );
    }

    await prisma.professional.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Profissional excluído com sucesso.",
    });
  } catch (error) {
    console.error(
      "Erro ao excluir profissional:",
      error,
    );

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