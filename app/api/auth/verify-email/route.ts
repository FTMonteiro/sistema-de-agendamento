import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/login?verification=invalid", request.url),
      );
    }

    // ============================================================
    // HASH DO TOKEN RECEBIDO
    // ============================================================

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // ============================================================
    // PROCURAR TOKEN
    // ============================================================

    const verificationToken =
      await prisma.emailVerificationToken.findUnique({
        where: {
          tokenHash,
        },
        include: {
          user: true,
        },
      });

    if (!verificationToken) {
      return NextResponse.redirect(
        new URL("/login?verification=invalid", request.url),
      );
    }

    // ============================================================
    // VERIFICAR EXPIRAÇÃO
    // ============================================================

    if (verificationToken.expiresAt < new Date()) {
      await prisma.emailVerificationToken.delete({
        where: {
          id: verificationToken.id,
        },
      });

      return NextResponse.redirect(
        new URL("/login?verification=expired", request.url),
      );
    }

    // ============================================================
    // JÁ VERIFICADO
    // ============================================================

    if (verificationToken.user.emailVerified) {
      await prisma.emailVerificationToken.delete({
        where: {
          id: verificationToken.id,
        },
      });

      return NextResponse.redirect(
        new URL("/login?verification=already", request.url),
      );
    }

    // ============================================================
    // CONFIRMAR EMAIL
    // ============================================================

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: verificationToken.userId,
        },
        data: {
          emailVerified: true,
        },
      }),

      prisma.emailVerificationToken.delete({
        where: {
          id: verificationToken.id,
        },
      }),
    ]);

    // ============================================================
    // SUCESSO
    // ============================================================

    return NextResponse.redirect(
      new URL("/login?verification=success", request.url),
    );
  } catch (error) {
    console.error(
      "❌ Erro ao verificar email:",
      error,
    );

    return NextResponse.redirect(
      new URL("/login?verification=error", request.url),
    );
  }
}