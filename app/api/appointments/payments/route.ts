import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const ALLOWED_METHODS = [
  "CASH",
  "CARD",
  "TRANSFER",
  "MOBILE_MONEY",
] as const;

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
*/

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
            "O utilizador não está associado a uma empresa.",
        },
        {
          status: 400,
        },
      );
    }

    const appointments =
      await prisma.appointment.findMany({
        where: {
          businessId: user.businessId,

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
      appointments:
        appointments.map(
          (appointment) => ({
            ...appointment,

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

/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
*/

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
            "O utilizador não está associado a uma empresa.",
        },
        {
          status: 400,
        },
      );
    }

    const body =
      await request.json();

    const appointmentId =
      typeof body.appointmentId ===
      "string"
        ? body.appointmentId.trim()
        : "";

    const method =
      body.method;

    /*
    |--------------------------------------------------------------------------
    | VALIDAÇÃO
    |--------------------------------------------------------------------------
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
      !ALLOWED_METHODS.includes(
        method,
      )
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
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

    if (
      appointment.status !==
      "CONFIRMED"
    ) {
      let error =
        "Confirme o agendamento antes de receber o pagamento.";

      if (
        appointment.status ===
        "COMPLETED"
      ) {
        error =
          "Este agendamento já está concluído.";
      }

      if (
        appointment.status ===
        "CANCELLED"
      ) {
        error =
          "Este agendamento está cancelado.";
      }

      return NextResponse.json(
        {
          error,

          reason:
            "not_confirmed",
        },
        {
          status: 409,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | PAGAMENTO DUPLICADO
    |--------------------------------------------------------------------------
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
    |--------------------------------------------------------------------------
    | VALOR
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
          error: `O serviço ${appointment.service.name} está sem preço. Defina o preço em Serviços para poder receber o pagamento.`,

          reason:
            "service_without_price",
        },
        {
          status: 409,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | PAGAMENTO + CONCLUSÃO
    |--------------------------------------------------------------------------
    */

    const result =
      await prisma.$transaction(
        async (tx) => {
          const payment =
            await tx.payment.create({
              data: {
                amount,

                method,

                status: "PAID",

                paidAt: new Date(),

                appointmentId:
                  appointment.id,
              },
            });

          const updatedAppointment =
            await tx.appointment.update({
              where: {
                id: appointment.id,
              },

              data: {
                status: "COMPLETED",
              },

              include: {
                client: true,
                professional: true,
                service: true,
                payment: true,
              },
            });

          return {
            payment,
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
        message:
          "Pagamento registrado com sucesso.",

        payment:
          result.payment,

        appointment:
          result.appointment,
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
          error instanceof Error
            ? error.message
            : "Não foi possível registrar o pagamento.",
      },
      {
        status: 500,
      },
    );
  }
}