const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const counts = {
    users: await prisma.user.count(),
    diaspora: await prisma.diasporaRegistration.count(),
    committees: await prisma.pujaCommittee.count(),
    pandals: await prisma.pandalAtlas.count(),
    articles: await prisma.article.count(),
    webinars: await prisma.webinar.count(),
    rsvps: await prisma.webinarRegistration.count(),
    categories: await prisma.category.count(),
    subcategories: await prisma.subcategory.count(),
  };

  console.log('Database:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@'));
  console.log('Row counts:', JSON.stringify(counts, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
