import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import aiRoutes from './routes/ai';
import favoritesRoutes from './routes/favorites';
import { initDb } from './services/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});
app.get('/', (_req, res) => { 
    res.json({ status: 'ok', message: 'RecipeRec API root' }); 
});
app.use('/ai', aiRoutes);
app.use('/favorites', favoritesRoutes);

// Centralized error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
});

/**
 * Starts the server after initializing the database.
 * This ensures that the database is ready before the server starts accepting requests.
 */
async function startServer() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
}

startServer();
