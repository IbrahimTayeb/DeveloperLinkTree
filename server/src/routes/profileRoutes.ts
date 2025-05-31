import express from 'express';
import { prisma } from '../index';
const router = express.Router();

const defaultUserId = 1;

router.get('/me', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: defaultUserId } });
  res.json({ username: user?.username });
});

export default router;
