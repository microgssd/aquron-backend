const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg','image/png','image/gif','image/webp','image/svg+xml'];
    cb(null, allowed.includes(file.mimetype));
  },
});

router.post('/upload', auth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.filename, size: req.file.size });
});

router.get('/list', auth, (req, res) => {
  const dir = path.join(__dirname, '../public/uploads');
  if (!fs.existsSync(dir)) return res.json([]);
  const files = fs.readdirSync(dir).map(f => ({
    filename: f,
    url: `/uploads/${f}`,
    size: fs.statSync(path.join(dir, f)).size,
  }));
  res.json(files);
});

router.delete('/:filename', auth, (req, res) => {
  const fp = path.join(__dirname, '../public/uploads', req.params.filename);
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'File not found' });
  fs.unlinkSync(fp);
  res.json({ message: 'Deleted' });
});

module.exports = router;
