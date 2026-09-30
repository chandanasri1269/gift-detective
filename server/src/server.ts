import app from "./app";
import { ensureDatabase } from "./lib/ensureDb";

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await ensureDatabase();
  } catch (err) {
    console.warn("Could not auto-start database:", err);
  }

  app.listen(PORT, () => {
    console.log(`Gift Detective API running on http://localhost:${PORT}`);
  });
}

start();
