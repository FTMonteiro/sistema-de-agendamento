import "dotenv/config";
import { prisma } from "../lib/prisma";

// O Business é a raiz de todos os relacionamentos: Client, Professional,
// Service, Appointment e User tem FK obrigatoria para ele. As rotas da API
// filtram tudo por NEXT_PUBLIC_BUSINESS_ID, e esse ID e fixo (nao e um cuid
// gerado), entao a linha precisa existir antes de qualquer uso do app.
const businessId = process.env.NEXT_PUBLIC_BUSINESS_ID;

async function main() {
  if (!businessId) {
    throw new Error("NEXT_PUBLIC_BUSINESS_ID nao esta configurada");
  }

  const business = await prisma.business.upsert({
    where: { id: businessId },
    update: {},
    create: {
      id: businessId,
      name: "Faustino",
    },
  });

  console.log(`Business pronto: ${business.id} (${business.name})`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
