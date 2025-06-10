import express from 'express';
import { supabase } from '../lib/supabase.js';
import { authenticateToken } from './auth.js';

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

// Submit bug report (from widget)
router.post('/submit', verifyApiKey, async (req, res) => {
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

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const { data: report, error: reportError } = await supabase
      .from('bug_reports')
      .insert({
        project_id: req.project.id,
        title: title.trim(),
        description: description.trim(),
        severity,
        screenshot,
        environment,
        user_email: userEmail?.trim() || null,
        user_agent: userAgent,
        url,
        steps: steps || [],
        tags: tags || []
      })
      .select()
      .single();

    if (reportError) {
      throw reportError;
    }

    // Track analytics
    await supabase
      .from('analytics')
      .insert({
        project_id: req.project.id,
        event_type: 'bug_report_submitted',
        event_data: { severity, hasScreenshot: !!screenshot }
      });

    res.status(201).json({
      message: 'Bug report submitted successfully',
      id: report.id
    });
  } catch (error) {
    console.error('Bug report submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
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

    // Format the response
    const formattedReports = reports.map(report => ({
      ...report,
      project_name: report.projects.name
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