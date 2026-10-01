import app from "./app";
import { ensureDatabase } from "./lib/ensureDb";
import prisma from "./lib/prisma";

const PORT = process.env.PORT || 5000;

async function start() {
  const jwtSecret = process.env.JWT_SECRET;
  const placeholderSecrets = new Set([
    "your-super-secret-jwt-key-change-this",
    "gift-detective-super-secret-jwt-key-change-in-prod",
  ]);

  if (
    process.env.NODE_ENV === "production" &&
    (!jwtSecret || jwtSecret.length < 32 || placeholderSecrets.has(jwtSecret))
  ) {
    throw new Error("JWT_SECRET must be set to at least 32 characters in production.");
  }

  await ensureDatabase();
  await prisma.$connect();

  app.listen(PORT, () => {
    console.log(`Gift Detective API running on http://localhost:${PORT}`);
  });
}

start().catch((error: unknown) => {
  console.error("Failed to start Gift Detective API:", error);
  process.exitCode = 1;
});
