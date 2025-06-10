import express from 'express';
import { supabase } from '../lib/supabase.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const { projectId, days = 30 } = req.query;

    // Base query for user's projects
    let projectFilter = '';
    if (projectId) {
      projectFilter = `AND project_id = '${projectId}'`;
    }

    // Get total reports
    const { count: totalReports, error: totalError } = await supabase
      .from('bug_reports')
      .select('*', { count: 'exact', head: true })
      .in('project_id', 
        supabase
          .from('projects')
          .select('id')
          .eq('user_id', req.user.userId)
      );

    if (totalError) throw totalError;

    // Get reports by status
    const { data: statusData, error: statusError } = await supabase
      .rpc('get_reports_by_status', { user_id: req.user.userId, project_id: projectId });

    if (statusError) throw statusError;

    // Get reports by severity
    const { data: severityData, error: severityError } = await supabase
      .rpc('get_reports_by_severity', { user_id: req.user.userId, project_id: projectId });

    if (severityError) throw severityError;

    // Get reports over time
    const { data: timeData, error: timeError } = await supabase
      .rpc('get_reports_over_time', { 
        user_id: req.user.userId, 
        project_id: projectId,
        days_back: parseInt(days)
      });

    if (timeError) throw timeError;

    // Get recent reports
    let recentQuery = supabase
      .from('bug_reports')
      .select(`
        *,
        projects!inner(name, user_id)
      `)
      .eq('projects.user_id', req.user.userId);

    if (projectId) {
      recentQuery = recentQuery.eq('project_id', projectId);
    }

    const { data: recentReports, error: recentError } = await recentQuery
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentError) throw recentError;

    res.json({
      totalReports: totalReports || 0,
      reportsByStatus: statusData?.reduce((acc, item) => {
        acc[item.status] = item.count;
        return acc;
      }, {}) || {},
      reportsBySeverity: severityData?.reduce((acc, item) => {
        acc[item.severity] = item.count;
        return acc;
      }, {}) || {},
      reportsOverTime: timeData || [],
      recentReports: recentReports?.map(report => ({
        ...report,
        project_name: report.projects.name
      })) || []
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get projects
router.get('/projects', authenticateToken, async (req, res) => {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;