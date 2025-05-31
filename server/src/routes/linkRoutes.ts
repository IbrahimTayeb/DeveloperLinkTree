import express from 'express';
const router = express.Router();

let links = [
  { id: 1, title: 'GitHub', url: 'https://github.com/yourprofile' },
  { id: 2, title: 'LinkedIn', url: 'https://linkedin.com/in/yourprofile' },
];

router.get('/', (req, res) => {
  res.json(links);
});

router.post('/', (req, res) => {
  const { title, url } = req.body;
  const newLink = { id: links.length + 1, title, url };
  links.push(newLink);
  res.status(201).json(newLink);
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  links = links.filter((link) => link.id !== id);
  res.status(204).send();
});

export default router;