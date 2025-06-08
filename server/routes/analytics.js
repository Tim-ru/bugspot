import express from 'express';
import { allQuery, getQuery } from '../database/init.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const { projectId, days = 30 } = req.query;

    let projectFilter = '';
    let params = [req.user.userId];

    if (projectId) {
      projectFilter = 'AND p.id = ?';
      params.push(projectId);
    }

    // Total reports
    const totalReports = await getQuery(`
      SELECT COUNT(*) as count 
      FROM bug_reports br 
      JOIN projects p ON br.project_id = p.id 
      WHERE p.user_id = ? ${projectFilter}
    `, params);

    // Reports by status
    const reportsByStatus = await allQuery(`
      SELECT br.status, COUNT(*) as count 
      FROM bug_reports br 
      JOIN projects p ON br.project_id = p.id 
      WHERE p.user_id = ? ${projectFilter}
      GROUP BY br.status
    `, params);

    // Reports by severity
    const reportsBySeverity = await allQuery(`
      SELECT br.severity, COUNT(*) as count 
      FROM bug_reports br 
      JOIN projects p ON br.project_id = p.id 
      WHERE p.user_id = ? ${projectFilter}
      GROUP BY br.severity
    `, params);

    // Reports over time (last 30 days)
    const reportsOverTime = await allQuery(`
      SELECT 
        DATE(br.created_at) as date,
        COUNT(*) as count
      FROM bug_reports br 
      JOIN projects p ON br.project_id = p.id 
      WHERE p.user_id = ? ${projectFilter}
        AND br.created_at >= datetime('now', '-${days} days')
      GROUP BY DATE(br.created_at)
      ORDER BY date
    `, params);

    // Recent reports
    const recentReports = await allQuery(`
      SELECT br.*, p.name as project_name
      FROM bug_reports br 
      JOIN projects p ON br.project_id = p.id 
      WHERE p.user_id = ? ${projectFilter}
      ORDER BY br.created_at DESC 
      LIMIT 10
    `, params);

    res.json({
      totalReports: totalReports.count,
      reportsByStatus: reportsByStatus.reduce((acc, item) => {
        acc[item.status] = item.count;
        return acc;
      }, {}),
      reportsBySeverity: reportsBySeverity.reduce((acc, item) => {
        acc[item.severity] = item.count;
        return acc;
      }, {}),
      reportsOverTime,
      recentReports: recentReports.map(report => ({
        ...report,
        environment: report.environment ? JSON.parse(report.environment) : null,
        steps: report.steps ? JSON.parse(report.steps) : [],
        tags: report.tags ? JSON.parse(report.tags) : []
      }))
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get projects
router.get('/projects', authenticateToken, async (req, res) => {
  try {
    const projects = await allQuery(
      'SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.userId]
    );

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;