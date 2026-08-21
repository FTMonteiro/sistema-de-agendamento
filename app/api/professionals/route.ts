import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";

// ============================================================
// GERAR TOKEN DE VERIFICAÇÃO
// ============================================================

function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ============================================================
// GET - LISTAR PROFISSIONAIS
// ============================================================

export async function GET() {
  try {
    const businessId = process.env.NEXT_PUBLIC_BUSINESS_ID;

    if (!businessId) {
      return NextResponse.json(
        {
          error: "Business ID não configurado.",
        },
        {
          status: 500,
        },
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

    return NextResponse.json(professionals, {
      status: 200,
    });
  } catch (error) {
    console.error("Erro ao listar profissionais:", error);

    return NextResponse.json(
      {
        error: "Erro ao carregar profissionais.",
      },
      {
        status: 500,
      },
    );
  }
}

// ============================================================
// POST - CADASTRAR PROFISSIONAL
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // ========================================================
    // LER BODY
    // ========================================================

    const body = await request.json();

    // ========================================================
    // RECEBER DADOS
    // ========================================================

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

    // ========================================================
    // BUSINESS ID
    // ========================================================
    //
    // Primeiro tenta pegar do body.
    // Se não existir, usa o .env.
    //

    const businessId =
      typeof body.businessId === "string" &&
      body.businessId.trim()
        ? body.businessId.trim()
        : process.env.NEXT_PUBLIC_BUSINESS_ID?.trim() || "";

    // ========================================================
    // LOG DOS DADOS
    // ========================================================

    console.log("========================================");
    console.log("CADASTRO DE PROFISSIONAL");
    console.log("Nome:", name);
    console.log("Email:", email);
    console.log("Telefone:", phone);
    console.log("Especialidade:", specialty);
    console.log("Business ID:", businessId);
    console.log("========================================");

    // ========================================================
    // VALIDAR CAMPOS
    // ========================================================

    if (
      !name ||
      !email ||
      !phone ||
      !specialty ||
      !businessId
    ) {
      return NextResponse.json(
        {
          error: "Todos os campos são obrigatórios.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // VALIDAR EMAIL
    // ========================================================

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: "Informe um email válido.",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // VERIFICAR BUSINESS
    // ========================================================

    const business = await prisma.business.findUnique({
      where: {
        id: businessId,
      },
    });

    if (!business) {
      return NextResponse.json(
        {
          error: "Estabelecimento não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    // ========================================================
    // VERIFICAR EMAIL EXISTENTE
    // ========================================================

    const existing = await prisma.professional.findFirst({
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

    // ========================================================
    // GERAR TOKEN
    // ========================================================

    const verificationToken =
      generateVerificationToken();

    const verificationExpires = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );

    // ========================================================
    // CRIAR PROFISSIONAL
    // ========================================================

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

    console.log(
      "Profissional criado:",
      professional.id,
    );

    // ========================================================
    // URL DA APLICAÇÃO
    // ========================================================

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.trim() ||
      "http://localhost:3000";

    const verificationUrl =
      `${appUrl}/api/professionals/verify-email?token=${verificationToken}`;

    console.log(
      "URL DE VERIFICAÇÃO:",
      verificationUrl,
    );

    // ========================================================
    // VERIFICAR RESEND API KEY
    // ========================================================

    const resendApiKey =
      process.env.RESEND_API_KEY?.trim();

    if (
      !resendApiKey ||
      resendApiKey ===
        "COLOQUE_AQUI_SUA_CHAVE_REAL_DO_RESEND"
    ) {
      console.error(
        "RESEND_API_KEY não configurada corretamente.",
      );

      // Apagar profissional criado
      await prisma.professional.delete({
        where: {
          id: professional.id,
        },
      });

      return NextResponse.json(
        {
          error:
            "RESEND_API_KEY não configurada corretamente.",
        },
        {
          status: 500,
        },
      );
    }

    // ========================================================
    // IMPORTAR RESEND
    // ========================================================

    const { Resend } = await import("resend");

    const resend = new Resend(resendApiKey);

    // ========================================================
    // EMAIL FROM
    // ========================================================

    const emailFrom =
      process.env.EMAIL_FROM?.trim() ||
      "Lumina <onboarding@resend.dev>";

    console.log("Email FROM:", emailFrom);
    console.log("Email TO:", email);

    // ========================================================
    // ENVIAR EMAIL
    // ========================================================

    const emailResult =
      await resend.emails.send({
        from: emailFrom,

        to: email,

        subject:
          "Verifique o seu email - Lumina",

        html: `
<!DOCTYPE html>

<html lang="pt">

<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>
    Verificação de email
  </title>
</head>

<body
  style="
    margin:0;
    padding:40px 20px;
    background:#f5f7fb;
    font-family:Arial,Helvetica,sans-serif;
  "
>

  <div
    style="
      max-width:600px;
      margin:0 auto;
      padding:40px;
      background:#ffffff;
      border-radius:20px;
      box-shadow:0 10px 30px rgba(0,0,0,0.08);
    "
  >

    <h1
      style="
        margin:0 0 20px;
        color:#111827;
        font-size:28px;
      "
    >
      Verifique o seu email
    </h1>

    <p
      style="
        color:#4b5563;
        line-height:1.6;
        font-size:16px;
      "
    >
      Olá,
      <strong>${name}</strong>.
    </p>

    <p
      style="
        color:#4b5563;
        line-height:1.6;
        font-size:16px;
      "
    >
      O seu email foi associado ao estabelecimento
      <strong>${business.name}</strong>.
    </p>

    <p
      style="
        color:#4b5563;
        line-height:1.6;
        font-size:16px;
      "
    >
      Para confirmar o seu endereço de email,
      clique no botão abaixo.
    </p>

    <div
      style="
        margin:35px 0;
        text-align:center;
      "
    >

      <a
        href="${verificationUrl}"
        style="
          display:inline-block;
          padding:15px 28px;
          background:#2563eb;
          color:#ffffff;
          text-decoration:none;
          border-radius:10px;
          font-weight:bold;
          font-size:16px;
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

    <p
      style="
        color:#9ca3af;
        font-size:12px;
        line-height:1.6;
        margin-top:30px;
      "
    >
      Se você não solicitou este email,
      pode ignorar esta mensagem.
    </p>

  </div>

</body>

</html>
        `,
      });

    // ========================================================
    // VERIFICAR ERRO DO RESEND
    // ========================================================

    if (emailResult.error) {
      console.error(
        "========================================",
      );

      console.error(
        "ERRO REAL DO RESEND:",
      );

      console.error(
        emailResult.error,
      );

      console.error(
        "========================================",
      );

      // Apagar profissional se email falhar
      await prisma.professional.delete({
        where: {
          id: professional.id,
        },
      });

      return NextResponse.json(
        {
          error:
            "Não foi possível enviar o email de verificação.",

          details:
            process.env.NODE_ENV ===
            "development"
              ? emailResult.error.message
              : undefined,
        },
        {
          status: 500,
        },
      );
    }

    // ========================================================
    // SUCESSO
    // ========================================================

    console.log(
      "========================================",
    );

    console.log(
      "EMAIL ENVIADO COM SUCESSO",
    );

    console.log(
      "RESEND RESULT:",
      emailResult.data,
    );

    console.log(
      "========================================",
    );

    // ========================================================
    // RETORNAR PROFISSIONAL
    // ========================================================

    return NextResponse.json(
      {
        message:
          "Profissional cadastrado. Email de verificação enviado.",

        professional: {
          id: professional.id,

          name: professional.name,

          email: professional.email,

          phone: professional.phone,

          specialty:
            professional.specialty,

          active:
            professional.active,

          emailVerified:
            professional.emailVerified,

          createdAt:
            professional.createdAt,

          updatedAt:
            professional.updatedAt,

          businessId:
            professional.businessId,
        },

        email: {
          sent: true,
          id:
            emailResult.data?.id ??
            null,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    // ========================================================
    // ERRO GERAL
    // ========================================================

    console.error(
      "========================================",
    );

    console.error(
      "ERRO INTERNO AO CADASTRAR PROFISSIONAL:",
    );

    console.error(error);

    console.error(
      "========================================",
    );

    return NextResponse.json(
      {
        error:
          "Erro interno ao cadastrar profissional.",

        details:
          process.env.NODE_ENV ===
          "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      {
        status: 500,
      },
    );
  }
}