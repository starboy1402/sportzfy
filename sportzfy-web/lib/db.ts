import { PrismaClient } from "@prisma/client";

function makePrismaClient() {
  const baseClient = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  // Client extension for resilient auto-reconnection on Neon serverless idle socket disconnects
  return baseClient.$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        try {
          return await query(args);
        } catch (error: unknown) {
          const err = error as Record<string, unknown> | undefined;
          const errorMessage = String(err?.message || "");
          const errorCode = String(err?.code || "");

          const isTransientConnectionError =
            errorMessage.includes("Closed") ||
            errorMessage.includes("Connection terminated") ||
            errorMessage.includes("Connection closed") ||
            errorMessage.includes("Can't reach database server") ||
            errorMessage.includes("Socket closed") ||
            errorCode === "P1001" ||
            errorCode === "P1017";

          if (isTransientConnectionError) {
            console.warn(
              `[Prisma Resilience] Auto-reconnecting after transient socket drop in ${model || "raw"}.${operation}:`,
              errorMessage.slice(0, 100)
            );

            // Re-establish connection cleanly
            await baseClient.$disconnect().catch(() => {});
            await baseClient.$connect().catch(() => {});

            // Transparently retry query once
            return await query(args);
          }

          throw error;
        }
      },
    },
  });
}

type ExtendedPrismaClient = ReturnType<typeof makePrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? makePrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
