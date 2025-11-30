import React, { useState, useEffect } from 'react';
import { Bug, LogOut, LayoutDashboard, User, Wrench } from 'lucide-react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import BugsPage from './pages/BugsPage';
import ProfilePage from './pages/ProfilePage';
import IntegrationPage from './pages/IntegrationPage';
import { navigate, useHashPath } from './router';
import BugReportWidget from './components/BugReportWidget';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bugspot_token');
    if (token) {
      // Verify token with backend
      fetch('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('bugspot_token');
        }
      })
      .catch(() => {
        localStorage.removeItem('bugspot_token');
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (token: string) => {
    // Reference token to satisfy linter and allow future use
    void token;
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('bugspot_token');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Bug className="w-7 h-7 text-white" />
          </div>
          <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading BugSpot...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Bug className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">BugSpot</h1>
            </div>
            <div className="flex items-center gap-1">
              <NavLink label="Dashboard" icon={<LayoutDashboard className="w-4 h-4" />} to="/" />
              <NavLink label="Bugs" icon={<Wrench className="w-4 h-4" />} to="/bugs" />
              <NavLink label="Integration" icon={<Bug className="w-4 h-4" />} to="/integration" />
              <NavLink label="Profile" icon={<User className="w-4 h-4" />} to="/profile" />
              <button
                onClick={handleLogout}
                className="ml-2 flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AppRoutes />
      {/* Global demo widget mount */}
      <BugReportWidget />
    </div>
  );
}

export default App;

function NavLink({ label, icon, to }: { label: string; icon: React.ReactNode; to: string }) {
  const path = useHashPath();
  const isActive = (to === '/' ? path === '/' : path.startsWith(to));
  return (
    <button
      onClick={() => navigate(to)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function AppRoutes() {
  const path = useHashPath();
  if (path === '/') return <Dashboard />;
  if (path.startsWith('/bugs')) return <BugsPage />;
  if (path.startsWith('/integration')) return <IntegrationPage />;
  if (path.startsWith('/profile')) return <ProfilePage />;
  return <Dashboard />;
}