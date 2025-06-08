import express from 'express';
import { runQuery, getQuery, allQuery } from '../database/init.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Middleware to verify API key for widget submissions
async function verifyApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  try {
    const project = await getQuery('SELECT * FROM projects WHERE api_key = ?', [apiKey]);
    if (!project) {
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

    const result = await runQuery(`
      INSERT INTO bug_reports (
        project_id, title, description, severity, screenshot,
        environment, user_email, user_agent, url, steps, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.project.id,
      title,
      description,
      severity,
      screenshot,
      JSON.stringify(environment),
      userEmail,
      userAgent,
      url,
      JSON.stringify(steps || []),
      JSON.stringify(tags || [])
    ]);

    // Track analytics
    await runQuery(
      'INSERT INTO analytics (project_id, event_type, event_data) VALUES (?, ?, ?)',
      [req.project.id, 'bug_report_submitted', JSON.stringify({ severity, hasScreenshot: !!screenshot })]
    );

    res.status(201).json({
      message: 'Bug report submitted successfully',
      id: result.id
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

    let sql = `
      SELECT br.*, p.name as project_name 
      FROM bug_reports br 
      JOIN projects p ON br.project_id = p.id 
      WHERE p.user_id = ?
    `;
    const params = [req.user.userId];

    if (projectId) {
      sql += ' AND br.project_id = ?';
      params.push(projectId);
    }

    if (status) {
      sql += ' AND br.status = ?';
      params.push(status);
    }

    if (severity) {
      sql += ' AND br.severity = ?';
      params.push(severity);
    }

    sql += ' ORDER BY br.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const reports = await allQuery(sql, params);

    // Parse JSON fields
    const formattedReports = reports.map(report => ({
      ...report,
      environment: report.environment ? JSON.parse(report.environment) : null,
      steps: report.steps ? JSON.parse(report.steps) : [],
      tags: report.tags ? JSON.parse(report.tags) : []
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
    const report = await getQuery(`
      SELECT br.* FROM bug_reports br 
      JOIN projects p ON br.project_id = p.id 
      WHERE br.id = ? AND p.user_id = ?
    `, [id, req.user.userId]);

    if (!report) {
      return res.status(404).json({ error: 'Bug report not found' });
    }

    await runQuery(
      'UPDATE bug_reports SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

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
    const report = await getQuery(`
      SELECT br.* FROM bug_reports br 
      JOIN projects p ON br.project_id = p.id 
      WHERE br.id = ? AND p.user_id = ?
    `, [id, req.user.userId]);

    if (!report) {
      return res.status(404).json({ error: 'Bug report not found' });
    }

    await runQuery('DELETE FROM bug_reports WHERE id = ?', [id]);

    res.json({ message: 'Bug report deleted successfully' });
  } catch (error) {
    console.error('Delete bug report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;