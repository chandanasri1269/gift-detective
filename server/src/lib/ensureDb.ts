import net from "net";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";

export async function ensureDatabase(): Promise<void> {
  const isPortOpen = await new Promise<boolean>((resolve) => {
    const socket = net.connect({ port: 5433, host: "127.0.0.1" }, () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
  });

  if (isPortOpen) {
    return;
  }

  const pgBinary = "C:\\Program Files\\PostgreSQL\\18\\bin\\postgres.exe";
  const pgData = path.resolve(__dirname, "../../.pgdata");

  if (fs.existsSync(pgBinary) && fs.existsSync(pgData)) {
    console.log("Starting dedicated local PostgreSQL instance on port 5433...");
    const child = spawn(pgBinary, ["-D", pgData, "-p", "5433"], {
      detached: true,
      stdio: "ignore",
    });
    child.unref();

    // Give it a brief moment to bind to the port
    await new Promise((res) => setTimeout(res, 1200));
  }
}
