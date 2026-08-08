import prisma from './lib/prisma';
async function main() {
  const files = await prisma.mediaFile.findMany({
    where: {
      OR: [
        { name: { contains: "ANKER" } },
        { name: { contains: "1477509" } }
      ]
    }
  });
  console.log(JSON.stringify(files, null, 2));
}
main();
