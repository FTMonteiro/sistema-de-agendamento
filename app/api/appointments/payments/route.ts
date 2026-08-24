import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const ALLOWED_METHODS = [
  "CASH",
  "CARD",
  "TRANSFER",
  "MOBILE_MONEY",
] as const;

type PaymentMethod = (typeof ALLOWED_METHODS)[number];

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
| Lista apenas agendamentos CONFIRMADOS e ainda sem pagamento.
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
          status: 403,
        },
      );
    }

    const appointments = await prisma.appointment.findMany({
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
      appointments: appointments.map((appointment) => ({
        id: appointment.id,

        clientId: appointment.client.id,
        client: appointment.client.name,

        professionalId: appointment.professional.id,
        professional: appointment.professional.name,

        serviceId: appointment.service.id,
        service: appointment.service.name,

        date: appointment.date.toISOString().slice(0, 10),

        time: appointment.date.toISOString().slice(11, 16),

        price: Number(appointment.service.price),

        payment: "pending",

        paidAmount: 0,

        status: appointment.status.toLowerCase(),

        notes: appointment.notes ?? null,
      })),
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
| Receber pagamento.
|
| CONFIRMED
|     ↓
| Payment PAID
|     ↓
| Appointment COMPLETED
|--------------------------------------------------------------------------
*/

export async function POST(request: NextRequest) {
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
          status: 403,
        },
      );
    }

    const body = await request.json();

    const appointmentId =
      typeof body.appointmentId === "string"
        ? body.appointmentId.trim()
        : "";

    const method = body.method;

    /*
    |--------------------------------------------------------------------------
    | VALIDAR AGENDAMENTO
    |--------------------------------------------------------------------------
    */

    if (!appointmentId) {
      return NextResponse.json(
        {
          error: "O agendamento é obrigatório.",
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

    if (!ALLOWED_METHODS.includes(method as PaymentMethod)) {
      return NextResponse.json(
        {
          error: "Método de pagamento inválido.",
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

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,

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
          error: "Agendamento não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | PAGAMENTO JÁ EXISTE
    |--------------------------------------------------------------------------
    */

    if (appointment.payment) {
      if (appointment.payment.status === "PAID") {
        return NextResponse.json(
          {
            error:
              "Este agendamento já foi pago e está concluído.",
            reason: "already_paid",
          },
          {
            status: 409,
          },
        );
      }

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
    | VALIDAR STATUS DO AGENDAMENTO
    |--------------------------------------------------------------------------
    */

    if (appointment.status !== "CONFIRMED") {
      let error =
        "Confirme o agendamento antes de receber o pagamento.";

      let reason = "not_confirmed";

      if (appointment.status === "COMPLETED") {
        error =
          "Este agendamento já está concluído.";
        reason = "already_completed";
      }

      if (appointment.status === "CANCELLED") {
        error =
          "Este agendamento está cancelado.";
        reason = "cancelled";
      }

      if (appointment.status === "NO_SHOW") {
        error =
          "Este cliente foi marcado como não compareceu.";
        reason = "no_show";
      }

      return NextResponse.json(
        {
          error,
          reason,
        },
        {
          status: 409,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | VALOR DO SERVIÇO
    |--------------------------------------------------------------------------
    */

    const amount = Number(
      appointment.service.price,
    );

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          error:
            `O serviço "${appointment.service.name}" está sem preço. ` +
            "Defina o preço em Serviços para poder receber o pagamento.",

          reason: "service_without_price",
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
    |
    | As duas operações acontecem dentro da mesma transaction.
    |
    | Se uma falhar, nenhuma das duas é gravada.
    |
    */

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          amount,

          method: method as PaymentMethod,

          status: "PAID",

          paidAt: new Date(),

          appointmentId: appointment.id,
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
        appointment: updatedAppointment,
      };
    });

    /*
    |--------------------------------------------------------------------------
    | RESPOSTA
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        message:
          "Pagamento registrado com sucesso.",

        payment: {
          id: result.payment.id,

          amount: Number(
            result.payment.amount,
          ),

          method:
            result.payment.method,

          status:
            result.payment.status,

          paidAt:
            result.payment.paidAt?.toISOString() ??
            null,

          appointmentId:
            result.payment.appointmentId,
        },

        appointment: {
          id: result.appointment.id,

          clientId:
            result.appointment.client.id,

          client:
            result.appointment.client.name,

          serviceId:
            result.appointment.service.id,

          service:
            result.appointment.service.name,

          professionalId:
            result.appointment.professional.id,

          professional:
            result.appointment.professional.name,

          date:
            result.appointment.date
              .toISOString()
              .slice(0, 10),

          time:
            result.appointment.date
              .toISOString()
              .slice(11, 16),

          price: Number(
            result.appointment.service.price,
          ),

          payment: "paid",

          paidAmount: Number(
            result.payment.amount,
          ),

          status:
            result.appointment.status.toLowerCase(),

          notes:
            result.appointment.notes ?? null,
        },
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