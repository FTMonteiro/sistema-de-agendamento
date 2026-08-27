import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/*
|--------------------------------------------------------------------------
| GET
| RECIBO DO PAGAMENTO
|--------------------------------------------------------------------------
|
| /api/payments/[appointmentId]/receipt
|
| O ID recebido é o ID do AGENDAMENTO.
|
| Esta rota:
|
| 1. Verifica autenticação
| 2. Verifica empresa
| 3. Procura o agendamento
| 4. Procura o pagamento
| 5. CONFIRMA que o pagamento está PAID
| 6. Devolve o recibo
|
|--------------------------------------------------------------------------
*/

export async function GET(
  request: Request,
  context: RouteContext,
) {
  try {
    // ----------------------------------------------------------
    // AUTENTICAÇÃO
    // ----------------------------------------------------------

    const user = await requireStaff();

    if (!user.businessId) {
      return NextResponse.json(
        {
          error:
            "O utilizador não está associado a uma empresa.",
        },
        {
          status: 403,
        },
      );
    }

    // ----------------------------------------------------------
    // ID
    // ----------------------------------------------------------

    const { id } = await context.params;

    const appointmentId =
      typeof id === "string"
        ? id.trim()
        : "";

    if (!appointmentId) {
      return NextResponse.json(
        {
          error: "ID do agendamento não informado.",
          code: "APPOINTMENT_ID_REQUIRED",
        },
        {
          status: 400,
        },
      );
    }

    // ----------------------------------------------------------
    // BUSCAR AGENDAMENTO
    // ----------------------------------------------------------

    const appointment =
      await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          businessId: user.businessId,
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
              reference: true,
              paidAt: true,
              receivedById: true,
              appointmentId: true,
            },
          },
        },
      });

    // ----------------------------------------------------------
    // AGENDAMENTO NÃO ENCONTRADO
    // ----------------------------------------------------------

    if (!appointment) {
      return NextResponse.json(
        {
          error: "Agendamento não encontrado.",
          code: "APPOINTMENT_NOT_FOUND",
        },
        {
          status: 404,
        },
      );
    }

    // ----------------------------------------------------------
    // PAGAMENTO NÃO ENCONTRADO
    // ----------------------------------------------------------

    if (!appointment.payment) {
      return NextResponse.json(
        {
          error:
            "O pagamento deste agendamento não foi encontrado.",
          code: "PAYMENT_NOT_FOUND",
        },
        {
          status: 404,
        },
      );
    }

    const payment = appointment.payment;

    // ----------------------------------------------------------
    // CONFIRMAÇÃO REAL DO PAGAMENTO
    // ----------------------------------------------------------
    //
    // A confirmação vem do banco de dados.
    // Não confiamos apenas no frontend.
    //

    if (String(payment.status).toUpperCase() !== "PAID") {
      return NextResponse.json(
        {
          error:
            "O pagamento deste agendamento ainda não foi confirmado.",
          code: "PAYMENT_NOT_PAID",
          paymentStatus: payment.status,
        },
        {
          status: 409,
        },
      );
    }

    // ----------------------------------------------------------
    // DADOS
    // ----------------------------------------------------------

    const amount = Number(payment.amount);

    const servicePrice = Number(
      appointment.service?.price ?? 0,
    );

    const paidAt =
      payment.paidAt ?? new Date();

    // ----------------------------------------------------------
    // RECIBO
    // ----------------------------------------------------------

    return NextResponse.json(
      {
        success: true,

        receipt: {
          title: "Recibo do pagamento",

          type: "PAYMENT_RECEIPT",

          payment: {
            id: payment.id,

            reference:
              payment.reference ?? null,

            amount:
              Number.isFinite(amount)
                ? amount
                : 0,

            method: payment.method,

            status: payment.status,

            paidAt: paidAt.toISOString(),

            receivedById:
              payment.receivedById ?? null,
          },

          appointment: {
            id: appointment.id,

            date: appointment.date.toISOString(),

            status: appointment.status,

            notes:
              appointment.notes ?? null,
          },

          client: {
            id: appointment.client.id,
            name: appointment.client.name,
            email: appointment.client.email,
            phone: appointment.client.phone,
          },

          professional: {
            id: appointment.professional.id,
            name: appointment.professional.name,
            email: appointment.professional.email,
            phone: appointment.professional.phone,
            specialty:
              appointment.professional.specialty,
          },

          service: {
            id: appointment.service.id,
            name: appointment.service.name,

            price:
              Number.isFinite(servicePrice)
                ? servicePrice
                : 0,

            duration:
              appointment.service.duration,
          },

          total:
            Number.isFinite(amount)
              ? amount
              : 0,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "❌ GET /api/payments/[id]/receipt:",
      error,
    );

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

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          error:
            "Não tem permissão para visualizar este recibo.",
        },
        {
          status: 403,
        },
      );
    }

    return NextResponse.json(
      {
        error:
          "Não foi possível carregar o recibo.",

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