import "dotenv/config";

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Testando conexão...");

  await prisma.$queryRaw`SELECT 1`;

  console.log("CONEXÃO COM POSTGRES FUNCIONOU!");

  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (error) => {
  console.error("ERRO DE CONEXÃO:");
  console.error(error);

  await prisma.$disconnect();
  await pool.end();

  process.exit(1);
});