import express from 'express';
import cors from 'cors';
import http from 'http';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { connectDB } from './config/db';
import { env } from './config/env';
import { errorHandler } from './middleware/error';
import { setupSocket } from './socket';

import authRoutes from './routes/auth';
import offerRoutes from './routes/offers';
import orderRoutes from './routes/orders';
import chatRoutes from './routes/chat';
import reviewRoutes from './routes/reviews';
import uploadRoutes from './routes/upload';
import categoryRoutes from './routes/categories';
import bannerRoutes from './routes/banners';
import paymentRoutes from './routes/payment';
import { seedCategories } from './seed';

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

setupSocket(server);

connectDB().then(async () => {
  await seedCategories();
  server.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });
});

export default app;
