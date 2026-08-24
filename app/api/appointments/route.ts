import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// ============================================================
// GET - LISTAR AGENDAMENTOS
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

    const appointments = await prisma.appointment.findMany({
      where: {
        businessId: user.businessId,
      },

      orderBy: {
        date: "asc",
      },

      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },

        professional: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            specialty: true,
          },
        },

        service: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
          },
        },

        payment: true,
      },
    });

    const formattedAppointments = appointments.map(
      (appointment) => {
        const servicePrice = Number(
          appointment.service.price,
        );

        const paymentAmount = appointment.payment
          ? Number(appointment.payment.amount)
          : null;

        return {
          // ==================================================
          // IDENTIFICAÇÃO
          // ==================================================

          id: appointment.id,

          // ==================================================
          // CLIENTE
          // ==================================================

          client: appointment.client.name,

          clientId: appointment.client.id,

          // ==================================================
          // SERVIÇO
          // ==================================================

          service: appointment.service.name,

          serviceId: appointment.service.id,

          /*
           * IMPORTANTE:
           * Agora o preço é enviado para o frontend.
           */

          price: servicePrice,

          // ==================================================
          // PROFISSIONAL
          // ==================================================

          professional:
            appointment.professional.name,

          professionalId:
            appointment.professional.id,

          // ==================================================
          // DATA / HORA
          // ==================================================

          date: appointment.date
            .toISOString()
            .slice(0, 10),

          time: appointment.date
            .toISOString()
            .slice(11, 16),

          // ==================================================
          // STATUS
          // ==================================================

          status:
            appointment.status.toLowerCase(),

          // ==================================================
          // OBSERVAÇÕES
          // ==================================================

          notes:
            appointment.notes ?? "",

          // ==================================================
          // PAGAMENTO
          // ==================================================

          /*
           * O teu frontend usa:
           *
           * pending
           * paid
           *
           * Como o schema atual não tem pagamento parcial,
           * não vamos inventar "partial" aqui.
           */

          payment: appointment.payment
            ? "paid"
            : "pending",

          paymentId:
            appointment.payment?.id ?? null,

          /*
           * Valor do pagamento.
           */

          paymentAmount,

          /*
           * Método:
           *
           * CASH
           * CARD
           * TRANSFER
           * MOBILE_MONEY
           */

          paymentMethod:
            appointment.payment?.method ??
            null,

          /*
           * Estado real do pagamento:
           *
           * PENDING
           * PAID
           * REFUNDED
           */

          paymentStatus:
            appointment.payment?.status ??
            null,

          /*
           * Data em que foi pago.
           */

          paidAt:
            appointment.payment?.paidAt
              ?.toISOString() ?? null,

          // ==================================================
          // DATAS DO REGISTO
          // ==================================================

          createdAt:
            appointment.createdAt.toISOString(),

          updatedAt:
            appointment.updatedAt.toISOString(),
        };
      },
    );

    return NextResponse.json({
      appointments: formattedAppointments,
    });
  } catch (error) {
    console.error(
      "GET /api/appointments:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os agendamentos.",
      },
      {
        status: 500,
      },
    );
  }
}

// ============================================================
// POST - CRIAR AGENDAMENTO
// ============================================================

export async function POST(
  request: NextRequest,
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

    const body = await request.json();

    // ========================================================
    // CAMPOS
    // ========================================================

    const clientId =
      typeof body.clientId === "string"
        ? body.clientId.trim()
        : "";

    const professionalId =
      typeof body.professionalId === "string"
        ? body.professionalId.trim()
        : "";

    const serviceId =
      typeof body.serviceId === "string"
        ? body.serviceId.trim()
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

    // ========================================================
    // VALIDAÇÃO
    // ========================================================

    if (
      !clientId ||
      !professionalId ||
      !serviceId ||
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

    // ========================================================
    // DATA
    // ========================================================

    const appointmentDate = new Date(
      `${date}T${time}:00`,
    );

    if (
      Number.isNaN(
        appointmentDate.getTime(),
      )
    ) {
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
    // BUSCAR CLIENTE / PROFISSIONAL / SERVIÇO
    // ========================================================

    const [
      client,
      professional,
      service,
    ] = await Promise.all([
      prisma.client.findFirst({
        where: {
          id: clientId,
          businessId: user.businessId,
          active: true,
        },
      }),

      prisma.professional.findFirst({
        where: {
          id: professionalId,
          businessId: user.businessId,
          active: true,
        },
      }),

      prisma.service.findFirst({
        where: {
          id: serviceId,
          businessId: user.businessId,
          active: true,
        },
      }),
    ]);

    // ========================================================
    // VALIDAR CLIENTE
    // ========================================================

    if (!client) {
      return NextResponse.json(
        {
          error:
            "Cliente não encontrado ou está desativado.",
        },
        {
          status: 404,
        },
      );
    }

    // ========================================================
    // VALIDAR PROFISSIONAL
    // ========================================================

    if (!professional) {
      return NextResponse.json(
        {
          error:
            "Profissional não encontrado ou está desativado.",
        },
        {
          status: 404,
        },
      );
    }

    // ========================================================
    // VALIDAR SERVIÇO
    // ========================================================

    if (!service) {
      return NextResponse.json(
        {
          error:
            "Serviço não encontrado ou está desativado.",
        },
        {
          status: 404,
        },
      );
    }

    // ========================================================
    // CRIAR AGENDAMENTO
    // ========================================================

    const appointment =
      await prisma.appointment.create({
        data: {
          date: appointmentDate,

          status: "PENDING",

          notes: notes || null,

          businessId:
            user.businessId,

          clientId,

          professionalId,

          serviceId,
        },

        include: {
          client: true,

          professional: true,

          service: true,

          payment: true,
        },
      });

    // ========================================================
    // PREÇO
    // ========================================================

    const servicePrice = Number(
      appointment.service.price,
    );

    // ========================================================
    // RESPOSTA
    // ========================================================

    return NextResponse.json(
      {
        message:
          "Agendamento criado com sucesso.",

        appointment: {
          // ==================================================
          // ID
          // ==================================================

          id: appointment.id,

          // ==================================================
          // CLIENTE
          // ==================================================

          client:
            appointment.client.name,

          clientId:
            appointment.client.id,

          // ==================================================
          // SERVIÇO
          // ==================================================

          service:
            appointment.service.name,

          serviceId:
            appointment.service.id,

          price: servicePrice,

          // ==================================================
          // PROFISSIONAL
          // ==================================================

          professional:
            appointment.professional.name,

          professionalId:
            appointment.professional.id,

          // ==================================================
          // DATA / HORA
          // ==================================================

          date: appointment.date
            .toISOString()
            .slice(0, 10),

          time: appointment.date
            .toISOString()
            .slice(11, 16),

          // ==================================================
          // STATUS
          // ==================================================

          status:
            appointment.status.toLowerCase(),

          // ==================================================
          // OBSERVAÇÕES
          // ==================================================

          notes:
            appointment.notes ?? "",

          // ==================================================
          // PAGAMENTO
          // ==================================================

          payment: "pending",

          paymentId: null,

          paymentAmount: null,

          paymentMethod: null,

          paymentStatus: null,

          paidAt: null,

          // ==================================================
          // DATAS
          // ==================================================

          createdAt:
            appointment.createdAt.toISOString(),

          updatedAt:
            appointment.updatedAt.toISOString(),
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "POST /api/appointments:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível criar o agendamento.",
      },
      {
        status: 500,
      },
    );
  }
}