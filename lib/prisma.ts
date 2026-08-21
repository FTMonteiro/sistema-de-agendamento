import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: Pool;
};

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DIRECT_DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DIRECT_DATABASE_URL não está configurada");
  }

  const pool =
    globalForPrisma.pool ??
    new Pool({
      connectionString: databaseUrl,
    });

  const client = new PrismaClient({
    adapter: new PrismaPg(pool),
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.pool = pool;
  }

  return client;
}

let client: PrismaClient | undefined;

function getPrismaClient(): PrismaClient {
  client ??= globalForPrisma.prisma ?? createPrismaClient();
  return client;
}

// O cliente é criado no primeiro acesso, não na importação do módulo. O build do
// Next.js importa cada route handler para coletar a config das páginas, e um
// throw no escopo do módulo quebrava o build quando a env var não existia.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const instance = getPrismaClient();
    const value = instance[property as keyof PrismaClient];

    return typeof value === "function" ? value.bind(instance) : value;
  },
});
