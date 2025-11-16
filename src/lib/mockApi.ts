/* Lightweight mock API layer for local/demo use.
 * Activates when VITE_USE_MOCK === 'true' or window.BUGSPOT_USE_MOCK === true.
 * Intercepts fetch calls to '/api/*' and serves deterministic mock data.
 */

const shouldEnableMock = false; // Disabled to use real backend API

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface MockUser {
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
  api_key: string;
}

interface MockProject {
  id: number;
  name: string;
  api_key: string;
  domain: string;
  created_at: string;
}

function jsonResponse(data: unknown, init: Partial<ResponseInit> = {}) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

function unauthorized() {
  return jsonResponse({ error: 'Unauthorized' }, { status: 401 });
}

function getAuthHeader(init?: RequestInit) {
  const headers = new Headers(init?.headers || {});
  return headers.get('Authorization') || '';
}

function requireAuth(init?: RequestInit) {
  const auth = getAuthHeader(init);
  return auth.startsWith('Bearer ');
}

function getMockUser(): MockUser {
  // Persist a fake API key for consistency across reloads
  const key = localStorage.getItem('bugspot_mock_api_key') ||
    (() => {
      const k = 'mock_' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem('bugspot_mock_api_key', k);
      return k;
    })();
  return {
    email: 'demo@bugspot.dev',
    plan: 'pro',
    api_key: key,
  };
}

function getMockProjects(): MockProject[] {
  const user = getMockUser();
  return [
    {
      id: 1,
      name: 'Demo Project',
      api_key: user.api_key,
      domain: window.location.hostname,
      created_at: new Date().toISOString(),
    },
  ];
}

function getLocalBugReports() {
  // Use the same storage key as the dashboard local storage util
  const stored = localStorage.getItem('bug_reports');
  const parsed: any[] = stored ? JSON.parse(stored) : [];
  // Additionally include any reports saved by the widget fallback
  const widgetStored = localStorage.getItem('bugspot_widget_reports');
  const widgetParsed: any[] = widgetStored ? JSON.parse(widgetStored) : [];
  // Normalize recentReports shape used by dashboard
  const combined = [...parsed, ...widgetParsed].map((r) => ({
    id: r.id || String(r.timestamp || Date.now()),
    title: r.title,
    description: r.description,
    severity: r.severity || 'medium',
    status: r.status || 'open',
    created_at: r.timestamp || r.created_at || new Date().toISOString(),
  }));
  return combined;
}

function computeDashboard() {
  const recentReports = getLocalBugReports().sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const reportsByStatus: Record<string, number> = {};
  const reportsBySeverity: Record<string, number> = {};
  const byDay: Record<string, number> = {};

  for (const r of recentReports) {
    reportsByStatus[r.status] = (reportsByStatus[r.status] || 0) + 1;
    reportsBySeverity[r.severity] = (reportsBySeverity[r.severity] || 0) + 1;
    const day = new Date(r.created_at).toISOString().slice(0, 10);
    byDay[day] = (byDay[day] || 0) + 1;
  }

  const reportsOverTime = Object.entries(byDay)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, count]) => ({ date, count }));

  return {
    totalReports: recentReports.length,
    reportsByStatus,
    reportsBySeverity,
    reportsOverTime,
    recentReports,
  };
}

function match(path: string, method: HttpMethod, input: string | URL | Request, init?: RequestInit) {
  if (typeof input !== 'string') return false;
  if (!input.startsWith('/api')) return false;
  if (!input.startsWith(path)) return false;
  const reqMethod = (init?.method || 'GET').toUpperCase();
  return reqMethod === method;
}

function installMockFetch() {
  if (!(window as any)._bugspotMockInstalled) {
    (window as any)._bugspotMockInstalled = true;
  } else {
    return; // already installed
  }

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      // Auth: register/login
      if (match('/api/auth/register', 'POST', input as string, init)) {
        const body = init?.body ? JSON.parse(init.body as string) : {};
        if (!body?.email || !body?.password) {
          return jsonResponse({ error: 'Invalid input' }, { status: 400 });
        }
        return jsonResponse({ token: 'mock-token' });
      }

      if (match('/api/auth/login', 'POST', input as string, init)) {
        return jsonResponse({ token: 'mock-token' });
      }

      if (match('/api/auth/profile', 'GET', input as string, init)) {
        if (!requireAuth(init)) return unauthorized();
        return jsonResponse(getMockUser());
      }

      // Analytics: projects
      if (match('/api/analytics/projects', 'GET', input as string, init)) {
        if (!requireAuth(init)) return unauthorized();
        return jsonResponse(getMockProjects());
      }

      // Analytics: dashboard
      if ((typeof input === 'string') && input.startsWith('/api/analytics/dashboard')) {
        if (!requireAuth(init)) return unauthorized();
        return jsonResponse(computeDashboard());
      }

      // Pass-through for all other requests
      return originalFetch(input as any, init);
    } catch (err) {
      // On any unexpected error in mock handler, fall back to network
      return originalFetch(input as any, init);
    }
  };
}

if (shouldEnableMock && typeof window !== 'undefined') {
  installMockFetch();
}

export {};




