import express from 'express';
import cors from 'cors';
import http from 'http';
import { connectDB } from './config/db';
import { env } from './config/env';
import { errorHandler } from './middleware/error';
import { setupSocket } from './socket';

import authRoutes from './routes/auth';
import offerRoutes from './routes/offers';
import orderRoutes from './routes/orders';
import chatRoutes from './routes/chat';
import reviewRoutes from './routes/reviews';

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

setupSocket(server);

connectDB().then(() => {
  server.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });
});

export default app;
