import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const hasDatabaseUrl = !!process.env.DATABASE_URL;

export const prisma: PrismaClient = hasDatabaseUrl
  ? globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query"] : [],
    })
  : new Proxy({} as PrismaClient, {
      get() {
        throw new Error("DATABASE_URL is not set. Configure it in the environment.");
      },
    });

if (hasDatabaseUrl && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
