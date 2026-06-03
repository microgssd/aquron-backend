const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const { auth } = require('../middleware/auth');

const FILE = path.join(__dirname, '../data/content.json');
const read = () => JSON.parse(fs.readFileSync(FILE, 'utf8'));
const write = (d) => fs.writeFileSync(FILE, JSON.stringify(d, null, 2));

// GET /api/content  -- public, serves all site content to the frontend
router.get('/', (req, res) => res.json(read()));

// GET /api/content/:section
router.get('/:section', (req, res) => {
  const data = read();
  const section = data[req.params.section];
  if (!section) return res.status(404).json({ error: 'Section not found' });
  res.json(section);
});

// PUT /api/content/:section  -- protected
router.put('/:section', auth, (req, res) => {
  const data = read();
  if (!(req.params.section in data)) return res.status(404).json({ error: 'Section not found' });
  data[req.params.section] = { ...data[req.params.section], ...req.body };
  write(data);
  res.json({ message: 'Updated successfully', data: data[req.params.section] });
});

// ── Social Links shortcuts ──
router.get('/social/links', (req, res) => res.json(read().socialLinks));
router.put('/social/links', auth, (req, res) => {
  const data = read();
  data.socialLinks = { ...data.socialLinks, ...req.body };
  write(data);
  res.json({ message: 'Social links updated', data: data.socialLinks });
});

// ── Portfolio CRUD ──
router.get('/portfolio/all', (req, res) => res.json(read().portfolio));

router.post('/portfolio/add', auth, (req, res) => {
  const data = read();
  const item = { id: Date.now().toString(), ...req.body };
  data.portfolio.push(item);
  write(data);
  res.status(201).json(item);
});

router.put('/portfolio/:id', auth, (req, res) => {
  const data = read();
  const idx = data.portfolio.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.portfolio[idx] = { ...data.portfolio[idx], ...req.body };
  write(data);
  res.json(data.portfolio[idx]);
});

router.delete('/portfolio/:id', auth, (req, res) => {
  const data = read();
  data.portfolio = data.portfolio.filter(p => p.id !== req.params.id);
  write(data);
  res.json({ message: 'Deleted' });
});

// ── Team CRUD ──
router.put('/team/:id', auth, (req, res) => {
  const data = read();
  const idx = data.team.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.team[idx] = { ...data.team[idx], ...req.body };
  write(data);
  res.json(data.team[idx]);
});

// ── Pricing CRUD ──
router.put('/pricing/:name', auth, (req, res) => {
  const data = read();
  const idx = data.pricingPlans.findIndex(p => p.name === req.params.name);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data.pricingPlans[idx] = { ...data.pricingPlans[idx], ...req.body };
  write(data);
  res.json(data.pricingPlans[idx]);
});

module.exports = router;
