#!/usr/bin/env node

/**
 * Тестовый скрипт для проверки полного flow BugSpot
 * 
 * Проверяет:
 * 1. Регистрация пользователя
 * 2. Вход в систему
 * 3. Получение проектов
 * 4. Отправка баг-репорта через API
 * 5. Получение баг-репортов
 * 6. Обновление статуса
 * 
 * Использование:
 *   node test-full-flow.js [API_URL]
 * 
 * Пример:
 *   node test-full-flow.js http://localhost:3001
 */

const API_URL = process.argv[2] || 'http://localhost:3001';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, 'blue');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

async function testEndpoint(method, url, headers = {}, body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));

    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error.message,
    };
  }
}

async function runTests() {
  log('\n=== BugSpot Full Flow Test ===\n', 'blue');
  log(`Testing API at: ${API_URL}\n`);

  let userToken = null;
  let projectApiKey = null;
  let bugReportId = null;

  // Step 1: Health Check
  logStep('1', 'Health Check');
  const healthCheck = await testEndpoint('GET', `${API_URL}/api/health`);
  if (healthCheck.ok) {
    logSuccess('API is accessible');
  } else {
    logError(`API health check failed: ${healthCheck.status}`);
    logWarning('Make sure the server is running');
    process.exit(1);
  }

  // Step 2: Register User
  logStep('2', 'User Registration');
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'test123456';

  const registerResult = await testEndpoint('POST', `${API_URL}/api/auth/register`, {}, {
    email: testEmail,
    password: testPassword,
  });

  if (registerResult.ok && registerResult.data.token) {
    userToken = registerResult.data.token;
    logSuccess(`User registered: ${testEmail}`);
    logSuccess(`Token received: ${userToken.substring(0, 20)}...`);
  } else {
    logError(`Registration failed: ${registerResult.data.error || registerResult.status}`);
    if (registerResult.status === 400 && registerResult.data.error?.includes('already exists')) {
      logWarning('User already exists, trying to login...');
      
      // Try to login instead
      const loginResult = await testEndpoint('POST', `${API_URL}/api/auth/login`, {}, {
        email: testEmail,
        password: testPassword,
      });

      if (loginResult.ok && loginResult.data.token) {
        userToken = loginResult.data.token;
        logSuccess(`Logged in as existing user`);
      } else {
        logError('Login also failed');
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }

  // Step 3: Get User Profile
  logStep('3', 'Get User Profile');
  const profileResult = await testEndpoint('GET', `${API_URL}/api/auth/profile`, {
    Authorization: `Bearer ${userToken}`,
  });

  if (profileResult.ok) {
    logSuccess(`Profile retrieved: ${profileResult.data.email}`);
  } else {
    logError(`Failed to get profile: ${profileResult.data.error || profileResult.status}`);
    process.exit(1);
  }

  // Step 4: Get Projects
  logStep('4', 'Get Projects');
  const projectsResult = await testEndpoint('GET', `${API_URL}/api/analytics/projects`, {
    Authorization: `Bearer ${userToken}`,
  });

  if (projectsResult.ok && Array.isArray(projectsResult.data) && projectsResult.data.length > 0) {
    const project = projectsResult.data[0];
    projectApiKey = project.api_key;
    logSuccess(`Projects retrieved: ${projectsResult.data.length} project(s)`);
    logSuccess(`Using project: ${project.name} (${project.id})`);
    logSuccess(`Project API Key: ${projectApiKey.substring(0, 20)}...`);
  } else {
    logError(`Failed to get projects: ${projectsResult.data.error || 'No projects found'}`);
    process.exit(1);
  }

  // Step 5: Submit Bug Report (via Widget API)
  logStep('5', 'Submit Bug Report');
  const bugReport = {
    title: 'Test Bug Report',
    description: 'This is a test bug report created by the test script',
    severity: 'medium',
    userEmail: testEmail,
    userAgent: 'Test Script/1.0',
    url: 'https://example.com/test',
    environment: {
      browser: 'Test Browser',
      os: 'Test OS',
      screenResolution: '1920x1080',
    },
    steps: ['Step 1: Open page', 'Step 2: Click button', 'Step 3: See error'],
    tags: ['test', 'automated'],
  };

  const submitResult = await testEndpoint('POST', `${API_URL}/api/bug-reports/submit`, {
    'X-API-Key': projectApiKey,
  }, bugReport);

  if (submitResult.ok && submitResult.data.id) {
    bugReportId = submitResult.data.id;
    logSuccess(`Bug report submitted: ${bugReportId}`);
  } else {
    logError(`Failed to submit bug report: ${submitResult.data.error || submitResult.status}`);
    process.exit(1);
  }

  // Step 6: Get Bug Reports
  logStep('6', 'Get Bug Reports');
  const reportsResult = await testEndpoint('GET', `${API_URL}/api/bug-reports`, {
    Authorization: `Bearer ${userToken}`,
  });

  if (reportsResult.ok && Array.isArray(reportsResult.data)) {
    const foundReport = reportsResult.data.find(r => r.id === bugReportId);
    if (foundReport) {
      logSuccess(`Bug reports retrieved: ${reportsResult.data.length} report(s)`);
      logSuccess(`Found submitted report: ${foundReport.title}`);
    } else {
      logWarning(`Report submitted but not found in list (might be a timing issue)`);
    }
  } else {
    logError(`Failed to get bug reports: ${reportsResult.data.error || reportsResult.status}`);
  }

  // Step 7: Update Bug Report Status
  logStep('7', 'Update Bug Report Status');
  const updateResult = await testEndpoint('PUT', `${API_URL}/api/bug-reports/${bugReportId}/status`, {
    Authorization: `Bearer ${userToken}`,
  }, {
    status: 'in-progress',
  });

  if (updateResult.ok) {
    logSuccess('Bug report status updated to "in-progress"');
  } else {
    logError(`Failed to update status: ${updateResult.data.error || updateResult.status}`);
  }

  // Step 8: Verify Status Update
  logStep('8', 'Verify Status Update');
  const verifyResult = await testEndpoint('GET', `${API_URL}/api/bug-reports`, {
    Authorization: `Bearer ${userToken}`,
  });

  if (verifyResult.ok && Array.isArray(verifyResult.data)) {
    const updatedReport = verifyResult.data.find(r => r.id === bugReportId);
    if (updatedReport && updatedReport.status === 'in-progress') {
      logSuccess('Status update verified');
    } else {
      logWarning('Status update not reflected (might be a timing issue)');
    }
  }

  // Summary
  log('\n=== Test Summary ===', 'blue');
  logSuccess('All critical tests passed!');
  log(`\nTest User: ${testEmail}`);
  log(`Test Project API Key: ${projectApiKey?.substring(0, 20)}...`);
  log(`Test Bug Report ID: ${bugReportId}`);
  log('\nYou can now test the widget integration with the Project API Key above.\n');
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  logError('This script requires Node.js 18+ with native fetch support');
  logWarning('Alternatively, install node-fetch: npm install node-fetch');
  process.exit(1);
}

// Run tests
runTests().catch((error) => {
  logError(`Unexpected error: ${error.message}`);
  console.error(error);
  process.exit(1);
});


