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
// GET
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

    const { id } = await context.params;

    const appointment =
      await prisma.appointment.findFirst({
        where: {
          id,
          businessId: user.businessId,
        },

        include: {
          client: true,
          professional: true,
          service: true,
          payment: true,
        },
      });

    if (!appointment) {
      return NextResponse.json(
        {
          error:
            "Agendamento não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      appointment,
    });
  } catch (error) {
    console.error(
      "GET /api/appointments/[id]:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível carregar o agendamento.",
      },
      {
        status: 500,
      },
    );
  }
}

// ============================================================
// PUT - EDITAR
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

    const { id } = await context.params;

    const body = await request.json();

    const appointment =
      await prisma.appointment.findFirst({
        where: {
          id,
          businessId: user.businessId,
        },

        include: {
          payment: true,
        },
      });

    if (!appointment) {
      return NextResponse.json(
        {
          error:
            "Agendamento não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    // ========================================================
    // AGENDAMENTO CONCLUÍDO NÃO PODE SER EDITADO
    // ========================================================

    if (appointment.status === "COMPLETED") {
      return NextResponse.json(
        {
          error:
            "Este agendamento já foi concluído através do pagamento e não pode mais ser editado.",
          reason: "completed_not_editable",
        },
        {
          status: 409,
        },
      );
    }

    const clientName =
      typeof body.client === "string"
        ? body.client.trim()
        : "";

    const serviceName =
      typeof body.service === "string"
        ? body.service.trim()
        : "";

    const professionalName =
      typeof body.professional === "string"
        ? body.professional.trim()
        : "";

    const date =
      typeof body.date === "string"
        ? body.date.trim()
        : "";

    const time =
      typeof body.time === "string"
        ? body.time.trim()
        : "";

    const notes =
      typeof body.notes === "string"
        ? body.notes.trim()
        : null;

    const status =
      typeof body.status === "string"
        ? body.status.toUpperCase()
        : "";

    // ========================================================
    // VALIDAR
    // ========================================================

    if (
      !clientName ||
      !serviceName ||
      !professionalName ||
      !date ||
      !time
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

    const allowedStatuses = [
      "PENDING",
      "CONFIRMED",
      "CANCELLED",
      "NO_SHOW",
    ];

    if (
      !allowedStatuses.includes(status)
    ) {
      return NextResponse.json(
        {
          error:
            "Status inválido.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // DATA
    // ========================================================

    const appointmentDate = new Date(
      `${date}T${time}:00`,
    );

    if (Number.isNaN(appointmentDate.getTime())) {
      return NextResponse.json(
        {
          error:
            "Data ou horário inválido.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // BUSCAR CLIENTE
    // ========================================================

    const client =
      await prisma.client.findFirst({
        where: {
          businessId: user.businessId,
          name: {
            equals: clientName,
            mode: "insensitive",
          },
        },
      });

    if (!client) {
      return NextResponse.json(
        {
          error:
            "Cliente não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    // ========================================================
    // BUSCAR PROFISSIONAL
    // ========================================================

    const professional =
      await prisma.professional.findFirst({
        where: {
          businessId: user.businessId,
          name: {
            equals: professionalName,
            mode: "insensitive",
          },
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

    // ========================================================
    // BUSCAR SERVIÇO
    // ========================================================

    const service =
      await prisma.service.findFirst({
        where: {
          businessId: user.businessId,
          name: {
            equals: serviceName,
            mode: "insensitive",
          },
        },
      });

    if (!service) {
      return NextResponse.json(
        {
          error:
            "Serviço não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    // ========================================================
    // NÃO PERMITIR CONCLUIR MANUALMENTE
    // ========================================================

    if (status === "COMPLETED") {
      return NextResponse.json(
        {
          error:
            "O agendamento só pode ser concluído quando o pagamento for recebido.",
        },
        {
          status: 409,
        },
      );
    }

    // ========================================================
    // ATUALIZAR
    // ========================================================

    const updated =
      await prisma.appointment.update({
        where: {
          id,
        },

        data: {
          date: appointmentDate,

          status:
            status as
              | "PENDING"
              | "CONFIRMED"
              | "CANCELLED"
              | "NO_SHOW",

          notes: notes || null,

          clientId: client.id,

          professionalId:
            professional.id,

          serviceId: service.id,
        },

        include: {
          client: true,
          professional: true,
          service: true,
          payment: true,
        },
      });

    // ========================================================
    // RESPOSTA
    // ========================================================

    return NextResponse.json({
      message:
        "Agendamento atualizado com sucesso.",

      appointment: {
        id: updated.id,

        client: updated.client.name,
        clientId: updated.client.id,

        service: updated.service.name,
        serviceId: updated.service.id,

        professional:
          updated.professional.name,
        professionalId:
          updated.professional.id,

        date: updated.date
          .toISOString()
          .slice(0, 10),

        time: updated.date
          .toISOString()
          .slice(11, 16),

        status:
          updated.status.toLowerCase(),

        notes: updated.notes ?? "",

        payment: updated.payment
          ? "paid"
          : "pending",

        paymentAmount:
          updated.payment
            ? Number(
                updated.payment.amount,
              )
            : null,

        paymentMethod:
          updated.payment?.method ??
          null,

        paymentStatus:
          updated.payment?.status ??
          null,

        paidAt:
          updated.payment?.paidAt
            ?.toISOString() ?? null,
      },
    });
  } catch (error) {
    console.error(
      "PUT /api/appointments/[id]:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível atualizar o agendamento.",
      },
      {
        status: 500,
      },
    );
  }
}

// ============================================================
// DELETE
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

    const { id } = await context.params;

    const appointment =
      await prisma.appointment.findFirst({
        where: {
          id,
          businessId: user.businessId,
        },
      });

    if (!appointment) {
      return NextResponse.json(
        {
          error:
            "Agendamento não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.appointment.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,

      message:
        "Agendamento excluído com sucesso.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/appointments/[id]:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível excluir o agendamento.",
      },
      {
        status: 500,
      },
    );
  }
}