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
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:4001',
    'https://mysite-ten-rosy.vercel.app',
    /\.vercel\.app$/,
    /\.onrender\.com$/
  ],
  credentials: true
}));
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


// ── Keep-alive ping (prevents Render free tier sleep) ──
const https = require('https');
const SELF_URL = process.env.RENDER_EXTERNAL_URL || 'https://aquron-backend.onrender.com';
setInterval(() => {
  https.get(SELF_URL + '/api/health', (res) => {
    console.log('Keep-alive ping:', res.statusCode);
  }).on('error', () => {});
}, 14 * 60 * 1000); // every 14 minutes

app.listen(PORT, () => {
  console.log(`\n🚀 Aquron CMS running at http://localhost:${PORT}`);
  console.log(`📊 Admin panel: http://localhost:${PORT}`);
  console.log(`🔑 Default login: admin / aquron2025\n`);
});
