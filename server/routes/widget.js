import express from 'express';
import { supabase } from '../lib/supabase.js';

const router = express.Router();

// Get widget configuration
router.get('/config/:apiKey', async (req, res) => {
  try {
    const { apiKey } = req.params;

    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('api_key', apiKey)
      .single();
    
    if (error || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const settings = project.settings || {};

    res.json({
      projectId: project.id,
      projectName: project.name,
      settings: {
        position: 'bottom-right',
        primaryColor: '#3B82F6',
        enableScreenshot: true,
        showPreview: true,
        ...settings
      }
    });
  } catch (error) {
    console.error('Widget config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;