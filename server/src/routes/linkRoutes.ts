import express from 'express';
import { prisma } from '../index';
const router = express.Router();

const defaultUserId = 1; // simulate logged-in user

router.get('/', async (req, res) => {
  const links = await prisma.link.findMany({
    where: { userId: defaultUserId },
  });
  res.json(links);
});

router.post('/', async (req, res) => {
  const { title, url } = req.body;
  const newLink = await prisma.link.create({
    data: { title, url, userId: defaultUserId },
  });
  res.status(201).json(newLink);
});

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  await prisma.link.delete({ where: { id } });
  res.status(204).send();
});

export default router;