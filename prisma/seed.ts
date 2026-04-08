import { PrismaClient } from "@prisma/client";
import { packs } from "../lib/packs";

const prisma = new PrismaClient();
async function main() {
  for (const p of packs) {
    await prisma.pack.upsert({
      where: { id: p.id },
      update: { title: p.name, priceUYU: p.priceUYU, maxImages: p.quantity },
      create: {
        id: p.id,
        title: p.name,
        priceUYU: p.priceUYU,
        maxImages: p.quantity,
        isActive: true,
      },
    });
  }
  console.log("✅ Productos insertados");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
