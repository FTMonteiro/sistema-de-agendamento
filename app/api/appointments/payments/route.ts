
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

const ALLOWED_METHODS = [
  "CASH",
  "CARD",
  "TRANSFER",
  "MOBILE_MONEY",
] as const;

type PaymentMethod = (typeof ALLOWED_METHODS)[number];

/*
|--------------------------------------------------------------------------
| GERAR REFERÊNCIA
|--------------------------------------------------------------------------
*/

function generatePaymentReference(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const random = randomBytes(4)
    .toString("hex")
    .toUpperCase();

  return `SLOTIX-${year}${month}${day}-${random}`;
}

/*
|--------------------------------------------------------------------------
| GET
| LISTAR PAGAMENTOS REGISTADOS
|--------------------------------------------------------------------------
*/

export async function GET() {
  try {
    const user = await requireStaff();

    /*
    |--------------------------------------------------------------------------
    | VALIDAR EMPRESA
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | BUSCAR PAGAMENTOS
    |--------------------------------------------------------------------------
    */

    const payments = await prisma.payment.findMany({
      where: {
        appointment: {
          businessId: user.businessId,
        },
      },

      orderBy: {
        paidAt: "desc",
      },

      include: {
        appointment: {
          select: {
            id: true,
            date: true,

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
              },
            },
          },
        },
      },
    });

    /*
    |--------------------------------------------------------------------------
    | FORMATAR
    |--------------------------------------------------------------------------
    */

    const formattedPayments = payments.map(
      (payment) => ({
        id: payment.id,

        amount: Number(payment.amount),

        method: payment.method,

        status: payment.status,

        reference:
          payment.reference ?? null,

        paidAt:
          payment.paidAt
            ? payment.paidAt.toISOString()
            : null,

        appointmentId:
          payment.appointmentId,

        receiptUrl:
          payment.receiptUrl ?? null,

        appointment:
          payment.appointment
            ? {
                id:
                  payment.appointment.id,

                date:
                  payment.appointment.date.toISOString(),

                time:
                  payment.appointment.date
                    .toISOString()
                    .slice(11, 16),

                client:
                  payment.appointment.client
                    ?.name ?? "Cliente",

                service:
                  payment.appointment.service
                    ?.name ?? "Serviço",

                professional:
                  payment.appointment.professional
                    ?.name ?? "Profissional",
              }
            : undefined,
      }),
    );

    /*
    |--------------------------------------------------------------------------
    | RESPOSTA
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        success: true,
        payments: formattedPayments,
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
      "❌ GET /api/payments:",
      error,
    );

    /*
    |--------------------------------------------------------------------------
    | NÃO AUTENTICADO
    |--------------------------------------------------------------------------
    */

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          error: "Não autenticado.",
          code: "UNAUTHORIZED",
        },
        {
          status: 401,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | SEM PERMISSÃO
    |--------------------------------------------------------------------------
    */

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          error:
            "Não tem permissão para acessar os pagamentos.",
          code: "FORBIDDEN",
        },
        {
          status: 403,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | ERRO INTERNO
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        error:
          "Não foi possível carregar os pagamentos.",

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

/*
|--------------------------------------------------------------------------
| POST
| REGISTRAR PAGAMENTO
|--------------------------------------------------------------------------
|
| REGRA DE PAGAMENTO
|
| O pagamento só pode ser realizado:
|
| - No mesmo dia do agendamento
| - A partir de 15 minutos antes da hora marcada
| - Ou depois da hora marcada
|
| Exemplo:
|
| Agendamento: 16:00
|
| 14:00  ❌
| 15:00  ❌
| 15:44  ❌
| 15:45  ✅
| 16:00  ✅
| 17:00  ✅
|
|--------------------------------------------------------------------------
*/

export async function POST(
  request: NextRequest,
) {
  try {
    const user = await requireStaff();

    /*
    |--------------------------------------------------------------------------
    | VALIDAR EMPRESA
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | LER FORM DATA
    |--------------------------------------------------------------------------
    */

    let formData: FormData;

    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        {
          error:
            "O corpo da requisição é inválido.",
          code: "INVALID_REQUEST_BODY",
        },
        {
          status: 400,
        },
      );
    }

    const appointmentIdValue =
      formData.get("appointmentId");

    const methodValue =
      formData.get("method");

    const appointmentId =
      typeof appointmentIdValue === "string"
        ? appointmentIdValue.trim()
        : "";

    const method =
      typeof methodValue === "string"
        ? methodValue.trim().toUpperCase()
        : "";

    /*
    |--------------------------------------------------------------------------
    | VALIDAR ID
    |--------------------------------------------------------------------------
    */

    if (!appointmentId) {
      return NextResponse.json(
        {
          error:
            "O agendamento é obrigatório.",
          code: "APPOINTMENT_REQUIRED",
        },
        {
          status: 400,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDAR MÉTODO
    |--------------------------------------------------------------------------
    */

    if (
      !ALLOWED_METHODS.includes(
        method as PaymentMethod,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Método de pagamento inválido.",
          code: "INVALID_PAYMENT_METHOD",
        },
        {
          status: 400,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | BUSCAR AGENDAMENTO
    |--------------------------------------------------------------------------
    */

    const appointment =
      await prisma.appointment.findFirst({
        where: {
          id: appointmentId,

          businessId:
            user.businessId,
        },

        include: {
          client: true,

          professional: true,

          service: true,

          payment: true,

          visit: true,
        },
      });

    /*
    |--------------------------------------------------------------------------
    | NÃO ENCONTRADO
    |--------------------------------------------------------------------------
    */

    if (!appointment) {
      return NextResponse.json(
        {
          error:
            "Agendamento não encontrado.",
          code: "APPOINTMENT_NOT_FOUND",
        },
        {
          status: 404,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | PAGAMENTO EXISTENTE
    |--------------------------------------------------------------------------
    */

    if (appointment.payment) {
      return NextResponse.json(
        {
          error:
            "Este agendamento já possui um pagamento.",
          code: "PAYMENT_ALREADY_EXISTS",
        },
        {
          status: 409,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | VISITA EXISTENTE
    |--------------------------------------------------------------------------
    */

    if (appointment.visit) {
      return NextResponse.json(
        {
          error:
            "A visita deste agendamento já foi contabilizada.",
          code: "VISIT_ALREADY_EXISTS",
        },
        {
          status: 409,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDAR STATUS
    |--------------------------------------------------------------------------
    */

    if (
      appointment.status !== "CONFIRMED"
    ) {
      const messages: Record<
        string,
        string
      > = {
        PENDING:
          "Confirme o agendamento antes de receber o pagamento.",

        COMPLETED:
          "Este agendamento já está concluído.",

        CANCELLED:
          "Este agendamento está cancelado.",

        NO_SHOW:
          "Este cliente foi marcado como não compareceu.",
      };

      return NextResponse.json(
        {
          error:
            messages[
              appointment.status
            ] ??
            "Confirme o agendamento antes de receber o pagamento.",

          code:
            "APPOINTMENT_NOT_CONFIRMED",
        },
        {
          status: 409,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | REGRA DE HORÁRIO DO PAGAMENTO
    |--------------------------------------------------------------------------
    |
    | O pagamento:
    |
    | ❌ não pode ser feito em dias anteriores
    | ❌ não pode ser feito no mesmo dia antes dos 15 minutos
    | ✅ pode ser feito 15 minutos antes
    | ✅ pode ser feito na hora
    | ✅ pode ser feito depois
    |
    |--------------------------------------------------------------------------
    */

    const now = new Date();

    const appointmentTime =
      appointment.date.getTime();

    const paymentAllowedFrom =
      appointmentTime -
      15 * 60 * 1000;

    /*
    |--------------------------------------------------------------------------
    | COMPARAR O DIA DO PAGAMENTO COM O DIA DO AGENDAMENTO
    |--------------------------------------------------------------------------
    |
    | Usamos ano/mês/dia local para garantir que o pagamento
    | só seja permitido no mesmo dia.
    |
    |--------------------------------------------------------------------------
    */

    const nowYear =
      now.getFullYear();

    const nowMonth =
      now.getMonth();

    const nowDay =
      now.getDate();

    const appointmentYear =
      appointment.date.getFullYear();

    const appointmentMonth =
      appointment.date.getMonth();

    const appointmentDay =
      appointment.date.getDate();

    const isSameDay =
      nowYear === appointmentYear &&
      nowMonth === appointmentMonth &&
      nowDay === appointmentDay;

    /*
    |--------------------------------------------------------------------------
    | PAGAMENTO ANTES DO DIA
    |--------------------------------------------------------------------------
    */

    if (!isSameDay) {
      return NextResponse.json(
        {
          error:
            "O pagamento só pode ser realizado no mesmo dia do agendamento.",
          code:
            "PAYMENT_NOT_SAME_DAY",
          appointmentDate:
            appointment.date.toISOString(),
        },
        {
          status: 409,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | PAGAMENTO ANTES DOS 15 MINUTOS
    |--------------------------------------------------------------------------
    */

    if (
      now.getTime() <
      paymentAllowedFrom
    ) {
      const remainingMilliseconds =
        paymentAllowedFrom -
        now.getTime();

      const remainingMinutes =
        Math.ceil(
          remainingMilliseconds /
            (60 * 1000),
        );

      return NextResponse.json(
        {
          error:
            "O pagamento só pode ser realizado até 15 minutos antes do horário do agendamento.",

          code:
            "PAYMENT_TOO_EARLY",

          appointmentTime:
            appointment.date.toISOString(),

          paymentAllowedFrom:
            new Date(
              paymentAllowedFrom,
            ).toISOString(),

          remainingMinutes,
        },
        {
          status: 409,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDAR PREÇO
    |--------------------------------------------------------------------------
    */

    const amount = Number(
      appointment.service.price,
    );

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            `O serviço "${appointment.service.name}" está sem preço. ` +
            "Defina o preço em Serviços para poder receber o pagamento.",

          code:
            "SERVICE_WITHOUT_PRICE",
        },
        {
          status: 409,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | REFERÊNCIA
    |--------------------------------------------------------------------------
    */

    const reference =
      generatePaymentReference();

    /*
    |--------------------------------------------------------------------------
    | TRANSACTION
    |--------------------------------------------------------------------------
    */

    const result =
      await prisma.$transaction(
        async (tx) => {
          /*
          |--------------------------------------------------------------------------
          | 1. PAGAMENTO
          |--------------------------------------------------------------------------
          */

          const payment =
            await tx.payment.create({
              data: {
                amount,

                method:
                  method as PaymentMethod,

                status: "PAID",

                paidAt:
                  new Date(),

                reference,

                receivedById:
                  user.id,

                appointmentId:
                  appointment.id,
              },
            });

          /*
          |--------------------------------------------------------------------------
          | 2. RECIBO
          |--------------------------------------------------------------------------
          */

          const paymentWithReceipt =
            await tx.payment.update({
              where: {
                id: payment.id,
              },

              data: {
                receiptUrl:
                  `/api/payments/${appointment.id}/receipt`,
              },
            });

          /*
          |--------------------------------------------------------------------------
          | 3. VISITA
          |--------------------------------------------------------------------------
          */

          const visit =
            await tx.visit.create({
              data: {
                clientId:
                  appointment.client.id,

                appointmentId:
                  appointment.id,

                paymentId:
                  payment.id,

                visitedAt:
                  new Date(),
              },
            });

          /*
          |--------------------------------------------------------------------------
          | 4. CONCLUIR AGENDAMENTO
          |--------------------------------------------------------------------------
          */

          const updatedAppointment =
            await tx.appointment.update({
              where: {
                id:
                  appointment.id,
              },

              data: {
                status:
                  "COMPLETED",
              },

              include: {
                client: true,

                professional: true,

                service: true,

                payment: true,

                visit: true,
              },
            });

          return {
            payment:
              paymentWithReceipt,

            visit,

            appointment:
              updatedAppointment,
          };
        },
      );

    /*
    |--------------------------------------------------------------------------
    | RESPOSTA
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        success: true,

        message:
          "Pagamento registrado com sucesso.",

        payment: {
          id:
            result.payment.id,

          amount:
            Number(
              result.payment.amount,
            ),

          method:
            result.payment.method,

          status:
            result.payment.status,

          reference:
            result.payment.reference,

          receiptUrl:
            result.payment.receiptUrl,

          receivedById:
            result.payment
              .receivedById,

          paidAt:
            result.payment.paidAt
              ? result.payment.paidAt.toISOString()
              : null,

          appointmentId:
            result.payment
              .appointmentId,
        },

        visit: {
          id:
            result.visit.id,

          clientId:
            result.visit.clientId,

          appointmentId:
            result.visit
              .appointmentId,

          paymentId:
            result.visit.paymentId,

          visitedAt:
            result.visit.visitedAt.toISOString(),
        },

        appointment: {
          id:
            result.appointment.id,

          client: {
            id:
              result.appointment
                .client.id,

            name:
              result.appointment
                .client.name,
          },

          professional: {
            id:
              result.appointment
                .professional.id,

            name:
              result.appointment
                .professional.name,
          },

          service: {
            id:
              result.appointment
                .service.id,

            name:
              result.appointment
                .service.name,

            price:
              Number(
                result.appointment
                  .service.price,
              ),

            duration:
              result.appointment
                .service.duration,
          },

          date:
            result.appointment.date
              .toISOString(),

          status:
            "completed",

          payment: {
            id:
              result.payment.id,

            amount:
              Number(
                result.payment.amount,
              ),

            method:
              result.payment.method,

            status:
              result.payment.status,

            reference:
              result.payment.reference,

            receiptUrl:
              result.payment
                .receiptUrl,
          },

          paymentAmount:
            Number(
              result.payment.amount,
            ),

          paymentMethod:
            result.payment.method,

          visitId:
            result.visit.id,

          visitedAt:
            result.visit.visitedAt.toISOString(),

          notes:
            result.appointment
              .notes ?? null,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "❌ POST /api/payments:",
      error,
    );

    /*
    |--------------------------------------------------------------------------
    | NÃO AUTENTICADO
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | SEM PERMISSÃO
    |--------------------------------------------------------------------------
    */

    if (
      error instanceof Error &&
      error.message ===
        "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          error:
            "Não tem permissão para receber e registrar pagamentos.",
          code:
            "PAYMENT_FORBIDDEN",
        },
        {
          status: 403,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | ERRO
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível processar o pagamento.",

        code:
          "PAYMENT_INTERNAL_ERROR",
      },
      {
        status: 500,
      },
    );
  }
}

