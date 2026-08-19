import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const ALLOWED_METHODS = [
  "CASH",
  "CARD",
  "TRANSFER",
  "MOBILE_MONEY",
] as const;

export async function POST(
  request: NextRequest,
) {
  try {
    const body = await request.json();

    const appointmentId =
      typeof body.appointmentId === "string"
        ? body.appointmentId.trim()
        : "";

    const method = body.method;

    const amount = Number(body.amount);

    /*
     * =====================================================
     * VALIDAÇÕES
     * =====================================================
     */

    if (!appointmentId) {
      return NextResponse.json(
        {
          error:
            "O agendamento é obrigatório.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "O valor do pagamento é inválido.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !ALLOWED_METHODS.includes(method)
    ) {
      return NextResponse.json(
        {
          error:
            "Método de pagamento inválido.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * =====================================================
     * BUSCAR AGENDAMENTO REAL
     * =====================================================
     */

    const appointment =
      await prisma.appointment.findUnique({
        where: {
          id: appointmentId,
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

    /*
     * =====================================================
     * VERIFICAR PAGAMENTO EXISTENTE
     * =====================================================
     */

    if (appointment.payment) {
      return NextResponse.json(
        {
          error:
            "Este agendamento já possui um pagamento.",
        },
        {
          status: 409,
        },
      );
    }

    /*
     * =====================================================
     * CRIAR PAGAMENTO
     * =====================================================
     */

    const payment =
      await prisma.payment.create({
        data: {
          amount,

          method,

          status: "PAID",

          paidAt: new Date(),

          appointmentId:
            appointment.id,
        },

        include: {
          appointment: {
            include: {
              client: true,
              professional: true,
              service: true,
            },
          },
        },
      });

    /*
     * =====================================================
     * RESPOSTA
     * =====================================================
     */

    return NextResponse.json(
      {
        message:
          "Pagamento registrado com sucesso.",

        payment,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "POST /api/appointments/payments:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível registrar o pagamento.",
      },
      {
        status: 500,
      },
    );
  }
}