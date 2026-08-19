import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

function formatAppointment(
  appointment: any,
) {
  const date =
    new Date(appointment.date);

  const paymentStatus =
    appointment.payment?.status?.toLowerCase() ??
    "pending";

  let payment:
    | "pending"
    | "partial"
    | "paid" = "pending";

  if (paymentStatus === "paid") {
    payment = "paid";
  }

  if (paymentStatus === "partial") {
    payment = "partial";
  }

  return {
    id: appointment.id,

    client:
      appointment.client?.name ?? "",

    service:
      appointment.service?.name ?? "",

    professional:
      appointment.professional?.name ?? "",

    date: date
      .toISOString()
      .split("T")[0],

    time: date
      .toTimeString()
      .slice(0, 5),

    price: Number(
      appointment.payment?.amount ??
        appointment.service?.price ??
        0,
    ),

    payment,

    status:
      appointment.status?.toLowerCase() ??
      "pending",

    notes:
      appointment.notes ?? null,
  };
}

/*
|--------------------------------------------------------------------------
| PUT
|--------------------------------------------------------------------------
*/

export async function PUT(
  request: Request,
  context: RouteContext,
) {
  try {
    const { id } =
      await context.params;

    const body =
      await request.json();

    const {
      client,
      service,
      professional,
      date,
      time,
      payment,
      status,
      notes,
    } = body;

    if (
      !client?.trim() ||
      !service?.trim() ||
      !professional?.trim() ||
      !date ||
      !time
    ) {
      return NextResponse.json(
        {
          error:
            "Cliente, serviço, profissional, data e horário são obrigatórios.",
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

    const existing =
      await prisma.appointment.findUnique(
        {
          where: {
            id,
          },
        },
      );

    if (!existing) {
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
    | CLIENTE
    |--------------------------------------------------------------------------
    */

    let clientRecord =
      await prisma.client.findFirst({
        where: {
          name: client.trim(),
          businessId:
            existing.businessId,
        },
      });

    if (!clientRecord) {
      clientRecord =
        await prisma.client.create({
          data: {
            name: client.trim(),
            phone: "",
            businessId:
              existing.businessId,
          },
        });
    }

    /*
    |--------------------------------------------------------------------------
    | PROFISSIONAL
    |--------------------------------------------------------------------------
    */

    let professionalRecord =
      await prisma.professional.findFirst({
        where: {
          name: professional.trim(),
          businessId:
            existing.businessId,
        },
      });

    if (!professionalRecord) {
      professionalRecord =
        await prisma.professional.create({
          data: {
            name: professional.trim(),
            businessId:
              existing.businessId,
          },
        });
    }

    /*
    |--------------------------------------------------------------------------
    | SERVIÇO
    |--------------------------------------------------------------------------
    */

    let serviceRecord =
      await prisma.service.findFirst({
        where: {
          name: service.trim(),
          businessId:
            existing.businessId,
        },
      });

    if (!serviceRecord) {
      serviceRecord =
        await prisma.service.create({
          data: {
            name: service.trim(),
            price: 0,
            duration: 60,
            businessId:
              existing.businessId,
          },
        });
    }

    /*
    |--------------------------------------------------------------------------
    | DATA
    |--------------------------------------------------------------------------
    */

    const appointmentDate =
      new Date(`${date}T${time}:00`);

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

    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

    const statusMap: Record<
      string,
      | "PENDING"
      | "CONFIRMED"
      | "COMPLETED"
      | "CANCELLED"
      | "NO_SHOW"
    > = {
      pending: "PENDING",
      confirmed: "CONFIRMED",
      completed: "COMPLETED",
      cancelled: "CANCELLED",
      no_show: "NO_SHOW",
    };

    const prismaStatus =
      statusMap[status] ??
      "PENDING";

    /*
    |--------------------------------------------------------------------------
    | ATUALIZAR
    |--------------------------------------------------------------------------
    */

    await prisma.appointment.update({
      where: {
        id,
      },

      data: {
        date: appointmentDate,

        status: prismaStatus,

        notes:
          notes?.trim() || null,

        clientId:
          clientRecord.id,

        professionalId:
          professionalRecord.id,

        serviceId:
          serviceRecord.id,
      },
    });

    /*
    |--------------------------------------------------------------------------
    | PAGAMENTO
    |--------------------------------------------------------------------------
    */

    if (
      payment === "paid" ||
      payment === "pending"
    ) {
      const existingPayment =
        await prisma.payment.findUnique({
          where: {
            appointmentId: id,
          },
        });

      const paymentStatus =
        payment === "paid"
          ? "PAID"
          : "PENDING";

      const amount =
        serviceRecord.price;

      if (existingPayment) {
        await prisma.payment.update({
          where: {
            appointmentId: id,
          },

          data: {
            status:
              paymentStatus,

            amount,
          },
        });
      } else {
        await prisma.payment.create({
          data: {
            appointmentId: id,

            amount,

            method: "CASH",

            status:
              paymentStatus,

            paidAt:
              payment === "paid"
                ? new Date()
                : null,
          },
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | BUSCAR ATUALIZADO
    |--------------------------------------------------------------------------
    */

    const updated =
      await prisma.appointment.findUnique(
        {
          where: {
            id,
          },

          include: {
            client: true,
            professional: true,
            service: true,
            payment: true,
          },
        },
      );

    return NextResponse.json({
      appointment:
        formatAppointment(updated),
    });
  } catch (error) {
    console.error(
      "PUT /api/appointments/[id]:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao atualizar agendamento.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

export async function DELETE(
  request: Request,
  context: RouteContext,
) {
  try {
    const { id } =
      await context.params;

    const appointment =
      await prisma.appointment.findUnique(
        {
          where: {
            id,
          },
        },
      );

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
    });
  } catch (error) {
    console.error(
      "DELETE /api/appointments/[id]:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao excluir agendamento.",
      },
      {
        status: 500,
      },
    );
  }
}