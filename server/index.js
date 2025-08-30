import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import authRoutes from './routes/auth.js';
import bugReportRoutes from './routes/bugReports.js';
import analyticsRoutes from './routes/analytics.js';
import widgetRoutes from './routes/widget.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const distDir = join(__dirname, '../dist');
const indexHtmlPath = join(distDir, 'index.html');

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:", "*"],
      connectSrc: ["'self'", "*"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
    },
  },
}));

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.static(distDir));

// Rate limiting middleware
app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({ error: 'Too many requests' });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bug-reports', bugReportRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/widget', widgetRoutes);

// Widget endpoint
app.get('/widget.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.sendFile(join(__dirname, '../widget/dist/widget.js'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  if (fs.existsSync(indexHtmlPath)) {
    return res.sendFile(indexHtmlPath);
  }
  res.status(200).send(
    `UI build not found. Expected file at ${indexHtmlPath}.\n` +
    'The server is running, but the client build is missing. '
    + 'Ensure "npm run build" produced the dist/ folder during deploy.'
  );
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔧 Widget: http://localhost:${PORT}/widget.js`);
  console.log(`🗂️ Dist directory: ${distDir} (exists: ${fs.existsSync(distDir)})`);
  console.log(`📄 Index HTML path: ${indexHtmlPath} (exists: ${fs.existsSync(indexHtmlPath)})`);
});
