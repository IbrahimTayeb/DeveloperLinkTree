import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

const router = express.Router();
const JWT_SECRET = 'supersecret';
const TOKEN_EXPIRY = '1h'; // Token expires in 1 hour

router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({ data: { username, password: hashedPassword } });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    res.status(201).json({ token });
  } catch (err) {
    res.status(400).json({ error: 'User already exists' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
  res.json({ token });
});

// Simulated logout (for JWT, client just removes token)
router.post('/logout', (req, res) => {
  // Inform client to discard token (can also use token blacklist in advanced setups)
  res.status(200).json({ message: 'Logged out successfully' });
});

export default router;