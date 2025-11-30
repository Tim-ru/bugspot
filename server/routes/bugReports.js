import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase.js';
import { authenticateToken, getJwtSecret } from './auth.js';
import { analyzeBugReport } from '../lib/aiClient.js';

const router = express.Router();

// Middleware to verify API key for widget submissions
async function verifyApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  try {
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('api_key', apiKey)
      .single();

    if (error || !project) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    req.project = project;
    next();
  } catch (error) {
    console.error('API key verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Combined middleware: supports both API key (widget) and JWT token (dashboard)
async function verifyApiKeyOrToken(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Try API key first (for widget submissions)
  if (apiKey) {
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('api_key', apiKey)
        .single();

      if (error || !project) {
        return res.status(401).json({ error: 'Invalid API key' });
      }

      req.project = project;
      return next();
    } catch (error) {
      console.error('API key verification error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Try JWT token (for dashboard submissions)
  if (token) {
    try {
      // Use the same JWT secret as auth.js
      const JWT_SECRET_SAFE = getJwtSecret();
      
      const decoded = jwt.verify(token, JWT_SECRET_SAFE);
      const userId = decoded.userId;

      // Get user's first project (or default project)
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        return res.status(500).json({ error: 'Failed to fetch projects' });
      }

      // If no project exists, create a default one
      if (!projects || projects.length === 0) {
        console.log('No project found for user, creating default project...');
        const projectApiKey = uuidv4();
        
        const { data: newProject, error: createError } = await supabase
          .from('projects')
          .insert({
            user_id: userId,
            name: 'Default Project',
            api_key: projectApiKey
          })
          .select()
          .single();

        if (createError || !newProject) {
          console.error('Error creating default project:', createError);
          return res.status(500).json({ error: 'Failed to create default project' });
        }

        req.project = newProject;
        return next();
      }

      req.project = projects[0];
      return next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
      console.error('Token verification error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Neither API key nor token provided
  return res.status(401).json({ error: 'API key or authorization token required' });
}

// Submit bug report (from widget or dashboard)
router.post('/submit', verifyApiKeyOrToken, async (req, res) => {
  try {
    const {
      title,
      description,
      severity = 'medium',
      screenshot,
      environment,
      userEmail,
      userAgent,
      url,
      steps,
      tags
    } = req.body;

    // Валидация входных данных
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ error: 'Description is required and must be a non-empty string' });
    }

    // Валидация severity
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (severity && !validSeverities.includes(severity)) {
      return res.status(400).json({ error: `Severity must be one of: ${validSeverities.join(', ')}` });
    }

    // Валидация длины полей
    if (title.trim().length > 500) {
      return res.status(400).json({ error: 'Title must be less than 500 characters' });
    }

    if (description.trim().length > 10000) {
      return res.status(400).json({ error: 'Description must be less than 10000 characters' });
    }

    // Валидация email если предоставлен
    if (userEmail && typeof userEmail === 'string' && userEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userEmail.trim())) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    // Валидация screenshot размера (если base64)
    if (screenshot && typeof screenshot === 'string') {
      // Примерная проверка размера base64 (1MB limit)
      const base64Size = (screenshot.length * 3) / 4;
      if (base64Size > 1024 * 1024) {
        return res.status(400).json({ error: 'Screenshot size exceeds 1MB limit' });
      }
    }

    const { data: report, error: reportError } = await supabase
      .from('bug_reports')
      .insert({
        project_id: req.project.id,
        title: title.trim(),
        description: description.trim(),
        severity,
        screenshot: screenshot || null,
        environment: environment || {},
        user_email: userEmail?.trim() || null,
        user_agent: userAgent || null,
        url: url || null,
        steps: Array.isArray(steps) ? steps : [],
        tags: Array.isArray(tags) ? tags : []
      })
      .select()
      .single();

    if (reportError) {
      console.error('Database error creating bug report:', reportError);
      
      // Более детальные сообщения об ошибках
      if (reportError.code === '23505') { // Unique violation
        return res.status(409).json({ error: 'Bug report already exists' });
      }
      if (reportError.code === '23503') { // Foreign key violation
        return res.status(400).json({ error: 'Invalid project ID' });
      }
      
      throw reportError;
    }

    // Track analytics (не блокируем при ошибке)
    try {
      await supabase
        .from('analytics')
        .insert({
          project_id: req.project.id,
          event_type: 'bug_report_submitted',
          event_data: { severity, hasScreenshot: !!screenshot }
        });
    } catch (analyticsError) {
      console.warn('Analytics tracking failed (non-critical):', analyticsError);
      // Не прерываем выполнение при ошибке аналитики
    }

    // Trigger AI analysis in the background (best-effort, non-blocking)
    try {
      const aiPayload = {
        title,
        description,
        severity,
        environment,
        steps: steps || [],
        tags: tags || []
      };

      // Fire and forget – we don't want to delay the user response
      Promise.resolve()
        .then(() => analyzeBugReport(aiPayload))
        .then(async (analysis) => {
          if (!analysis) return;
          await supabase
            .from('bug_reports')
            .update({
              ai_analysis: analysis,
              updated_at: new Date().toISOString()
            })
            .eq('id', report.id)
            .select()
            .single();
        })
        .catch((err) => {
          console.error('AI analysis error (non-critical):', err);
        });
    } catch (err) {
      console.error('AI analysis scheduling error (non-critical):', err);
    }

    res.status(201).json({
      message: 'Bug report submitted successfully',
      id: report.id
    });
  } catch (error) {
    console.error('Bug report submission error:', error);
    
    // Более информативные сообщения об ошибках
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'Database connection failed. Please try again later.' });
    }
    
    res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }
});

// Get bug reports (authenticated)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { projectId, status, severity, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('bug_reports')
      .select(`
        *,
        projects!inner(name, user_id)
      `)
      .eq('projects.user_id', req.user.userId);

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (severity) {
      query = query.eq('severity', severity);
    }

    const { data: reports, error } = await query
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      throw error;
    }

    // Format the response, including AI analysis if available
    const formattedReports = reports.map(report => ({
      ...report,
      project_name: report.projects.name,
      aiAnalysis: report.ai_analysis || null
    }));

    res.json(formattedReports);
  } catch (error) {
    console.error('Get bug reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update bug report status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['open', 'in-progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Verify ownership
    const { data: report, error: fetchError } = await supabase
      .from('bug_reports')
      .select(`
        *,
        projects!inner(user_id)
      `)
      .eq('id', id)
      .eq('projects.user_id', req.user.userId)
      .single();

    if (fetchError || !report) {
      return res.status(404).json({ error: 'Bug report not found' });
    }

    const { error: updateError } = await supabase
      .from('bug_reports')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      throw updateError;
    }

    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete bug report
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const { data: report, error: fetchError } = await supabase
      .from('bug_reports')
      .select(`
        *,
        projects!inner(user_id)
      `)
      .eq('id', id)
      .eq('projects.user_id', req.user.userId)
      .single();

    if (fetchError || !report) {
      return res.status(404).json({ error: 'Bug report not found' });
    }

    const { error: deleteError } = await supabase
      .from('bug_reports')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    res.json({ message: 'Bug report deleted successfully' });
  } catch (error) {
    console.error('Delete bug report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;