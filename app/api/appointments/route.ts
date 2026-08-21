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
      clientId,
      serviceId,
      professionalId,
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
      !clientId ||
      !serviceId ||
      !professionalId ||
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
    | RESOLVER REGISTROS
    |
    | Cliente, profissional e servico agora chegam por id, escolhidos num
    | dropdown. Antes vinham como texto livre e eram criados quando nao
    | existiam, o que enchia o banco de clientes sem telefone e servicos com
    | preco zero. Aqui apenas validamos que pertencem a este estabelecimento.
    |--------------------------------------------------------------------------
    */

    const [
      clientRecord,
      professionalRecord,
      serviceRecord,
    ] = await Promise.all([
      prisma.client.findFirst({
        where: {
          id: String(clientId),
          businessId: BUSINESS_ID,
        },
      }),

      prisma.professional.findFirst({
        where: {
          id: String(professionalId),
          businessId: BUSINESS_ID,
        },
      }),

      prisma.service.findFirst({
        where: {
          id: String(serviceId),
          businessId: BUSINESS_ID,
        },
      }),
    ]);

    const missing = [
      !clientRecord && "o cliente",
      !professionalRecord && "o profissional",
      !serviceRecord && "o serviço",
    ].filter(
      (item): item is string =>
        typeof item === "string",
    );

    if (
      !clientRecord ||
      !professionalRecord ||
      !serviceRecord
    ) {
      // "o cliente" / "o cliente e o profissional" /
      // "o cliente, o profissional e o serviço"
      const lista =
        missing.length === 1
          ? missing[0]
          : `${missing
              .slice(0, -1)
              .join(", ")} e ${
              missing[missing.length - 1]
            }`;

      const concordancia =
        missing.length === 1
          ? "selecionado"
          : "selecionados";

      return NextResponse.json(
        {
          error: `Não foi possível encontrar ${lista} ${concordancia}. Atualize a página e tente novamente.`,
        },
        {
          status: 404,
        },
      );
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
              id: BUSINESS_ID,
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