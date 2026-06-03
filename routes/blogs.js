const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const { auth } = require('../middleware/auth');

const FILE = path.join(__dirname, '../data/blogs.json');
const read = () => JSON.parse(fs.readFileSync(FILE, 'utf8'));
const write = (d) => fs.writeFileSync(FILE, JSON.stringify(d, null, 2));

// GET /api/blogs  -- public
router.get('/', (req, res) => {
  const { cat, tag, published } = req.query;
  let posts = read();
  if (published !== undefined) posts = posts.filter(p => p.published === (published === 'true'));
  if (cat) posts = posts.filter(p => p.cat === cat);
  if (tag) posts = posts.filter(p => p.tags && p.tags.includes(tag));
  res.json(posts);
});

// GET /api/blogs/:id  -- public
router.get('/:id', (req, res) => {
  const posts = read();
  const post = posts.find(p => p.id === parseInt(req.params.id) || p.slug === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

// POST /api/blogs  -- protected (create)
router.post('/', auth, (req, res) => {
  const posts = read();
  const maxId = posts.reduce((m, p) => Math.max(m, p.id || 0), 0);
  const now = new Date().toISOString();
  const post = {
    id: maxId + 1,
    title: req.body.title || 'Untitled',
    slug: req.body.slug || req.body.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `post-${maxId+1}`,
    date: req.body.date || new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }),
    cat: req.body.cat || 'General',
    read: req.body.read || '5 min',
    col: req.body.col || '#00C9FF',
    em: req.body.em || '📝',
    tags: req.body.tags || [],
    exc: req.body.exc || '',
    body: req.body.body || '',
    published: req.body.published !== undefined ? req.body.published : false,
    author: req.body.author || req.user.name,
    createdAt: now,
    updatedAt: now,
  };
  posts.push(post);
  write(posts);
  res.status(201).json(post);
});

// PUT /api/blogs/:id  -- protected (update)
router.put('/:id', auth, (req, res) => {
  const posts = read();
  const idx = posts.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  posts[idx] = { ...posts[idx], ...req.body, id: posts[idx].id, updatedAt: new Date().toISOString() };
  write(posts);
  res.json(posts[idx]);
});

// DELETE /api/blogs/:id  -- protected
router.delete('/:id', auth, (req, res) => {
  const posts = read();
  const filtered = posts.filter(p => p.id !== parseInt(req.params.id));
  if (filtered.length === posts.length) return res.status(404).json({ error: 'Not found' });
  write(filtered);
  res.json({ message: 'Post deleted' });
});

// PATCH /api/blogs/:id/publish  -- toggle published
router.patch('/:id/publish', auth, (req, res) => {
  const posts = read();
  const idx = posts.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  posts[idx].published = !posts[idx].published;
  posts[idx].updatedAt = new Date().toISOString();
  write(posts);
  res.json({ published: posts[idx].published, message: posts[idx].published ? 'Published' : 'Unpublished' });
});

module.exports = router;
