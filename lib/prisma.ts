import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// ============================================================
// PRISMA + POSTGRESQL
// ============================================================
//
// Mantemos uma única instância do Pool e do PrismaClient
// durante o desenvolvimento para evitar abrir várias
// conexões com o PostgreSQL a cada reload do Next.js.
//

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: Pool;
};

// ============================================================
// CRIAR POOL
// ============================================================

function createPool(): Pool {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL não está configurada.",
    );
  }

  const pool = new Pool({
    connectionString: databaseUrl,

    // ----------------------------------------------------------
    // CONEXÕES
    // ----------------------------------------------------------

    max: 10,

    min: 0,

    // ----------------------------------------------------------
    // TEMPO PARA ESTABELECER CONEXÃO
    // ----------------------------------------------------------

    connectionTimeoutMillis: 15000,

    // ----------------------------------------------------------
    // TEMPO DE IDLE
    // ----------------------------------------------------------

    idleTimeoutMillis: 30000,

    // ----------------------------------------------------------
    // KEEP ALIVE
    // ----------------------------------------------------------

    keepAlive: true,

    keepAliveInitialDelayMillis: 10000,

    // ----------------------------------------------------------
    // SSL
    // ----------------------------------------------------------
    //
    // O PostgreSQL/Supabase/Neon/etc. pode usar SSL através
    // da própria DATABASE_URL.
    //
    // Não forçamos ssl aqui para não quebrar conexões locais.
    //

    allowExitOnIdle: false,
  });

  // ==========================================================
  // ERROS DO POOL
  // ==========================================================

  pool.on(
    "error",
    (error) => {
      console.error(
        "❌ Erro inesperado no PostgreSQL:",
        error,
      );
    },
  );

  pool.on(
    "connect",
    () => {
      if (process.env.NODE_ENV !== "production") {
        console.log(
          "✅ Conexão PostgreSQL estabelecida.",
        );
      }
    },
  );

  return pool;
}

// ============================================================
// CRIAR PRISMA
// ============================================================

function createPrismaClient(): PrismaClient {
  const pool =
    globalForPrisma.pool ??
    createPool();

  const adapter =
    new PrismaPg(pool);

  const client =
    new PrismaClient({
      adapter,
    });

  // ----------------------------------------------------------
  // DESENVOLVIMENTO
  // ----------------------------------------------------------
  //
  // O Next.js/Turbopack pode recarregar módulos várias vezes.
  // Guardamos as instâncias no globalThis para evitar dezenas
  // de pools/conexões simultâneas.
  //

  if (
    process.env.NODE_ENV !==
    "production"
  ) {
    globalForPrisma.pool = pool;
    globalForPrisma.prisma = client;
  }

  return client;
}

// ============================================================
// CLIENTE
// ============================================================

let client: PrismaClient | undefined;

// ============================================================
// OBTER CLIENTE
// ============================================================

function getPrismaClient(): PrismaClient {
  if (client) {
    return client;
  }

  if (globalForPrisma.prisma) {
    client =
      globalForPrisma.prisma;

    return client;
  }

  client =
    createPrismaClient();

  return client;
}

// ============================================================
// EXPORT
// ============================================================
//
// Proxy para manter:
// import { prisma } from "@/lib/prisma";
//
// sem abrir conexão durante o import do módulo.
//

export const prisma =
  new Proxy(
    {} as PrismaClient,
    {
      get(
        _target,
        property,
      ) {
        const instance =
          getPrismaClient();

        const value =
          instance[
            property as keyof PrismaClient
          ];

        if (
          typeof value ===
          "function"
        ) {
          return value.bind(
            instance,
          );
        }

        return value;
      },
    },
  );