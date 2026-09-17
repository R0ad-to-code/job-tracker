import { PrismaClient } from "../app/generated/prisma/client";

const prisma = new PrismaClient();

const STARTER_PLATFORMS = [
  { name: "LinkedIn", url: "https://www.linkedin.com/jobs/" },
  { name: "Indeed", url: "https://www.indeed.com/" },
];

async function main() {
  for (const platform of STARTER_PLATFORMS) {
    const existing = await prisma.platform.findFirst({
      where: { name: platform.name },
    });
    if (!existing) {
      await prisma.platform.create({ data: platform });
    }
  }

  await prisma.cvProfile.upsert({
    where: { id: "singleton" },
    update: {},
    create: {},
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
