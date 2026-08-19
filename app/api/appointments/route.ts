import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BUSINESS_ID =
  process.env.NEXT_PUBLIC_BUSINESS_ID ||
  "business_faustino";

function createDateTime(date: string, time: string) {
  const dateTime = new Date(`${date}T${time}:00`);

  if (Number.isNaN(dateTime.getTime())) {
    throw new Error("Data ou horário inválido.");
  }

  return dateTime;
}

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
*/

export async function GET() {
  try {
    const appointments =
      await prisma.appointment.findMany({
        where: {
          businessId: BUSINESS_ID,
        },

        orderBy: {
          date: "asc",
        },

        include: {
          client: true,
          professional: true,
          service: true,
          payment: true,
        },
      });

    const formattedAppointments =
      appointments.map((appointment) => {
        const hours = String(
          appointment.date.getHours(),
        ).padStart(2, "0");

        const minutes = String(
          appointment.date.getMinutes(),
        ).padStart(2, "0");

        return {
          id: appointment.id,

          client: appointment.client.name,

          service: appointment.service.name,

          professional:
            appointment.professional.name,

          date: appointment.date
            .toISOString()
            .split("T")[0],

          time: `${hours}:${minutes}`,

          price: Number(
            appointment.service.price,
          ),

          payment:
            appointment.payment?.status
              ?.toLowerCase() || "pending",

          status:
            appointment.status.toLowerCase(),

          notes: appointment.notes,
        };
      });

    return NextResponse.json(
      {
        appointments: formattedAppointments,
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

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao buscar agendamentos.",
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
  request: Request,
) {
  try {
    const body = await request.json();

    const {
      client,
      service,
      professional,
      date,
      time,
      notes,
    } = body;

    /*
    |--------------------------------------------------------------------------
    | VALIDAÇÃO
    |--------------------------------------------------------------------------
    */

    if (
      !client ||
      !service ||
      !professional ||
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
    | DATA
    |--------------------------------------------------------------------------
    */

    const appointmentDate =
      createDateTime(
        String(date),
        String(time),
      );

    /*
    |--------------------------------------------------------------------------
    | BUSINESS
    |--------------------------------------------------------------------------
    */

    let business =
      await prisma.business.findUnique({
        where: {
          id: BUSINESS_ID,
        },
      });

    /*
     * Se ainda não existir um Business,
     * criamos um automaticamente para
     * o ambiente de desenvolvimento.
     */

    if (!business) {
      business =
        await prisma.business.create({
          data: {
            id: BUSINESS_ID,
            name: "Meu Negócio",
          },
        });
    }

    /*
    |--------------------------------------------------------------------------
    | CLIENTE
    |--------------------------------------------------------------------------
    */

    let clientRecord =
      await prisma.client.findFirst({
        where: {
          businessId: business.id,
          name: String(client).trim(),
        },
      });

    if (!clientRecord) {
      clientRecord =
        await prisma.client.create({
          data: {
            name: String(client).trim(),

            phone: "000000000",

            businessId: business.id,
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
          businessId: business.id,
          name: String(
            professional,
          ).trim(),
        },
      });

    if (!professionalRecord) {
      professionalRecord =
        await prisma.professional.create(
          {
            data: {
              name: String(
                professional,
              ).trim(),

              businessId: business.id,
            },
          },
        );
    }

    /*
    |--------------------------------------------------------------------------
    | SERVIÇO
    |--------------------------------------------------------------------------
    */

    let serviceRecord =
      await prisma.service.findFirst({
        where: {
          businessId: business.id,
          name: String(service).trim(),
        },
      });

    if (!serviceRecord) {
      serviceRecord =
        await prisma.service.create({
          data: {
            name: String(service).trim(),

            price: 0,

            duration: 60,

            businessId: business.id,
          },
        });
    }

    /*
    |--------------------------------------------------------------------------
    | CRIAR AGENDAMENTO
    |--------------------------------------------------------------------------
    */

    const appointment =
      await prisma.appointment.create({
        data: {
          date: appointmentDate,

          notes:
            notes &&
            String(notes).trim()
              ? String(notes).trim()
              : null,

          status: "PENDING",

          business: {
            connect: {
              id: business.id,
            },
          },

          client: {
            connect: {
              id: clientRecord.id,
            },
          },

          professional: {
            connect: {
              id: professionalRecord.id,
            },
          },

          service: {
            connect: {
              id: serviceRecord.id,
            },
          },
        },

        include: {
          client: true,
          professional: true,
          service: true,
          payment: true,
        },
      });

    /*
    |--------------------------------------------------------------------------
    | RESPOSTA
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        appointment: {
          id: appointment.id,

          client:
            appointment.client.name,

          service:
            appointment.service.name,

          professional:
            appointment.professional.name,

          date: appointment.date
            .toISOString()
            .split("T")[0],

          time: String(
            appointment.date.getHours(),
          ).padStart(2, "0") +
            ":" +
            String(
              appointment.date.getMinutes(),
            ).padStart(2, "0"),

          price: Number(
            appointment.service.price,
          ),

          payment: "pending",

          status:
            appointment.status.toLowerCase(),

          notes: appointment.notes,
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

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao criar agendamento.",
      },
      {
        status: 500,
      },
    );
  }
}