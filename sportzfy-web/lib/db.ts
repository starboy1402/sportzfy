import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Vercel serverless writable SQLite handler
if (process.env.VERCEL) {
  try {
    const tmpDbPath = path.join("/tmp", "dev.db");
    const sourceDbPath = path.join(process.cwd(), "prisma", "dev.db");

    if (!fs.existsSync(tmpDbPath) && fs.existsSync(sourceDbPath)) {
      fs.copyFileSync(sourceDbPath, tmpDbPath);
    }
    if (fs.existsSync(tmpDbPath)) {
      process.env.DATABASE_URL = `file:${tmpDbPath}`;
    }
  } catch (err) {
    console.error("Vercel SQLite tmp copy error:", err);
  }
}

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
