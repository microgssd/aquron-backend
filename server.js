const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const blogRoutes = require('./routes/blogs');
const mediaRoutes = require('./routes/media');

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ──
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:4001'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Serve CMS admin panel
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/media', mediaRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Serve admin panel for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Aquron CMS running at http://localhost:${PORT}`);
  console.log(`📊 Admin panel: http://localhost:${PORT}`);
  console.log(`🔑 Default login: admin / aquron2025\n`);
});
