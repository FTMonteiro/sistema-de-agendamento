import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const ALLOWED_METHODS = [
  "CASH",
  "CARD",
  "TRANSFER",
  "MOBILE_MONEY",
] as const;

const BUSINESS_ID =
  process.env.NEXT_PUBLIC_BUSINESS_ID;

/*
 * Agendamentos que esperam pagamento.
 *
 * Só entram os CONFIRMED: o fluxo é confirmar o agendamento na edição e depois
 * receber. Os que estão por confirmar não devem aparecer para cobrança, e os
 * pagos já saíram (pagar marca como COMPLETED).
 *
 * A modal não pode usar GET /api/appointments: essa rota devolve tudo achatado
 * para a listagem (client e service como texto, payment como "pending"), e aqui
 * é preciso o preço do serviço para preencher o valor. Daí uma rota própria,
 * com os relacionamentos incluídos.
 */
export async function GET() {
  try {
    if (!BUSINESS_ID) {
      return NextResponse.json(
        {
          error:
            "Business ID não configurado.",
        },
        { status: 500 },
      );
    }

    const appointments =
      await prisma.appointment.findMany({
        where: {
          businessId: BUSINESS_ID,

          status: "CONFIRMED",

          payment: null,
        },

        orderBy: {
          date: "asc",
        },

        include: {
          client: {
            select: {
              id: true,
              name: true,
            },
          },

          professional: {
            select: {
              id: true,
              name: true,
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

    return NextResponse.json({
      appointments: appointments.map(
        (appointment) => ({
          ...appointment,

          // Decimal do Prisma não sobrevive ao JSON como número.
          service: {
            ...appointment.service,
            price: Number(
              appointment.service.price,
            ),
          },
        }),
      ),
    });
  } catch (error) {
    console.error(
      "GET /api/appointments/payments:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível carregar os agendamentos.",
      },
      { status: 500 },
    );
  }
}

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
     * SÓ CONFIRMADOS SÃO COBRADOS
     * =====================================================
     */

    if (
      appointment.status !== "CONFIRMED"
    ) {
      const explicacao =
        appointment.status ===
        "COMPLETED"
          ? "Este agendamento já está concluído."
          : appointment.status ===
              "CANCELLED"
            ? "Este agendamento está cancelado."
            : "Confirme o agendamento na edição antes de receber o pagamento.";

      return NextResponse.json(
        {
          error: explicacao,

          reason:
            "not_confirmed",
        },
        {
          status: 409,
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

    /*
     * Pagamento e conclusao andam juntos: um agendamento pago esta concluido.
     * Numa transacao para nao ficar pagamento registado com o agendamento
     * ainda pendente caso a segunda escrita falhe.
     */
    const [payment] =
      await prisma.$transaction([
        prisma.payment.create({
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
        }),

        prisma.appointment.update({
          where: {
            id: appointment.id,
          },

          data: {
            status: "COMPLETED",
          },
        }),
      ]);

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