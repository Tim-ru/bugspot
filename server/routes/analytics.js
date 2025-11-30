import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const { projectId, days = 30 } = req.query;

    // Validate user ID
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // First, get user's project IDs
    let projectsQuery = supabase
      .from('projects')
      .select('id')
      .eq('user_id', req.user.userId);

    const { data: userProjects, error: projectsError } = await projectsQuery;

    if (projectsError) {
      console.error('Error fetching user projects:', projectsError);
      throw projectsError;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('User projects:', userProjects);
      console.log('Requested projectId:', projectId);
    }

    if (!userProjects || userProjects.length === 0) {
      return res.json({
        totalReports: 0,
        reportsByStatus: {},
        reportsBySeverity: {},
        reportsOverTime: [],
        recentReports: []
      });
    }

    // projectId is UUID string, not a number
    const projectIds = projectId 
      ? userProjects.filter(p => String(p.id) === String(projectId)).map(p => p.id)
      : userProjects.map(p => p.id);

    if (process.env.NODE_ENV === 'development') {
      console.log('Filtered projectIds:', projectIds);
    }

    if (projectId && projectIds.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Project not found for user:', { projectId, userProjects });
      }
      return res.status(404).json({ error: 'Project not found' });
    }

    // If no valid project IDs, return empty data
    if (!projectIds || projectIds.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('No project IDs found, returning empty data');
      }
      return res.json({
        totalReports: 0,
        reportsByStatus: {},
        reportsBySeverity: {},
        reportsOverTime: [],
        recentReports: []
      });
    }

    // Get total reports
    let totalQuery = supabase
      .from('bug_reports')
      .select('*', { count: 'exact', head: true })
      .in('project_id', projectIds);

    const { count: totalReports, error: totalError } = await totalQuery;

    if (totalError) {
      console.error('Error getting total reports:', totalError);
      throw totalError;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Total reports count:', totalReports);
    }

    // Get reports by status - use RPC if available, otherwise fallback to direct query
    let statusData = null;
    let statusError = null;
    
    try {
      const rpcResult = await supabase
        .rpc('get_reports_by_status', { 
          user_id: req.user.userId, 
          project_id: projectId || null 
        });
      statusData = rpcResult.data;
      statusError = rpcResult.error;
    } catch (err) {
      // Fallback: direct query if RPC fails
      const { data: reports, error } = await supabase
        .from('bug_reports')
        .select('status')
        .in('project_id', projectIds);
      
      if (error) {
        statusError = error;
      } else {
        const statusCounts = {};
        reports.forEach(r => {
          statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
        });
        statusData = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
      }
    }

    if (statusError) {
      console.warn('Error getting reports by status:', statusError);
      statusData = [];
    }

    // Get reports by severity - use RPC if available, otherwise fallback
    let severityData = null;
    let severityError = null;

    try {
      const rpcResult = await supabase
        .rpc('get_reports_by_severity', { 
          user_id: req.user.userId, 
          project_id: projectId || null 
        });
      severityData = rpcResult.data;
      severityError = rpcResult.error;
    } catch (err) {
      // Fallback: direct query if RPC fails
      const { data: reports, error } = await supabase
        .from('bug_reports')
        .select('severity')
        .in('project_id', projectIds);
      
      if (error) {
        severityError = error;
      } else {
        const severityCounts = {};
        reports.forEach(r => {
          severityCounts[r.severity] = (severityCounts[r.severity] || 0) + 1;
        });
        severityData = Object.entries(severityCounts).map(([severity, count]) => ({ severity, count }));
      }
    }

    if (severityError) {
      console.warn('Error getting reports by severity:', severityError);
      severityData = [];
    }

    // Get reports over time - use RPC if available, otherwise fallback
    let timeData = null;
    let timeError = null;

    try {
      const rpcResult = await supabase
        .rpc('get_reports_over_time', { 
          user_id: req.user.userId, 
          project_id: projectId || null,
          days_back: parseInt(days) || 30
        });
      timeData = rpcResult.data;
      timeError = rpcResult.error;
    } catch (err) {
      // Fallback: direct query if RPC fails
      const daysBack = parseInt(days) || 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysBack);

      const { data: reports, error } = await supabase
        .from('bug_reports')
        .select('created_at')
        .in('project_id', projectIds)
        .gte('created_at', cutoffDate.toISOString());

      if (error) {
        timeError = error;
      } else {
        const dateCounts = {};
        reports.forEach(r => {
          const date = new Date(r.created_at).toISOString().split('T')[0];
          dateCounts[date] = (dateCounts[date] || 0) + 1;
        });
        timeData = Object.entries(dateCounts)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date));
      }
    }

    if (timeError) {
      console.warn('Error getting reports over time:', timeError);
      timeData = [];
    }

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

    // Format status and severity data
    const reportsByStatus = {};
    if (statusData && Array.isArray(statusData)) {
      statusData.forEach(item => {
        reportsByStatus[item.status] = Number(item.count);
      });
    }

    const reportsBySeverity = {};
    if (severityData && Array.isArray(severityData)) {
      severityData.forEach(item => {
        reportsBySeverity[item.severity] = Number(item.count);
      });
    }

    res.json({
      totalReports: totalReports || 0,
      reportsByStatus,
      reportsBySeverity,
      reportsOverTime: timeData || [],
      recentReports: recentReports?.map(report => ({
        ...report,
        project_name: report.projects?.name
      })) || []
    });
  } catch (error) {
    console.error('Analytics error:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        userId: req.user?.userId
      });
    }
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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

// Create project
router.post('/projects', authenticateToken, async (req, res) => {
  try {
    const { name, domain } = req.body;

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({ error: 'Project name must be less than 100 characters' });
    }

    // Generate unique API key for the project
    const projectApiKey = uuidv4();

    // Create project in Supabase
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: req.user.userId,
        name: name.trim(),
        domain: domain ? domain.trim() : null,
        api_key: projectApiKey
      })
      .select()
      .single();

    if (error) {
      console.error('Create project error:', error);
      // Check for unique constraint violation
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Project with this name already exists' });
      }
      throw error;
    }

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;