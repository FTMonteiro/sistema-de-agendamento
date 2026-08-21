import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BUSINESS_ID =
  process.env.NEXT_PUBLIC_BUSINESS_ID;

/*
 * O logo é guardado como data URL na própria coluna. Simples e sem depender de
 * armazenamento externo, mas a linha carrega a imagem inteira — daí o limite.
 */
const MAX_LOGO_LENGTH = 1_500_000;

function readOptionalText(
  value: unknown,
): string | null {
  return typeof value === "string" &&
    value.trim()
    ? value.trim()
    : null;
}

/* "HH:MM" em 24 horas. */
const TIME_PATTERN =
  /^([01]\d|2[0-3]):([0-5]\d)$/;

function readTime(
  value: unknown,
): string | null | undefined {
  const text = readOptionalText(value);

  if (text === null) {
    return null;
  }

  return TIME_PATTERN.test(text)
    ? text
    : undefined;
}

function toMinutes(time: string) {
  const [hours, minutes] =
    time.split(":").map(Number);

  return hours * 60 + minutes;
}

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

    const business =
      await prisma.business.findUnique({
        where: { id: BUSINESS_ID },

        include: {
          _count: {
            select: {
              clients: true,
              professionals: true,
              services: true,
              appointments: true,
            },
          },
        },
      });

    if (!business) {
      return NextResponse.json(
        {
          error:
            "Estabelecimento não encontrado.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(business);
  } catch (error) {
    console.error(
      "GET /api/business:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível carregar o estabelecimento.",
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
) {
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

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    if (!name) {
      return NextResponse.json(
        {
          error:
            "O nome do estabelecimento é obrigatório.",
        },
        { status: 400 },
      );
    }

    const logo = readOptionalText(
      body.logo,
    );

    if (
      logo &&
      logo.length > MAX_LOGO_LENGTH
    ) {
      return NextResponse.json(
        {
          error:
            "A imagem do logo é muito grande. Use uma com menos de 1 MB.",
        },
        { status: 413 },
      );
    }

    /*
     * Horário. `undefined` aqui significa formato inválido — distinto de
     * `null`, que é "sem horário definido".
     */
    const openingTime = readTime(
      body.openingTime,
    );

    const closingTime = readTime(
      body.closingTime,
    );

    if (
      openingTime === undefined ||
      closingTime === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Horário inválido. Use o formato HH:MM.",
        },
        { status: 400 },
      );
    }

    if (
      openingTime &&
      closingTime &&
      toMinutes(openingTime) >=
        toMinutes(closingTime)
    ) {
      return NextResponse.json(
        {
          error:
            "A hora de fecho tem de ser depois da hora de abertura.",
        },
        { status: 400 },
      );
    }

    /* Dias da semana: 0 (domingo) a 6 (sábado), sem repetidos. */
    const workingDays = Array.isArray(
      body.workingDays,
    )
      ? Array.from(
          new Set(
            body.workingDays
              .map((day: unknown) =>
                Number(day),
              )
              .filter(
                (day: number) =>
                  Number.isInteger(day) &&
                  day >= 0 &&
                  day <= 6,
              ),
          ),
        ).sort(
          (a, b) =>
            (a as number) -
            (b as number),
        )
      : undefined;

    const slotInterval =
      body.slotInterval === undefined
        ? undefined
        : Number(body.slotInterval);

    if (
      slotInterval !== undefined &&
      (!Number.isInteger(slotInterval) ||
        slotInterval < 5 ||
        slotInterval > 240)
    ) {
      return NextResponse.json(
        {
          error:
            "O intervalo entre agendamentos deve estar entre 5 e 240 minutos.",
        },
        { status: 400 },
      );
    }

    const business =
      await prisma.business.update({
        where: { id: BUSINESS_ID },

        data: {
          name,
          email: readOptionalText(body.email),
          phone: readOptionalText(body.phone),
          address: readOptionalText(
            body.address,
          ),
          logo,
          openingTime,
          closingTime,
          rules: readOptionalText(
            body.rules,
          ),

          ...(workingDays
            ? {
                workingDays:
                  workingDays as number[],
              }
            : {}),

          ...(slotInterval !== undefined
            ? { slotInterval }
            : {}),
        },
      });

    return NextResponse.json(business);
  } catch (error) {
    console.error(
      "PUT /api/business:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível salvar o estabelecimento.",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
) {
  try {
    const body = await request.json();

    const { name, email, phone, address } =
      body;

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Nome do estabelecimento é obrigatório",
        },
        { status: 400 },
      );
    }

    const business =
      await prisma.business.create({
        data: {
          name,
          email: email || null,
          phone: phone || null,
          address: address || null,
        },
      });

    return NextResponse.json(business, {
      status: 201,
    });
  } catch (error) {
    console.error(
      "Erro ao criar estabelecimento:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Erro ao criar estabelecimento",
      },
      { status: 500 },
    );
  }
}
