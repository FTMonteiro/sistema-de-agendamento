import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

/* ============================================================
   TIPOS
============================================================ */

type AppointmentWithRelations = {
  id: string;
  date: Date;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;

  client: {
    id: string;
    name: string;
    email: string | null;
    phone: string;
  };

  professional: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    specialty: string | null;
  };

  service: {
    id: string;
    name: string;
    price: unknown;
    duration: number;
  };

  payment:
    | {
        id: string;
        amount: unknown;
        method: string;
        status: string;
        paidAt: Date | null;
      }
    | null;
};

/* ============================================================
   FORMATAR AGENDAMENTO
============================================================ */

function formatAppointment(
  appointment: AppointmentWithRelations,
) {
  const servicePrice = Number(
    appointment.service?.price ?? 0,
  );

  const payment = appointment.payment;

  const paymentAmount = payment
    ? Number(payment.amount ?? 0)
    : null;

  return {
    id: appointment.id,

    /* --------------------------------------------------------
       CLIENTE
    -------------------------------------------------------- */

    client:
      appointment.client?.name ?? "",

    clientId:
      appointment.client?.id ?? null,

    clientEmail:
      appointment.client?.email ?? null,

    clientPhone:
      appointment.client?.phone ?? null,

    /* --------------------------------------------------------
       SERVIÇO
    -------------------------------------------------------- */

    service:
      appointment.service?.name ?? "",

    serviceId:
      appointment.service?.id ?? null,

    price:
      Number.isFinite(servicePrice)
        ? servicePrice
        : 0,

    duration:
      Number(
        appointment.service?.duration ?? 0,
      ),

    /* --------------------------------------------------------
       PROFISSIONAL
    -------------------------------------------------------- */

    professional:
      appointment.professional?.name ?? "",

    professionalId:
      appointment.professional?.id ?? null,

    professionalEmail:
      appointment.professional?.email ?? null,

    professionalPhone:
      appointment.professional?.phone ?? null,

    specialty:
      appointment.professional?.specialty ?? null,

    /* --------------------------------------------------------
       DATA E HORA
    -------------------------------------------------------- */

    date:
      appointment.date
        .toISOString()
        .slice(0, 10),

    time:
      appointment.date
        .toISOString()
        .slice(11, 16),

    dateTime:
      appointment.date.toISOString(),

    /* --------------------------------------------------------
       STATUS
    -------------------------------------------------------- */

    status:
      String(
        appointment.status ?? "PENDING",
      ).toLowerCase(),

    notes:
      appointment.notes ?? "",

    /* --------------------------------------------------------
       PAGAMENTO
    -------------------------------------------------------- */

    payment:
      payment &&
      String(payment.status).toUpperCase() ===
        "PAID"
        ? "paid"
        : "pending",

    paymentId:
      payment?.id ?? null,

    paymentAmount,

    paymentMethod:
      payment?.method ?? null,

    paymentStatus:
      payment?.status ?? null,

    paidAt:
      payment?.paidAt
        ? payment.paidAt.toISOString()
        : null,

    /* --------------------------------------------------------
       AUDITORIA
    -------------------------------------------------------- */

    createdAt:
      appointment.createdAt.toISOString(),

    updatedAt:
      appointment.updatedAt.toISOString(),
  };
}

/* ============================================================
   GET
   LISTAR AGENDAMENTOS
============================================================ */

export async function GET() {
  try {
    const user = await requireStaff();

    /* --------------------------------------------------------
       VALIDAR EMPRESA
    -------------------------------------------------------- */

    if (!user.businessId) {
      return NextResponse.json(
        {
          error:
            "O utilizador não está associado a uma empresa.",
          code: "BUSINESS_NOT_FOUND",
        },
        {
          status: 403,
        },
      );
    }

    /* --------------------------------------------------------
       BUSCAR AGENDAMENTOS
    -------------------------------------------------------- */

    const appointments =
      await prisma.appointment.findMany({
        where: {
          businessId:
            user.businessId,
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

          payment: {
            select: {
              id: true,
              amount: true,
              method: true,
              status: true,
              paidAt: true,
            },
          },
        },
      });

    /* --------------------------------------------------------
       FORMATAR
    -------------------------------------------------------- */

    const formattedAppointments =
      appointments.map(
        (appointment) =>
          formatAppointment(
            appointment as AppointmentWithRelations,
          ),
      );

    /* --------------------------------------------------------
       RESPOSTA
    -------------------------------------------------------- */

    return NextResponse.json(
      {
        success: true,

        appointments:
          formattedAppointments,
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      },
    );
  } catch (error) {
    console.error(
      "❌ GET /api/appointments:",
      error,
    );

    /* --------------------------------------------------------
       NÃO AUTENTICADO
    -------------------------------------------------------- */

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          error:
            "Não autenticado.",

          code:
            "UNAUTHORIZED",
        },
        {
          status: 401,
        },
      );
    }

    /* --------------------------------------------------------
       SEM PERMISSÃO
    -------------------------------------------------------- */

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          error:
            "Não tem permissão para acessar a agenda.",

          code:
            "FORBIDDEN",
        },
        {
          status: 403,
        },
      );
    }

    /* --------------------------------------------------------
       ERRO INTERNO
    -------------------------------------------------------- */

    return NextResponse.json(
      {
        error:
          "Não foi possível carregar os agendamentos.",

        details:
          error instanceof Error
            ? error.message
            : "Erro desconhecido.",
      },
      {
        status: 500,
      },
    );
  }
}

/* ============================================================
   POST
   CRIAR AGENDAMENTO
============================================================ */

export async function POST(
  request: NextRequest,
) {
  try {
    const user = await requireStaff();

    /* --------------------------------------------------------
       VALIDAR EMPRESA
    -------------------------------------------------------- */

    if (!user.businessId) {
      return NextResponse.json(
        {
          error:
            "O utilizador não está associado a uma empresa.",

          code:
            "NO_BUSINESS",
        },
        {
          status: 403,
        },
      );
    }

    /* --------------------------------------------------------
       LER JSON
    -------------------------------------------------------- */

    let body: Record<string, unknown>;

    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "O corpo da requisição é inválido.",

          code:
            "INVALID_REQUEST_BODY",
        },
        {
          status: 400,
        },
      );
    }

    /* --------------------------------------------------------
       CAMPOS
    -------------------------------------------------------- */

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
        : "";

    /* ========================================================
       CAMPOS OBRIGATÓRIOS
    ======================================================== */

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

          code:
            "REQUIRED_FIELDS",
        },
        {
          status: 400,
        },
      );
    }

    /* ========================================================
       VALIDAR DATA
    ======================================================== */

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(
        date,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "A data deve estar no formato YYYY-MM-DD.",

          code:
            "INVALID_DATE",
        },
        {
          status: 400,
        },
      );
    }

    /* ========================================================
       VALIDAR HORA
    ======================================================== */

    if (
      !/^\d{2}:\d{2}$/.test(
        time,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "O horário deve estar no formato HH:mm.",

          code:
            "INVALID_TIME",
        },
        {
          status: 400,
        },
      );
    }

    const [
      hours,
      minutes,
    ] =
      time
        .split(":")
        .map(Number);

    if (
      !Number.isInteger(hours) ||
      !Number.isInteger(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return NextResponse.json(
        {
          error:
            "Horário inválido.",

          code:
            "INVALID_TIME",
        },
        {
          status: 400,
        },
      );
    }

    /* ========================================================
       DATA + HORA
    ======================================================== */

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

          code:
            "INVALID_DATETIME",
        },
        {
          status: 400,
        },
      );
    }

    /* ========================================================
       NÃO PERMITIR AGENDAMENTO NO PASSADO
    ======================================================== */

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

    /* ========================================================
       CLIENTE
    ======================================================== */

    const client =
      await prisma.client.findFirst({
        where: {
          id:
            clientId,

          businessId:
            user.businessId,

          active:
            true,
        },

        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          active: true,
        },
      });

    if (!client) {
      return NextResponse.json(
        {
          error:
            "Cliente não encontrado ou está desativado.",

          code:
            "CLIENT_NOT_FOUND",
        },
        {
          status: 404,
        },
      );
    }

    /* ========================================================
       PROFISSIONAL
    ======================================================== */

    const professional =
      await prisma.professional.findFirst({
        where: {
          id:
            professionalId,

          businessId:
            user.businessId,

          active:
            true,
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

    if (!professional) {
      return NextResponse.json(
        {
          error:
            "Profissional não encontrado ou está desativado.",

          code:
            "PROFESSIONAL_NOT_FOUND",
        },
        {
          status: 404,
        },
      );
    }

    /* ========================================================
       SERVIÇO
    ======================================================== */

    const service =
      await prisma.service.findFirst({
        where: {
          id:
            serviceId,

          businessId:
            user.businessId,

          active:
            true,
        },

        select: {
          id: true,
          name: true,
          price: true,
          duration: true,
          active: true,
        },
      });

    if (!service) {
      return NextResponse.json(
        {
          error:
            "Serviço não encontrado ou está desativado.",

          code:
            "SERVICE_NOT_FOUND",
        },
        {
          status: 404,
        },
      );
    }

    /* ========================================================
       VALIDAR DURAÇÃO
    ======================================================== */

    const duration =
      Number(
        service.duration,
      );

    if (
      !Number.isInteger(
        duration,
      ) ||
      duration <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "A duração do serviço é inválida.",

          code:
            "INVALID_SERVICE_DURATION",
        },
        {
          status: 400,
        },
      );
    }

    /* ========================================================
       INTERVALO DO NOVO AGENDAMENTO
    ======================================================== */

    const newStart =
      appointmentDate;

    const newEnd =
      new Date(
        newStart.getTime() +
          duration *
            60 *
            1000,
      );

    /* ========================================================
       BUSCAR AGENDAMENTOS DO PROFISSIONAL
    ======================================================== */

    const existingAppointments =
      await prisma.appointment.findMany({
        where: {
          businessId:
            user.businessId,

          professionalId:
            professionalId,

          status: {
            notIn: [
              "CANCELLED",
              "NO_SHOW",
            ],
          },
        },

        select: {
          id: true,

          date: true,

          service: {
            select: {
              duration: true,
            },
          },
        },
      });

    /* ========================================================
       VERIFICAR CONFLITO DE HORÁRIO
    ======================================================== */

    const conflictingAppointment =
      existingAppointments.find(
        (existing) => {
          const existingStart =
            existing.date;

          const existingDuration =
            Number(
              existing.service.duration,
            );

          const existingEnd =
            new Date(
              existingStart.getTime() +
                existingDuration *
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

    if (
      conflictingAppointment
    ) {
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

          conflictingAppointmentId:
            conflictingAppointment.id,
        },
        {
          status: 409,
        },
      );
    }

    /* ========================================================
       CRIAR AGENDAMENTO
    ======================================================== */

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

          clientId:
            client.id,

          professionalId:
            professional.id,

          serviceId:
            service.id,
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

          payment: {
            select: {
              id: true,
              amount: true,
              method: true,
              status: true,
              paidAt: true,
            },
          },
        },
      });

    /* ========================================================
       RESPOSTA
    ======================================================== */

    return NextResponse.json(
      {
        success:
          true,

        message:
          "Agendamento criado com sucesso.",

        appointment:
          formatAppointment(
            appointment as AppointmentWithRelations,
          ),
      },
      {
        status:
          201,
      },
    );
  } catch (error) {
    console.error(
      "❌ POST /api/appointments:",
      error,
    );

    /* ========================================================
       NÃO AUTENTICADO
    ======================================================== */

    if (
      error instanceof Error &&
      error.message ===
        "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          error:
            "Não autenticado.",

          code:
            "UNAUTHORIZED",
        },
        {
          status: 401,
        },
      );
    }

    /* ========================================================
       SEM PERMISSÃO
    ======================================================== */

    if (
      error instanceof Error &&
      error.message ===
        "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          error:
            "Não tem permissão para criar agendamentos.",

          code:
            "FORBIDDEN",
        },
        {
          status: 403,
        },
      );
    }

    /* ========================================================
       ERRO INTERNO
    ======================================================== */

    return NextResponse.json(
      {
        error:
          "Não foi possível criar o agendamento.",

        details:
          error instanceof Error
            ? error.message
            : "Erro desconhecido.",
      },
      {
        status: 500,
      },
    );
  }
}