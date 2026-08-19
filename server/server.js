import "dotenv/config";
import { createApp } from "./src/app.js";
import { connectDB } from "./src/db.js";

const PORT = process.env.PORT || 4000;

async function main() {
  await connectDB();
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`✓ FUL-EVAS API listening on http://localhost:${PORT}`);
    console.log(`  Health check: http://localhost:${PORT}/health`);
  });
}

main();
