import net from "net";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";

function isPortOpen(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host });
    socket.setTimeout(500);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

export async function ensureDatabase(): Promise<void> {
  let databaseUrl: URL;
  try {
    databaseUrl = new URL(
      process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/gift_detective"
    );
  } catch {
    // If DATABASE_URL is not a standard URL, defer to Prisma connection handling
    return;
  }

  // Remote databases (Supabase, Neon, RDS, Render Postgres, etc.) do not need local startup
  if (!["localhost", "127.0.0.1", "::1"].includes(databaseUrl.hostname)) {
    return;
  }

  const port = Number(databaseUrl.port || 5432);
  const host = databaseUrl.hostname === "localhost" ? "127.0.0.1" : databaseUrl.hostname;

  if (await isPortOpen(host, port)) {
    return;
  }

  const pgBinary = "C:\\Program Files\\PostgreSQL\\18\\bin\\postgres.exe";
  const pgData = path.resolve(__dirname, "../../.pgdata");

  if (fs.existsSync(pgBinary) && fs.existsSync(pgData)) {
    console.log(`Starting dedicated local PostgreSQL instance on port ${port}...`);
    const child = spawn(pgBinary, ["-D", pgData, "-p", String(port)], {
      detached: true,
      stdio: "ignore",
    });
    child.on("error", (error) => {
      console.error("Could not start local PostgreSQL:", error.message);
    });
    child.unref();

    const readyBy = Date.now() + 15000;
    while (Date.now() < readyBy) {
      if (await isPortOpen(host, port)) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    throw new Error(`Local PostgreSQL did not become available on port ${port}.`);
  }
}
