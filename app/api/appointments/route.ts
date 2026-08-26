import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

// ============================================================
// GET - LISTAR AGENDAMENTOS
//
// OWNER + EMPLOYEE
//
// Ambos podem consultar os agendamentos da própria empresa.
// ============================================================

export async function GET() {
  try {
    const user = await requireStaff();

    const appointments =
      await prisma.appointment.findMany({
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

    const formattedAppointments =
      appointments.map((appointment) => {
        const servicePrice =
          Number(
            appointment.service.price,
          );

        const paymentAmount =
          appointment.payment
            ? Number(
                appointment.payment.amount,
              )
            : null;

        return {
          id: appointment.id,

          client:
            appointment.client.name,

          clientId:
            appointment.client.id,

          service:
            appointment.service.name,

          serviceId:
            appointment.service.id,

          price:
            servicePrice,

          professional:
            appointment.professional.name,

          professionalId:
            appointment.professional.id,

          date:
            appointment.date
              .toISOString()
              .slice(0, 10),

          time:
            appointment.date
              .toISOString()
              .slice(11, 16),

          status:
            appointment.status.toLowerCase(),

          notes:
            appointment.notes ?? "",

          payment:
            appointment.payment
              ? "paid"
              : "pending",

          paymentId:
            appointment.payment?.id ??
            null,

          paymentAmount,

          paymentMethod:
            appointment.payment?.method ??
            null,

          paymentStatus:
            appointment.payment?.status ??
            null,

          paidAt:
            appointment.payment?.paidAt
              ?.toISOString() ?? null,

          createdAt:
            appointment.createdAt
              .toISOString(),

          updatedAt:
            appointment.updatedAt
              .toISOString(),
        };
      });

    return NextResponse.json(
      {
        appointments:
          formattedAppointments,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "GET /api/appointments:",
      error,
    );

    if (
      error instanceof Error &&
      error.message ===
        "UNAUTHORIZED"
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

    if (
      error instanceof Error &&
      error.message ===
        "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          error:
            "Não tem permissão para acessar a agenda.",
        },
        {
          status: 403,
        },
      );
    }

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
//
// OWNER + EMPLOYEE
//
// O EMPLOYEE pode criar um agendamento para um cliente
// que já esteja cadastrado na empresa.
//
// Não é criado nenhum novo cliente aqui.
// ============================================================

export async function POST(
  request: NextRequest,
) {
  try {
    const user = await requireStaff();

    const body =
      await request.json();

    // ============================================================
    // DADOS
    // ============================================================

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

    // ============================================================
    // VALIDAR CAMPOS
    // ============================================================

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

    // ============================================================
    // VALIDAR DATA
    // ============================================================

    const dateRegex =
      /^\d{4}-\d{2}-\d{2}$/;

    const timeRegex =
      /^\d{2}:\d{2}$/;

    if (!dateRegex.test(date)) {
      return NextResponse.json(
        {
          error:
            "A data deve estar no formato YYYY-MM-DD.",
        },
        {
          status: 400,
        },
      );
    }

    if (!timeRegex.test(time)) {
      return NextResponse.json(
        {
          error:
            "O horário deve estar no formato HH:mm.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // VALIDAR HORA
    // ============================================================

    const [hours, minutes] =
      time.split(":").map(Number);

    if (
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return NextResponse.json(
        {
          error:
            "Horário inválido.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // DATA DO AGENDAMENTO
    // ============================================================

    const appointmentDate =
      new Date(
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

    // ============================================================
    // NÃO PERMITIR PASSADO
    // ============================================================

    if (
      appointmentDate.getTime() <
      Date.now()
    ) {
      return NextResponse.json(
        {
          error:
            "Não é possível criar um agendamento no passado.",
          code:
            "APPOINTMENT_IN_PAST",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // CLIENTE
    //
    // O cliente já existe.
    //
    // Apenas reutilizamos o registro pelo ID.
    // ============================================================

    const client =
      await prisma.client.findFirst({
        where: {
          id: clientId,

          businessId:
            user.businessId,

          active: true,
        },
      });

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

    // ============================================================
    // PROFISSIONAL
    //
    // Somente profissionais ativos podem receber
    // novos agendamentos.
    // ============================================================

    const professional =
      await prisma.professional.findFirst({
        where: {
          id: professionalId,

          businessId:
            user.businessId,

          active: true,
        },
      });

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

    // ============================================================
    // SERVIÇO
    //
    // Somente serviços ativos podem ser agendados.
    // ============================================================

    const service =
      await prisma.service.findFirst({
        where: {
          id: serviceId,

          businessId:
            user.businessId,

          active: true,
        },
      });

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

    // ============================================================
    // CALCULAR FIM
    // ============================================================

    const newStart =
      appointmentDate;

    const newEnd =
      new Date(
        newStart.getTime() +
          service.duration *
            60 *
            1000,
      );

    // ============================================================
    // BUSCAR AGENDAMENTOS DO PROFISSIONAL
    // ============================================================

    const existingAppointments =
      await prisma.appointment.findMany({
        where: {
          businessId:
            user.businessId,

          professionalId:
            professional.id,

          status: {
            notIn: [
              "CANCELLED",
              "NO_SHOW",
            ],
          },
        },

        include: {
          service: {
            select: {
              duration: true,
            },
          },
        },
      });

    // ============================================================
    // VERIFICAR CONFLITO
    // ============================================================

    const conflictingAppointment =
      existingAppointments.find(
        (existing) => {
          const existingStart =
            existing.date;

          const existingEnd =
            new Date(
              existingStart.getTime() +
                existing.service
                  .duration *
                  60 *
                  1000,
            );

          return (
            newStart <
              existingEnd &&
            newEnd >
              existingStart
          );
        },
      );

    // ============================================================
    // CONFLITO
    // ============================================================

    if (conflictingAppointment) {
      return NextResponse.json(
        {
          error:
            `O profissional ${professional.name} já possui um agendamento neste horário.`,

          code:
            "PROFESSIONAL_SCHEDULE_CONFLICT",

          professional:
            professional.name,

          professionalId:
            professional.id,

          requestedStart:
            newStart.toISOString(),

          requestedEnd:
            newEnd.toISOString(),

          conflictingAppointmentId:
            conflictingAppointment.id,
        },
        {
          status: 409,
        },
      );
    }

    // ============================================================
    // CRIAR AGENDAMENTO
    // ============================================================

    const appointment =
      await prisma.appointment.create({
        data: {
          date:
            appointmentDate,

          status:
            "PENDING",

          notes:
            notes || null,

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

    // ============================================================
    // PREÇO
    // ============================================================

    const servicePrice =
      Number(
        appointment.service.price,
      );

    // ============================================================
    // RESPOSTA
    // ============================================================

    return NextResponse.json(
      {
        message:
          "Agendamento criado com sucesso.",

        appointment: {
          id:
            appointment.id,

          client:
            appointment.client.name,

          clientId:
            appointment.client.id,

          service:
            appointment.service.name,

          serviceId:
            appointment.service.id,

          price:
            servicePrice,

          professional:
            appointment.professional.name,

          professionalId:
            appointment.professional.id,

          date:
            appointment.date
              .toISOString()
              .slice(0, 10),

          time:
            appointment.date
              .toISOString()
              .slice(11, 16),

          status:
            appointment.status
              .toLowerCase(),

          notes:
            appointment.notes ?? "",

          payment:
            "pending",

          paymentId:
            null,

          paymentAmount:
            null,

          paymentMethod:
            null,

          paymentStatus:
            null,

          paidAt:
            null,

          createdAt:
            appointment.createdAt
              .toISOString(),

          updatedAt:
            appointment.updatedAt
              .toISOString(),
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

    // ============================================================
    // NÃO AUTENTICADO
    // ============================================================

    if (
      error instanceof Error &&
      error.message ===
        "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          error:
            "Não autenticado.",
        },
        {
          status: 401,
        },
      );
    }

    // ============================================================
    // SEM PERMISSÃO
    // ============================================================

    if (
      error instanceof Error &&
      error.message ===
        "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          error:
            "Não tem permissão para criar agendamentos.",
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