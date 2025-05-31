import express from 'express';
const router = express.Router();

router.get('/me', (req, res) => {
  res.json({ username: 'John Doe' });
});

export default router;