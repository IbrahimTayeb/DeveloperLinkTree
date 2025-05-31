import express from 'express';
import { prisma } from '../index';
import { authenticate } from '../middleware/auth';

const router = express.Router();
router.use(authenticate);
const defaultUserId = 1; // simulate logged-in user

router.get('/', async (req, res) => {
  const userId = (req as any).userId;
  const links = await prisma.link.findMany({ where: { userId } });
  res.json(links);
});

router.post('/', async (req, res) => {
  const userId = (req as any).userId;
  const { title, url } = req.body;
  const newLink = await prisma.link.create({ data: { title, url, userId } });
  res.status(201).json(newLink);
});

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  await prisma.link.delete({ where: { id } });
  res.status(204).send();
});

export default router;