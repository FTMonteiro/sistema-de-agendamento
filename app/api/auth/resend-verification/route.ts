import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "O email é obrigatório.",
          code: "EMAIL_REQUIRED",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // PROCURAR UTILIZADOR
    // ============================================================

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // Não revelar se o email existe ou não
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "Se existir uma conta com esse email, enviaremos um novo email de confirmação.",
      });
    }

    // ============================================================
    // JÁ CONFIRMADO
    // ============================================================

    if (user.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          error: "Este email já foi confirmado.",
          code: "EMAIL_ALREADY_VERIFIED",
        },
        { status: 400 },
      );
    }

    // ============================================================
    // APAGAR TOKENS ANTIGOS
    // ============================================================

    await prisma.emailVerificationToken.deleteMany({
      where: {
        userId: user.id,
      },
    });

    // ============================================================
    // GERAR NOVO TOKEN
    // ============================================================

    const verificationToken =
      crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    const expiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );

    // ============================================================
    // GUARDAR TOKEN
    // ============================================================

    await prisma.emailVerificationToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    // ============================================================
    // ENVIAR EMAIL
    // ============================================================

    try {
      await sendVerificationEmail(
        user.email,
        user.name,
        verificationToken,
      );
    } catch (emailError) {
      console.error(
        "❌ Erro ao enviar email de confirmação:",
        emailError,
      );

      // Se o email falhou, remove o token que acabou de ser criado.
      await prisma.emailVerificationToken.deleteMany({
        where: {
          userId: user.id,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error:
            "Não foi possível enviar o email de confirmação. Tente novamente.",
          code: "EMAIL_SEND_ERROR",
        },
        { status: 500 },
      );
    }

    // ============================================================
    // SUCESSO
    // ============================================================

    console.log(
      "✅ Email de confirmação reenviado:",
      user.email,
    );

    return NextResponse.json({
      success: true,
      message:
        "Um novo email de confirmação foi enviado.",
    });
  } catch (error) {
    console.error(
      "❌ Erro ao reenviar confirmação:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Não foi possível reenviar o email de confirmação.",
        code: "RESEND_VERIFICATION_ERROR",
      },
      { status: 500 },
    );
  }
}