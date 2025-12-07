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

    // Normalize email for consistent storage and lookup
    const normalizedEmail = email.toLowerCase().trim();

    console.log('Checking if user exists...');
    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
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
        email: normalizedEmail,
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

    // Normalize email for consistent lookup
    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
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

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Normalize email for consistent lookup
    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', normalizedEmail)
      .single();

    // Always return success to prevent email enumeration
    if (userError || !user) {
      console.log('Password reset requested for non-existent email:', email);
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    // Generate reset token (random 32-byte hex string)
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash the token for storage (we send unhashed to user, store hashed)
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Set expiration to 1 hour from now
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Invalidate any existing tokens for this user
    await supabase
      .from('password_reset_tokens')
      .delete()
      .eq('user_id', user.id);

    // Store new reset token
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        token: hashedToken,
        expires_at: expiresAt,
        used: false
      });

    if (tokenError) {
      console.error('Error storing reset token:', tokenError);
      throw tokenError;
    }

    // In production, send email with reset link
    // For MVP, we log the token (replace with email service later)
    const resetUrl = `${process.env.APP_URL || 'http://localhost:5173'}/#/reset-password?token=${resetToken}`;
    
    console.log('='.repeat(60));
    console.log('PASSWORD RESET REQUEST');
    console.log('Email:', user.email);
    console.log('Reset URL:', resetUrl);
    console.log('Token expires:', expiresAt);
    console.log('='.repeat(60));

    // TODO: Integrate email service (Resend, SendGrid, etc.)
    // await sendPasswordResetEmail(user.email, resetUrl);

    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.',
      // Only include in development for testing
      ...(process.env.NODE_ENV !== 'production' && { 
        _dev_reset_url: resetUrl,
        _dev_note: 'This field is only shown in development mode' 
      })
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Hash the provided token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find valid token
    const { data: resetToken, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('id, user_id, expires_at, used')
      .eq('token', hashedToken)
      .single();

    if (tokenError || !resetToken) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Check if token is expired
    if (new Date(resetToken.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    // Check if token was already used
    if (resetToken.used) {
      return res.status(400).json({ error: 'Reset token has already been used' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user password
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', resetToken.user_id);

    if (updateError) {
      console.error('Error updating password:', updateError);
      throw updateError;
    }

    // Mark token as used
    const { error: markUsedError } = await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('id', resetToken.id);

    if (markUsedError) {
      // Log error but don't fail the request - password was already changed
      // This is a security concern, so we log it for monitoring
      console.error('SECURITY WARNING: Failed to mark reset token as used:', markUsedError);
      console.error('Token ID:', resetToken.id, 'User ID:', resetToken.user_id);
    }

    console.log('Password reset successful for user:', resetToken.user_id);

    res.json({ message: 'Password has been reset successfully. You can now log in with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;