import express from 'express';
import { getQuery } from '../database/init.js';

const router = express.Router();

// Get widget configuration
router.get('/config/:apiKey', async (req, res) => {
  try {
    const { apiKey } = req.params;

    const project = await getQuery('SELECT * FROM projects WHERE api_key = ?', [apiKey]);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const settings = project.settings ? JSON.parse(project.settings) : {};

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