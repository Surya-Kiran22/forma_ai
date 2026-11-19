import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { seedDatabase } from './scripts/seed.js';

async function startServer() {
  try {
    await connectDB();
    await seedDatabase();

    app.listen(env.PORT, () => {
      console.log(`====================================================`);
      console.log(` Forma AI Engine backend listening on port ${env.PORT}`);
      console.log(` Environment: ${env.NODE_ENV}`);
      console.log(` LLM Provider: ${env.LLM_PROVIDER}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
