const AI_ANALYSIS_ENABLED = process.env.AI_ANALYSIS_ENABLED === 'true';

/**
 * Basic heuristic AI-like analysis for bug reports.
 * Designed so it can later be replaced with a real LLM call without changing callers.
 *
 * @param {Object} input
 * @param {string} input.title
 * @param {string} input.description
 * @param {string} input.severity
 * @param {Object} [input.environment]
 * @param {string[]} [input.steps]
 * @param {string[]} [input.tags]
 * @returns {Promise<{
 *   area: 'frontend' | 'backend' | 'fullstack',
 *   category: 'api' | 'auth' | 'ui' | 'performance' | 'other',
 *   estimatedHours: number,
 *   confidence: number,
 *   summary: string
 * }|null>}
 */
export async function analyzeBugReport(input) {
  if (!AI_ANALYSIS_ENABLED) {
    return null;
  }

  const { title, description, severity, environment, steps = [], tags = [] } = input;
  const text = `${title}\n${description}\n${steps.join('\n')}\n${tags.join(' ')}`.toLowerCase();

  const contains = (needle) => text.includes(needle);

  let category = 'other';
  if (contains('auth') || contains('login') || contains('signup') || contains('password')) {
    category = 'auth';
  } else if (contains('api') || contains('request') || contains('fetch') || contains('network') || contains('graphql')) {
    category = 'api';
  } else if (contains('layout') || contains('css') || contains('style') || contains('responsive') || contains('ux')) {
    category = 'ui';
  } else if (contains('slow') || contains('timeout') || contains('performance') || contains('lag')) {
    category = 'performance';
  }

  let area = 'frontend';
  if (contains('500') || contains('internal server error') || contains('database') || contains('db')) {
    area = 'backend';
  } else if (contains('api') || contains('network') || contains('server')) {
    area = 'fullstack';
  }

  const severityLower = String(severity || 'medium').toLowerCase();
  let estimatedHours = 2;
  switch (severityLower) {
    case 'low':
      estimatedHours = 1;
      break;
    case 'medium':
      estimatedHours = 2;
      break;
    case 'high':
      estimatedHours = 4;
      break;
    case 'critical':
      estimatedHours = 8;
      break;
    default:
      estimatedHours = 2;
  }

  let confidence = 0.6;
  if (category !== 'other') {
    confidence += 0.15;
  }
  if (area === 'fullstack') {
    confidence -= 0.05;
  }
  confidence = Math.min(0.95, Math.max(0.5, confidence));

  const browser = environment?.browser || environment?.userAgent || 'unknown';
  const os = environment?.os || 'unknown';

  const summaryParts = [
    `${severityLower.toUpperCase()} issue likely in ${area}`,
    `category: ${category}`,
    `env: ${browser} on ${os}`,
  ];

  return {
    area,
    category,
    estimatedHours,
    confidence,
    summary: summaryParts.join(' | '),
  };
}


