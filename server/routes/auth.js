import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// JWT_SECRET is required for security - fail fast if not set
const JWT_SECRET = process.env.JWT_SECRET;
let JWT_SECRET_SAFE;

if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production');
  }
  // Generate a random secret for this server instance (dev only)
  // Tokens will be invalidated on server restart - acceptable for development
  JWT_SECRET_SAFE = crypto.randomBytes(32).toString('hex');
  console.warn('⚠️  WARNING: JWT_SECRET not set. Using random dev secret (tokens expire on restart)');
} else {
  JWT_SECRET_SAFE = JWT_SECRET;
}

// Export function to get JWT secret for use in other modules
export function getJwtSecret() {
  return JWT_SECRET_SAFE;
}

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log('Checking if user exists...');
    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    console.log('User check result:', { existingUser, checkError });

    if (existingUser) {
      console.log('User already exists');
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    console.log('Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);
    const apiKey = uuidv4();
    console.log('Password hashed, API key generated');

    // Create user
    console.log('Creating user...');
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        api_key: apiKey
      })
      .select()
      .single();

    console.log('User creation result:', { user, userError });

    if (userError) {
      console.error('User creation error:', userError);
      throw userError;
    }

    // Create default project
    console.log('Creating default project...');
    const projectApiKey = uuidv4();
    const { error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: 'Default Project',
        api_key: projectApiKey
      });

    console.log('Project creation result:', { projectError });

    if (projectError) {
      console.error('Project creation error:', projectError);
      throw projectError;
    }

    // Generate JWT
    console.log('Generating JWT...');
    const token = jwt.sign({ userId: user.id }, JWT_SECRET_SAFE, { expiresIn: '7d' });

    console.log('Registration successful');
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user.id, email: user.email, apiKey: user.api_key }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET_SAFE, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, apiKey: user.api_key, plan: user.plan }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to verify JWT
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET_SAFE, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, api_key, plan, created_at')
      .eq('id', req.user.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;