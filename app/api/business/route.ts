import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, email, phone, address } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Nome do estabelecimento é obrigatório" },
        { status: 400 }
      );
    }

    const business = await prisma.business.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
      },
    });

    return NextResponse.json(business, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar estabelecimento:", error);

    return NextResponse.json(
      { error: "Erro ao criar estabelecimento" },
      { status: 500 }
    );
  }
}
