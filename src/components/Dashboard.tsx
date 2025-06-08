import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Bug, TrendingUp, Calendar, 
  Filter, Download, RefreshCw, Settings, Plus,
  AlertTriangle, CheckCircle, Clock, XCircle
} from 'lucide-react';

interface DashboardData {
  totalReports: number;
  reportsByStatus: Record<string, number>;
  reportsBySeverity: Record<string, number>;
  reportsOverTime: Array<{ date: string; count: number }>;
  recentReports: Array<any>;
}

interface Project {
  id: number;
  name: string;
  api_key: string;
  domain: string;
  created_at: string;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUserData();
    loadProjects();
    loadDashboardData();
  }, [selectedProject]);

  const loadUserData = async () => {
    const token = localStorage.getItem('bugspot_token');
    if (!token) return;

    try {
      const response = await fetch('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const loadProjects = async () => {
    const token = localStorage.getItem('bugspot_token');
    if (!token) return;

    try {
      const response = await fetch('/api/analytics/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const projectsData = await response.json();
        setProjects(projectsData);
        if (projectsData.length > 0 && !selectedProject) {
          setSelectedProject(projectsData[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadDashboardData = async () => {
    const token = localStorage.getItem('bugspot_token');
    if (!token) return;

    setLoading(true);
    try {
      const url = selectedProject 
        ? `/api/analytics/dashboard?projectId=${selectedProject}`
        : '/api/analytics/dashboard';
        
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWidgetCode = (project: Project) => {
    const domain = window.location.origin;
    return `<!-- Add this to your website -->
<script src="${domain}/widget.js"></script>
<script>
  BugSpot.init({
    apiKey: '${project.api_key}',
    apiUrl: '${domain}',
    position: 'bottom-right',
    primaryColor: '#3B82F6'
  });
</script>`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statusIcons = {
    open: XCircle,
    'in-progress': Clock,
    resolved: CheckCircle,
    closed: XCircle,
  };

  const statusColors = {
    open: 'text-red-600 bg-red-50',
    'in-progress': 'text-yellow-600 bg-yellow-50',
    resolved: 'text-green-600 bg-green-50',
    closed: 'text-gray-600 bg-gray-50',
  };

  const severityColors = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-orange-600',
    critical: 'text-red-600',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">BugSpot Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor and manage bug reports</p>
            </div>
            <div className="flex items-center gap-4">
              {projects.length > 0 && (
                <select
                  value={selectedProject || ''}
                  onChange={(e) => setSelectedProject(Number(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Projects</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={loadDashboardData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Reports</p>
                  <p className="text-3xl font-bold text-gray-900">{data.totalReports}</p>
                </div>
                <Bug className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Open</p>
                  <p className="text-3xl font-bold text-red-900">{data.reportsByStatus.open || 0}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">In Progress</p>
                  <p className="text-3xl font-bold text-yellow-900">{data.reportsByStatus['in-progress'] || 0}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Resolved</p>
                  <p className="text-3xl font-bold text-green-900">{data.reportsByStatus.resolved || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Reports */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
            </div>
            <div className="p-6">
              {data?.recentReports.length ? (
                <div className="space-y-4">
                  {data.recentReports.slice(0, 5).map((report) => (
                    <div key={report.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{report.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{report.description.substring(0, 100)}...</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{new Date(report.created_at).toLocaleDateString()}</span>
                          <span className={`px-2 py-1 rounded-full ${severityColors[report.severity as keyof typeof severityColors]}`}>
                            {report.severity}
                          </span>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[report.status as keyof typeof statusColors]}`}>
                        {report.status}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bug className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No bug reports yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Integration Guide */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Quick Integration</h3>
            </div>
            <div className="p-6">
              {projects.length > 0 ? (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Add this code to your website to enable bug reporting:
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    <pre>{getWidgetCode(projects[0])}</pre>
                  </div>
                  <button
                    onClick={() => copyToClipboard(getWidgetCode(projects[0]))}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Copy Code
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No projects found</p>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto">
                    <Plus className="w-4 h-4" />
                    Create Project
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="font-medium capitalize">{user.plan}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">API Key</p>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">{user.api_key}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}