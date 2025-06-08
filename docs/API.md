# BugSpot API Documentation

## Base URL

```
Production: https://api.bugspot.dev
Development: http://localhost:3001
```

## Authentication

### JWT Authentication (Dashboard)

Include JWT token in Authorization header:

```
Authorization: Bearer <jwt-token>
```

### API Key Authentication (Widget)

Include API key in X-API-Key header:

```
X-API-Key: <project-api-key>
```

## Rate Limiting

- 100 requests per minute per IP address
- Rate limit headers included in responses:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

Common HTTP status codes:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Endpoints

### Authentication

#### Register User

```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "apiKey": "user-api-key"
  }
}
```

#### Login User

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "apiKey": "user-api-key",
    "plan": "free"
  }
}
```

#### Get User Profile

```http
GET /api/auth/profile
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "api_key": "user-api-key",
  "plan": "free",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

### Bug Reports

#### Submit Bug Report (Widget)

```http
POST /api/bug-reports/submit
X-API-Key: <project-api-key>
```

**Request Body:**
```json
{
  "title": "Button not working",
  "description": "The submit button doesn't respond when clicked",
  "severity": "medium",
  "screenshot": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "environment": {
    "userAgent": "Mozilla/5.0...",
    "url": "https://example.com/page",
    "viewport": "1920x1080",
    "screen": "1920x1080",
    "language": "en-US",
    "platform": "MacIntel"
  },
  "userEmail": "user@example.com",
  "userAgent": "Mozilla/5.0...",
  "url": "https://example.com/page",
  "steps": [
    "Navigate to contact page",
    "Fill out form",
    "Click submit button"
  ],
  "tags": ["ui", "form", "button"]
}
```

**Response:**
```json
{
  "message": "Bug report submitted successfully",
  "id": 123
}
```

#### Get Bug Reports (Dashboard)

```http
GET /api/bug-reports
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `projectId` (optional) - Filter by project ID
- `status` (optional) - Filter by status: `open`, `in-progress`, `resolved`, `closed`
- `severity` (optional) - Filter by severity: `low`, `medium`, `high`, `critical`
- `limit` (optional) - Number of results (default: 50, max: 100)
- `offset` (optional) - Pagination offset (default: 0)

**Response:**
```json
[
  {
    "id": 123,
    "project_id": 1,
    "project_name": "My Website",
    "title": "Button not working",
    "description": "The submit button doesn't respond when clicked",
    "severity": "medium",
    "status": "open",
    "screenshot": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "environment": {
      "userAgent": "Mozilla/5.0...",
      "url": "https://example.com/page",
      "viewport": "1920x1080"
    },
    "user_email": "user@example.com",
    "user_agent": "Mozilla/5.0...",
    "url": "https://example.com/page",
    "steps": ["Navigate to contact page", "Fill out form"],
    "tags": ["ui", "form"],
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
]
```

#### Update Bug Report Status

```http
PUT /api/bug-reports/:id/status
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "status": "in-progress"
}
```

**Response:**
```json
{
  "message": "Status updated successfully"
}
```

#### Delete Bug Report

```http
DELETE /api/bug-reports/:id
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "message": "Bug report deleted successfully"
}
```

### Analytics

#### Get Dashboard Analytics

```http
GET /api/analytics/dashboard
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `projectId` (optional) - Filter by project ID
- `days` (optional) - Number of days for time-based data (default: 30)

**Response:**
```json
{
  "totalReports": 150,
  "reportsByStatus": {
    "open": 45,
    "in-progress": 30,
    "resolved": 60,
    "closed": 15
  },
  "reportsBySeverity": {
    "low": 40,
    "medium": 70,
    "high": 30,
    "critical": 10
  },
  "reportsOverTime": [
    {
      "date": "2024-01-01",
      "count": 5
    },
    {
      "date": "2024-01-02",
      "count": 8
    }
  ],
  "recentReports": [
    {
      "id": 123,
      "title": "Button not working",
      "severity": "medium",
      "status": "open",
      "created_at": "2024-01-01T12:00:00.000Z",
      "project_name": "My Website"
    }
  ]
}
```

#### Get Projects

```http
GET /api/analytics/projects
Authorization: Bearer <jwt-token>
```

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "My Website",
    "domain": "example.com",
    "api_key": "project-api-key",
    "settings": "{}",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### Widget

#### Get Widget Configuration

```http
GET /api/widget/config/:apiKey
```

**Response:**
```json
{
  "projectId": 1,
  "projectName": "My Website",
  "settings": {
    "position": "bottom-right",
    "primaryColor": "#3B82F6",
    "enableScreenshot": true,
    "showPreview": true
  }
}
```

## Data Models

### Bug Report

```typescript
interface BugReport {
  id: number;
  project_id: number;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  screenshot?: string;
  environment: EnvironmentData;
  user_email?: string;
  user_agent: string;
  url: string;
  steps: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
}
```

### Environment Data

```typescript
interface EnvironmentData {
  userAgent: string;
  url: string;
  referrer: string;
  viewport: string;
  screen: string;
  timestamp: string;
  language: string;
  platform: string;
}
```

### User

```typescript
interface User {
  id: number;
  email: string;
  api_key: string;
  plan: 'free' | 'pro' | 'enterprise';
  created_at: string;
  updated_at: string;
}
```

### Project

```typescript
interface Project {
  id: number;
  user_id: number;
  name: string;
  domain?: string;
  api_key: string;
  settings: ProjectSettings;
  created_at: string;
}

interface ProjectSettings {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  primaryColor?: string;
  enableScreenshot?: boolean;
  showPreview?: boolean;
  customFields?: CustomField[];
}
```

## Webhooks

### Bug Report Submitted

When a bug report is submitted, you can receive a webhook notification:

**Webhook URL:** Configure in your project settings

**Request:**
```http
POST <your-webhook-url>
Content-Type: application/json
X-BugSpot-Event: bug-report-submitted
X-BugSpot-Signature: sha256=<signature>
```

**Payload:**
```json
{
  "event": "bug-report-submitted",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "project": {
    "id": 1,
    "name": "My Website",
    "api_key": "project-api-key"
  },
  "report": {
    "id": 123,
    "title": "Button not working",
    "description": "The submit button doesn't respond",
    "severity": "medium",
    "status": "open",
    "screenshot": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "environment": {},
    "user_email": "user@example.com",
    "url": "https://example.com/page",
    "created_at": "2024-01-01T12:00:00.000Z"
  }
}
```

### Webhook Verification

Verify webhook authenticity using the signature:

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return `sha256=${expectedSignature}` === signature;
}
```

## SDK Examples

### JavaScript/Node.js

```javascript
class BugSpotAPI {
  constructor(apiKey, baseUrl = 'https://api.bugspot.dev') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async submitBugReport(report) {
    const response = await fetch(`${this.baseUrl}/api/bug-reports/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      body: JSON.stringify(report)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    return response.json();
  }

  async getBugReports(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${this.baseUrl}/api/bug-reports?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });

    return response.json();
  }
}
```

### Python

```python
import requests
import json

class BugSpotAPI:
    def __init__(self, api_key, base_url='https://api.bugspot.dev'):
        self.api_key = api_key
        self.base_url = base_url

    def submit_bug_report(self, report):
        response = requests.post(
            f'{self.base_url}/api/bug-reports/submit',
            headers={
                'Content-Type': 'application/json',
                'X-API-Key': self.api_key
            },
            json=report
        )
        response.raise_for_status()
        return response.json()

    def get_bug_reports(self, **filters):
        response = requests.get(
            f'{self.base_url}/api/bug-reports',
            headers={'Authorization': f'Bearer {self.token}'},
            params=filters
        )
        return response.json()
```

## Testing

### Test API Key

Use this API key for testing (limited functionality):

```
test_api_key_12345
```

### Postman Collection

Import our Postman collection for easy API testing:

```
https://api.bugspot.dev/postman/collection.json
```

## Support

- Email: api-support@bugspot.dev
- Documentation: https://docs.bugspot.dev/api
- Status Page: https://status.bugspot.dev