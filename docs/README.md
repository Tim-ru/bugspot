# BugSpot Widget - Lightweight Bug Reporting Solution

## Overview

BugSpot is a production-ready, lightweight bug reporting widget that can be integrated into any website with just a few lines of code. It automatically captures screenshots, collects environment data, and provides a comprehensive dashboard for managing bug reports.

## Features

- **🚀 Easy Integration**: Single line of code installation
- **📸 Auto Screenshots**: Automatic screenshot capture with html2canvas
- **🌐 Environment Data**: Browser, OS, screen resolution, and more
- **📊 Analytics Dashboard**: Real-time bug tracking and analytics
- **🔐 Secure API**: JWT authentication and rate limiting
- **💾 SQLite Database**: Lightweight, file-based database
- **📱 Responsive Design**: Works on all devices
- **⚡ Lightweight**: Widget under 50KB

## Quick Start

### 1. Installation

```bash
npm install
npm run dev:full
```

This starts both the API server (port 3001) and the React dashboard (port 5173).

### 2. Widget Integration

Add this code to your website:

```html
<!-- Add this to your HTML head -->
<script src="https://your-domain.com/widget.js"></script>
<script>
  BugSpot.init({
    apiKey: 'your-project-api-key',
    apiUrl: 'https://your-domain.com',
    position: 'bottom-right',
    primaryColor: '#3B82F6'
  });
</script>
```

### 3. Configuration Options

```javascript
BugSpot.init({
  apiKey: 'required-api-key',           // Your project API key
  apiUrl: 'https://api.bugspot.dev',    // API endpoint
  position: 'bottom-right',             // Widget position
  primaryColor: '#3B82F6',              // Brand color
  enableScreenshot: true,               // Auto-capture screenshots
  showPreview: true,                    // Show screenshot preview
  autoInit: true                        // Auto-initialize widget
});
```

## API Documentation

### Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Widget submissions require an API key in the X-API-Key header:

```
X-API-Key: <your-project-api-key>
```

### Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

#### Bug Reports
- `POST /api/bug-reports/submit` - Submit bug report (widget)
- `GET /api/bug-reports` - Get bug reports (authenticated)
- `PUT /api/bug-reports/:id/status` - Update report status
- `DELETE /api/bug-reports/:id` - Delete report

#### Analytics
- `GET /api/analytics/dashboard` - Dashboard data
- `GET /api/analytics/projects` - User projects

#### Widget
- `GET /api/widget/config/:apiKey` - Widget configuration

### Bug Report Schema

```json
{
  "title": "string (required)",
  "description": "string (required)",
  "severity": "low|medium|high|critical",
  "screenshot": "base64 image data",
  "environment": {
    "userAgent": "string",
    "url": "string",
    "viewport": "string",
    "screen": "string",
    "language": "string",
    "platform": "string"
  },
  "userEmail": "string (optional)",
  "steps": ["array of strings"],
  "tags": ["array of strings"]
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Projects Table
```sql
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  domain TEXT,
  api_key TEXT UNIQUE NOT NULL,
  settings TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Bug Reports Table
```sql
CREATE TABLE bug_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  screenshot TEXT,
  environment TEXT,
  user_email TEXT,
  user_agent TEXT,
  url TEXT,
  steps TEXT,
  tags TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Deployment

### Production Build

```bash
# Build the dashboard
npm run build

# Build the widget
npm run build:widget

# Start production server
npm run server
```

### Environment Variables

Create a `.env` file:

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secret-jwt-key
DATABASE_PATH=./server/database/bugspot.db
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build
RUN npm run build:widget

EXPOSE 3001
CMD ["npm", "run", "server"]
```

## Monetization Strategy

### Freemium Model

**Free Plan:**
- Up to 100 bug reports/month
- 1 project
- Basic analytics
- Email support

**Pro Plan ($19/month):**
- Unlimited bug reports
- 5 projects
- Advanced analytics
- Priority support
- Custom branding

**Enterprise Plan ($99/month):**
- Unlimited everything
- White-label solution
- API access
- Custom integrations
- Dedicated support

### Usage-Based Pricing

- $0.10 per bug report after free tier
- Volume discounts for high usage
- Annual billing discounts

## Security Features

- JWT authentication
- Rate limiting (100 requests/minute)
- CORS protection
- Helmet.js security headers
- Input validation and sanitization
- SQL injection prevention

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers

## Performance

- Widget size: <50KB gzipped
- Load time: <200ms
- Screenshot capture: <1s
- API response time: <100ms

## Support

- Documentation: https://docs.bugspot.dev
- Email: support@bugspot.dev
- GitHub: https://github.com/bugspot/widget

## License

MIT License - see LICENSE file for details.