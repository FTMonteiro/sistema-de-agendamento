import "dotenv/config";
import { defineConfig } from "prisma/config";

// `prisma generate` (executado no build da Vercel) não precisa da URL do banco.
// Só os comandos de migration/introspection precisam, então a datasource é
// incluída apenas quando a variável existe — evitando o PrismaConfigEnvError
// que quebrava o build.
const databaseUrl = process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },

  ...(databaseUrl ? { datasource: { url: databaseUrl } } : {}),
});
