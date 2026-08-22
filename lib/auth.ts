
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "nevrix_session";

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET não configurado.");
  }

  return new TextEncoder().encode(secret);
}

/*
|--------------------------------------------------------------------------
| CRIAR SESSÃO
|--------------------------------------------------------------------------
*/

export async function createSession(userId: string) {
  const token = await new SignJWT({
    userId,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

/*
|--------------------------------------------------------------------------
| PEGAR ID DO UTILIZADOR DA SESSÃO
|--------------------------------------------------------------------------
*/

export async function getSessionUserId() {
  const cookieStore = await cookies();

  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      getSecretKey()
    );

    if (typeof payload.userId !== "string") {
      return null;
    }

    return payload.userId;
  } catch {
    return null;
  }
}

/*
|--------------------------------------------------------------------------
| PEGAR UTILIZADOR AUTENTICADO
|--------------------------------------------------------------------------
*/

export async function getCurrentUser() {
  const userId = await getSessionUserId();

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      businessId: true,
    },
  });

  return user;
}

/*
|--------------------------------------------------------------------------
| DESTRUIR SESSÃO
|--------------------------------------------------------------------------
*/

export async function destroySession() {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE);
}

