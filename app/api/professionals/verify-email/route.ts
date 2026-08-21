import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";

function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

// =====================================================
// GET
// LISTAR PROFISSIONAIS
// =====================================================

export async function GET() {
  try {
    const businessId =
      process.env.NEXT_PUBLIC_BUSINESS_ID;

    if (!businessId) {
      return NextResponse.json(
        {
          error:
            "NEXT_PUBLIC_BUSINESS_ID não configurado.",
        },
        {
          status: 500,
        },
      );
    }

    const professionals =
      await prisma.professional.findMany({
        where: {
          businessId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(
      professionals,
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Erro ao listar profissionais:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Erro ao carregar profissionais.",
      },
      {
        status: 500,
      },
    );
  }
}

// =====================================================
// POST
// CADASTRAR PROFISSIONAL
// =====================================================

export async function POST(
  request: NextRequest,
) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : "";

    const specialty =
      typeof body.specialty === "string"
        ? body.specialty.trim()
        : "";

    const businessId =
      typeof body.businessId === "string"
        ? body.businessId.trim()
        : "";

    // =================================================
    // VALIDAR CAMPOS
    // =================================================

    if (
      !name ||
      !email ||
      !phone ||
      !specialty ||
      !businessId
    ) {
      return NextResponse.json(
        {
          error:
            "Todos os campos são obrigatórios.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // VALIDAR EMAIL
    // =================================================

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error:
            "Informe um email válido.",
        },
        {
          status: 400,
        },
      );
    }

    // =================================================
    // VERIFICAR BUSINESS
    // =================================================

    const business =
      await prisma.business.findUnique({
        where: {
          id: businessId,
        },
      });

    if (!business) {
      return NextResponse.json(
        {
          error:
            "Estabelecimento não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    // =================================================
    // VERIFICAR EMAIL DUPLICADO
    // =================================================

    const existing =
      await prisma.professional.findFirst({
        where: {
          email,
          businessId,
        },
      });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "Já existe um profissional com este email.",
        },
        {
          status: 409,
        },
      );
    }

    // =================================================
    // GERAR TOKEN
    // =================================================

    const verificationToken =
      generateVerificationToken();

    const verificationExpires =
      new Date(
        Date.now() +
          24 * 60 * 60 * 1000,
      );

    // =================================================
    // CRIAR PROFISSIONAL
    // =================================================

    const professional =
      await prisma.professional.create({
        data: {
          name,
          email,
          phone,
          specialty,
          active: true,
          emailVerified: false,
          emailVerificationToken:
            verificationToken,
          emailVerificationExpires:
            verificationExpires,
          businessId,
        },
      });

    // =================================================
    // URL DE VERIFICAÇÃO
    // =================================================

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const verificationUrl =
      `${appUrl}/verify-email?token=${verificationToken}`;

    // =================================================
    // RESEND
    // =================================================

    const resendApiKey =
      process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error(
        "RESEND_API_KEY não configurada.",
      );

      await prisma.professional.delete({
        where: {
          id: professional.id,
        },
      });

      return NextResponse.json(
        {
          error:
            "RESEND_API_KEY não configurada.",
        },
        {
          status: 500,
        },
      );
    }

    const { Resend } =
      await import("resend");

    const resend =
      new Resend(resendApiKey);

    const emailFrom =
      process.env.EMAIL_FROM ||
      "Lumina <onboarding@resend.dev>";

    // =================================================
    // ENVIAR EMAIL
    // =================================================

    const emailResult =
      await resend.emails.send({
        from: emailFrom,
        to: email,
        subject:
          "Verifique o seu email",
        html: `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >
  <title>Verificação de email</title>
</head>

<body
  style="
    margin:0;
    padding:40px 20px;
    background:#f5f7fb;
    font-family:Arial,sans-serif;
  "
>

  <div
    style="
      max-width:600px;
      margin:0 auto;
      padding:40px;
      background:#ffffff;
      border-radius:20px;
    "
  >

    <h1
      style="
        margin:0 0 20px;
        color:#111827;
      "
    >
      Verifique o seu email
    </h1>

    <p
      style="
        color:#4b5563;
        line-height:1.6;
      "
    >
      Olá,
      <strong>${name}</strong>.
    </p>

    <p
      style="
        color:#4b5563;
        line-height:1.6;
      "
    >
      O seu email foi associado
      ao estabelecimento
      <strong>${business.name}</strong>.
    </p>

    <p
      style="
        color:#4b5563;
        line-height:1.6;
      "
    >
      Clique no botão abaixo
      para confirmar o seu endereço
      de email.
    </p>

    <div
      style="
        margin:30px 0;
        text-align:center;
      "
    >

      <a
        href="${verificationUrl}"
        style="
          display:inline-block;
          padding:14px 24px;
          background:#2563eb;
          color:#ffffff;
          text-decoration:none;
          border-radius:10px;
          font-weight:bold;
        "
      >
        Verificar meu email
      </a>

    </div>

    <p
      style="
        color:#6b7280;
        font-size:14px;
        line-height:1.6;
      "
    >
      Este link expira em 24 horas.
    </p>

  </div>

</body>
</html>
        `,
      });

    // =================================================
    // ERRO NO RESEND
    // =================================================

    if (emailResult.error) {
      console.error(
        "Erro Resend:",
        emailResult.error,
      );

      await prisma.professional.delete({
        where: {
          id: professional.id,
        },
      });

      return NextResponse.json(
        {
          error:
            "Não foi possível enviar o email de verificação.",
        },
        {
          status: 500,
        },
      );
    }

    // =================================================
    // SUCESSO
    // =================================================

    return NextResponse.json(
      {
        message:
          "Profissional cadastrado e email de verificação enviado.",

        professional: {
          id: professional.id,
          name: professional.name,
          email: professional.email,
          phone: professional.phone,
          specialty:
            professional.specialty,
          active: professional.active,
          emailVerified:
            professional.emailVerified,
          createdAt:
            professional.createdAt,
          updatedAt:
            professional.updatedAt,
          businessId:
            professional.businessId,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Erro ao cadastrar profissional:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Erro interno ao cadastrar profissional.",
      },
      {
        status: 500,
      },
    );
  }
}