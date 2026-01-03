import { prisma } from "../lib/prisma";

async function makeAdmin() {
  const email = "shart1000n@gmail.com";
  
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    if (user.role === "ADMIN") {
      console.log(`User ${email} is already an admin`);
      process.exit(0);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" },
    });

    console.log(`✅ Successfully promoted ${email} to ADMIN`);
    console.log(`You can now login and access /admin`);
  } catch (error: any) {
    console.error("Error promoting user to admin:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();

