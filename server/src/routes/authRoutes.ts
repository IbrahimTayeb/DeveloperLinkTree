import express from 'express';
const router = express.Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  // Dummy authentication logic
  if (email === 'test@example.com' && password === 'password') {
    return res.json({ token: 'dummy-jwt-token' });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

export default router;