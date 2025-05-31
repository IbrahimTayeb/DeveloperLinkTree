import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import linkRoutes from './routes/linkRoutes';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/links', linkRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

(async () => {
  const existing = await prisma.user.findUnique({ where: { id: 1 } });
  if (!existing) {
    await prisma.user.create({ data: { username: 'John Doe' } });
    console.log('Created default user');
  }
})();

export { prisma };