import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const businessId = process.env.NEXT_PUBLIC_BUSINESS_ID;

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID não configurado." },
        { status: 500 },
      );
    }

    const professionals = await prisma.professional.findMany({
      where: {
        businessId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(professionals);
  } catch (error) {
    console.error("Erro ao buscar profissionais:", error);

    return NextResponse.json(
      {
        error: "Erro ao buscar profissionais.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const businessId = process.env.NEXT_PUBLIC_BUSINESS_ID;

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID não configurado." },
        { status: 500 },
      );
    }

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim()
        : null;

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : null;

    const specialty =
      typeof body.specialty === "string"
        ? body.specialty.trim()
        : null;

    const active =
      typeof body.active === "boolean"
        ? body.active
        : true;

    if (!name) {
      return NextResponse.json(
        {
          error: "O nome do profissional é obrigatório.",
        },
        { status: 400 },
      );
    }

    const professional = await prisma.professional.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        specialty: specialty || null,
        active,
        businessId,
      },
    });

    return NextResponse.json(
      professional,
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao criar profissional:", error);

    return NextResponse.json(
      {
        error: "Não foi possível criar o profissional.",
      },
      { status: 500 },
    );
  }
}