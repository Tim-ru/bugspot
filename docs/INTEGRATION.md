# BugSpot Integration Guide

## Quick Integration

### 1. Basic Setup

The simplest way to add BugSpot to your website:

```html
<script src="https://cdn.bugspot.dev/widget.js"></script>
<script>
  BugSpot.init({
    apiKey: 'your-api-key-here'
  });
</script>
```

### 2. Advanced Configuration

```html
<script src="https://cdn.bugspot.dev/widget.js"></script>
<script>
  BugSpot.init({
    apiKey: 'your-api-key-here',
    apiUrl: 'https://api.bugspot.dev',
    position: 'bottom-right',
    primaryColor: '#3B82F6',
    enableScreenshot: true,
    showPreview: true,
    onSubmit: function(report) {
      console.log('Bug report submitted:', report);
      // Custom handling after submission
    },
    onError: function(error) {
      console.error('BugSpot error:', error);
      // Custom error handling
    }
  });
</script>
```

## Framework-Specific Integration

### React

```jsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Load BugSpot script
    const script = document.createElement('script');
    script.src = 'https://cdn.bugspot.dev/widget.js';
    script.onload = () => {
      window.BugSpot.init({
        apiKey: process.env.REACT_APP_BUGSPOT_API_KEY,
        position: 'bottom-right',
        primaryColor: '#3B82F6'
      });
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      document.head.removeChild(script);
    };
  }, []);

  return <div>Your App</div>;
}
```

### Vue.js

```vue
<template>
  <div>Your App</div>
</template>

<script>
export default {
  mounted() {
    this.loadBugSpot();
  },
  methods: {
    loadBugSpot() {
      const script = document.createElement('script');
      script.src = 'https://cdn.bugspot.dev/widget.js';
      script.onload = () => {
        window.BugSpot.init({
          apiKey: process.env.VUE_APP_BUGSPOT_API_KEY,
          position: 'bottom-left',
          primaryColor: '#10B981'
        });
      };
      document.head.appendChild(script);
    }
  }
};
</script>
```

### Angular

```typescript
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<div>Your App</div>'
})
export class AppComponent implements OnInit {
  ngOnInit() {
    this.loadBugSpot();
  }

  private loadBugSpot() {
    const script = document.createElement('script');
    script.src = 'https://cdn.bugspot.dev/widget.js';
    script.onload = () => {
      (window as any).BugSpot.init({
        apiKey: environment.bugspotApiKey,
        position: 'top-right',
        primaryColor: '#8B5CF6'
      });
    };
    document.head.appendChild(script);
  }
}
```

### Next.js

```jsx
// pages/_app.js
import { useEffect } from 'react';
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Script
        src="https://cdn.bugspot.dev/widget.js"
        onLoad={() => {
          window.BugSpot.init({
            apiKey: process.env.NEXT_PUBLIC_BUGSPOT_API_KEY,
            position: 'bottom-right'
          });
        }}
      />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
```

## Configuration Options

### Position Options

```javascript
// Widget position on screen
position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
```

### Styling Options

```javascript
{
  primaryColor: '#3B82F6',        // Main brand color
  borderRadius: '12px',           // Widget border radius
  zIndex: 999999,                 // CSS z-index
  size: 'medium'                  // 'small' | 'medium' | 'large'
}
```

### Feature Toggles

```javascript
{
  enableScreenshot: true,         // Auto-capture screenshots
  showPreview: true,              // Show screenshot preview
  collectEnvironment: true,       // Collect browser/OS data
  allowUserEmail: true,           // Show email field
  requireEmail: false,            // Make email required
  showSteps: true,                // Show steps to reproduce
  showTags: true,                 // Show tags field
  showSeverity: true              // Show severity selector
}
```

### Custom Fields

```javascript
{
  customFields: [
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      options: ['Low', 'Medium', 'High'],
      required: false
    },
    {
      name: 'component',
      label: 'Component',
      type: 'text',
      placeholder: 'Which component has the issue?',
      required: true
    }
  ]
}
```

## Event Handling

### Submission Events

```javascript
BugSpot.init({
  apiKey: 'your-api-key',
  onSubmit: function(report) {
    // Called when bug report is successfully submitted
    console.log('Report submitted:', report);
    
    // Send to analytics
    gtag('event', 'bug_report_submitted', {
      severity: report.severity,
      has_screenshot: !!report.screenshot
    });
  },
  onError: function(error) {
    // Called when submission fails
    console.error('Submission failed:', error);
    
    // Show custom error message
    showNotification('Failed to submit bug report. Please try again.');
  },
  onOpen: function() {
    // Called when widget modal opens
    console.log('BugSpot modal opened');
  },
  onClose: function() {
    // Called when widget modal closes
    console.log('BugSpot modal closed');
  }
});
```

## API Integration

### Backend Webhook

Set up a webhook to receive bug reports in your backend:

```javascript
// Express.js example
app.post('/webhooks/bugspot', (req, res) => {
  const bugReport = req.body;
  
  // Save to your database
  await saveBugReport(bugReport);
  
  // Send to Slack
  await sendSlackNotification(bugReport);
  
  // Create Jira ticket
  await createJiraTicket(bugReport);
  
  res.json({ success: true });
});
```

### Custom API Endpoint

```javascript
BugSpot.init({
  apiKey: 'your-api-key',
  apiUrl: 'https://your-api.com',  // Custom API endpoint
  onSubmit: async function(report) {
    // Custom submission logic
    const response = await fetch('/api/bug-reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    });
    
    if (response.ok) {
      showSuccessMessage();
    } else {
      showErrorMessage();
    }
  }
});
```

## Environment-Specific Setup

### Development

```javascript
BugSpot.init({
  apiKey: 'dev-api-key',
  apiUrl: 'http://localhost:3001',
  enableScreenshot: false,  // Faster testing
  position: 'top-left'      // Less intrusive during dev
});
```

### Staging

```javascript
BugSpot.init({
  apiKey: 'staging-api-key',
  apiUrl: 'https://staging-api.bugspot.dev',
  enableScreenshot: true,
  customFields: [
    {
      name: 'build_version',
      label: 'Build Version',
      type: 'text',
      value: process.env.BUILD_VERSION,
      readonly: true
    }
  ]
});
```

### Production

```javascript
BugSpot.init({
  apiKey: 'prod-api-key',
  apiUrl: 'https://api.bugspot.dev',
  enableScreenshot: true,
  onError: function(error) {
    // Don't log errors in production
    // Send to error tracking service instead
    Sentry.captureException(error);
  }
});
```

## Testing

### Manual Testing

```javascript
// Test widget functionality
BugSpot.init({
  apiKey: 'test-api-key',
  onSubmit: function(report) {
    console.log('Test submission:', report);
    return false; // Prevent actual submission
  }
});

// Programmatically open widget
BugSpot.open();

// Programmatically close widget
BugSpot.close();
```

### Automated Testing

```javascript
// Cypress test example
describe('BugSpot Widget', () => {
  it('should open and submit bug report', () => {
    cy.visit('/');
    cy.get('.bugspot-widget button').click();
    cy.get('input[name="title"]').type('Test bug report');
    cy.get('textarea[name="description"]').type('This is a test');
    cy.get('button[type="submit"]').click();
    cy.contains('Thank you!').should('be.visible');
  });
});
```

## Troubleshooting

### Common Issues

1. **Widget not appearing**
   - Check API key is correct
   - Verify script is loaded
   - Check browser console for errors

2. **Screenshots not working**
   - Ensure html2canvas is loaded
   - Check CORS settings
   - Verify browser permissions

3. **Submission failing**
   - Check network connectivity
   - Verify API endpoint
   - Check rate limiting

### Debug Mode

```javascript
BugSpot.init({
  apiKey: 'your-api-key',
  debug: true,  // Enable debug logging
  onError: function(error) {
    console.error('BugSpot Debug:', error);
  }
});
```

## Best Practices

1. **Load widget asynchronously** to avoid blocking page load
2. **Use environment-specific API keys** for security
3. **Implement proper error handling** for better UX
4. **Test widget on different devices** and browsers
5. **Monitor widget performance** and submission rates
6. **Keep widget updated** to latest version

## Support

Need help with integration? Contact us:

- Email: support@bugspot.dev
- Documentation: https://docs.bugspot.dev
- GitHub Issues: https://github.com/bugspot/widget/issues