import { BugReport } from '../types';
import { collectEnvironmentData } from '../utils/environmentData';

function isMockEnabled(): boolean {
  // Support both Vite env and a runtime toggle for safety
  const viteFlag = (import.meta as any)?.env?.VITE_USE_MOCK === 'true';
  const runtimeFlag = (globalThis as any)?.BUGSPOT_USE_MOCK === true;
  return Boolean(viteFlag || runtimeFlag);
}

export default function seedMockReports(): void {
  if (typeof window === 'undefined') return;
  if (!isMockEnabled()) return;

  try {
    const key = 'bug_reports';
    const existingRaw = localStorage.getItem(key);
    if (existingRaw) {
      const existingParsed = JSON.parse(existingRaw);
      if (Array.isArray(existingParsed) && existingParsed.length > 0) return; // already seeded/has data
    }

    const env = collectEnvironmentData();

    const now = new Date();
    const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

    const seed: BugReport[] = [
      {
        id: 'seed-001',
        title: 'UI breaks on mobile navbar',
        description: 'Navigation items overflow on small screens when opening the menu.',
        severity: 'high',
        status: 'open',
        environment: env,
        timestamp: daysAgo(1),
        userEmail: 'qa@example.com',
        tags: ['ui', 'mobile', 'navigation'],
        steps: ['Open homepage', 'Resize to mobile', 'Tap menu icon']
      },
      {
        id: 'seed-002',
        title: 'Form validation allows empty email',
        description: 'Submitting the signup form with an empty email does not show an error.',
        severity: 'medium',
        status: 'in-progress',
        environment: env,
        timestamp: daysAgo(2),
        userEmail: 'tester@bugspot.dev',
        tags: ['validation', 'signup'],
        steps: ['Open signup', 'Leave email empty', 'Click submit']
      },
      {
        id: 'seed-003',
        title: 'Intermittent 500 on dashboard load',
        description: 'Occasional server error when loading analytics for the last 30 days.',
        severity: 'critical',
        status: 'open',
        environment: env,
        timestamp: daysAgo(3),
        tags: ['backend', 'analytics', '500'],
        steps: ['Login', 'Open dashboard', 'Observe network errors']
      },
      {
        id: 'seed-004',
        title: 'Tooltip overlaps button text',
        description: 'Hover tooltip overlaps with call-to-action button label on Firefox.',
        severity: 'low',
        status: 'resolved',
        environment: env,
        timestamp: daysAgo(5),
        tags: ['ux', 'tooltip'],
        steps: ['Go to settings', 'Hover the info icon']
      },
      {
        id: 'seed-005',
        title: 'Slow loading of project list',
        description: 'Projects API takes >2s to respond leading to spinner for too long.',
        severity: 'medium',
        status: 'closed',
        environment: env,
        timestamp: daysAgo(8),
        tags: ['performance'],
        steps: ['Login', 'Navigate to Projects']
      }
    ];

    localStorage.setItem(key, JSON.stringify(seed));
  } catch {
    // ignore
  }
}


