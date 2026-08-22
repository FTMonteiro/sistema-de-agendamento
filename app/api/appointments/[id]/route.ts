import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toMinutes(time: string) {
  const [hours, minutes] = time
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
}

const WEEKDAYS = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

/*
 * As mesmas regras de horário aplicadas na criação. Sem isto, editar um
 * agendamento contornava o horário de funcionamento.
 */
async function checkBusinessHours(
  businessId: string,
  date: string,
  time: string,
): Promise<string | null> {
  const business =
    await prisma.business.findUnique({
      where: { id: businessId },

      select: {
        openingTime: true,
        closingTime: true,
        workingDays: true,
        slotInterval: true,
      },
    });

  if (!business) {
    return null;
  }

  const weekday = new Date(
    `${date}T00:00:00`,
  ).getDay();

  if (
    business.workingDays.length > 0 &&
    !business.workingDays.includes(
      weekday,
    )
  ) {
    return `O estabelecimento não abre ${WEEKDAYS[weekday]}. Escolha outro dia.`;
  }

  const requested = toMinutes(time);

  if (
    business.openingTime &&
    requested <
      toMinutes(business.openingTime)
  ) {
    return `O estabelecimento abre às ${business.openingTime}.`;
  }

  if (
    business.closingTime &&
    requested >=
      toMinutes(business.closingTime)
  ) {
    return `O estabelecimento fecha às ${business.closingTime}.`;
  }

  if (
    business.slotInterval > 0 &&
    requested % business.slotInterval !==
      0
  ) {
    return `Os agendamentos são de ${business.slotInterval} em ${business.slotInterval} minutos.`;
  }

  return null;
}


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

    const hoursError =
      await checkBusinessHours(
        existing.businessId,
        String(date),
        String(time),
      );

    if (hoursError) {
      return NextResponse.json(
        { error: hoursError },
        { status: 400 },
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
     * Concluído significa atendimento pago. Sem pagamento registado, o estado
     * não pode ser posto em Concluído à mão — quem conclui é o pagamento.
     */
    if (prismaStatus === "COMPLETED") {
      const paid =
        await prisma.payment.findFirst({
          where: {
            appointmentId: id,
            status: "PAID",
          },
        });

      if (!paid) {
        return NextResponse.json(
          {
            error:
              "Só é possível concluir um agendamento depois de receber o pagamento. Use \"Receber pagamento\" — o agendamento passa a Concluído automaticamente.",

            reason: "payment_required",
          },
          { status: 409 },
        );
      }
    }

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

    /*
     * "Pendente" significa ausência de pagamento, não um pagamento com estado
     * pendente. Criar uma linha PENDING (era o que acontecia aqui, a cada
     * edição, porque a modal envia sempre payment) quebrava o recebimento: o
     * agendamento saía da lista de cobrança e o POST recusava com "já possui
     * um pagamento".
     */
    if (payment === "paid") {
      await prisma.payment.upsert({
        where: {
          appointmentId: id,
        },

        update: {
          status: "PAID",
          paidAt: new Date(),
        },

        create: {
          appointmentId: id,
          amount: serviceRecord.price,
          method: "CASH",
          status: "PAID",
          paidAt: new Date(),
        },
      });
    } else {
      /*
       * Limpa placeholders PENDING deixados pela versão anterior. Um pagamento
       * PAID não é desfeito por uma edição — isso seria apagar receita como
       * efeito secundário de mexer noutro campo.
       */
      await prisma.payment.deleteMany({
        where: {
          appointmentId: id,
          status: "PENDING",
        },
      });
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