import React, { useState } from 'react';
import { Code, Copy, CheckCircle, ExternalLink, Book, Zap } from 'lucide-react';

export default function IntegrationDemo() {
  const [copiedCode, setCopiedCode] = useState<string>('');

  const integrationCode = `<!-- Add this to your HTML head -->
<script src="https://your-domain.com/bug-reporter.js"></script>
<script>
  BugReporter.init({
    position: 'bottom-right',
    primaryColor: '#3B82F6',
    enableScreenshot: true,
    onSubmit: (report) => {
      // Handle bug report submission
      console.log('Bug report submitted:', report);
    }
  });
</script>`;

  const reactIntegration = `import { BugReportWidget } from 'bug-reporter-react';

function App() {
  return (
    <div>
      <h1>Your App</h1>
      
      <BugReportWidget
        config={{
          position: 'bottom-right',
          primaryColor: '#3B82F6',
          enableScreenshot: true
        }}
        onReportSubmit={(report) => {
          // Send to your backend
          fetch('/api/bug-reports', {
            method: 'POST',
            body: JSON.stringify(report)
          });
        }}
      />
    </div>
  );
}`;

  const apiExample = `// Backend API endpoint example
app.post('/api/bug-reports', (req, res) => {
  const report = req.body;
  
  // Save to database
  await db.bugReports.create(report);
  
  // Send to Slack/Discord
  await notifyTeam(report);
  
  // Create Jira ticket
  await createJiraTicket(report);
  
  res.json({ success: true });
});`;

  const copyToClipboard = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(type);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const features = [
    {
      icon: Zap,
      title: 'Easy Integration',
      description: 'Add bug reporting to any website with just a few lines of code'
    },
    {
      icon: Code,
      title: 'Framework Agnostic',
      description: 'Works with vanilla JavaScript, React, Vue, Angular, and more'
    },
    {
      icon: ExternalLink,
      title: 'API Integration',
      description: 'Connect to your existing bug tracking systems and notification channels'
    },
    {
      icon: Book,
      title: 'Comprehensive Data',
      description: 'Automatically captures environment data, screenshots, and user context'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bug Reporter Integration Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Integrate our bug reporting tool into your website or application with ease. 
            Choose from multiple integration methods and customize to fit your needs.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Integration Examples */}
        <div className="space-y-8">
          {/* HTML/JavaScript Integration */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">HTML/JavaScript Integration</h3>
                <button
                  onClick={() => copyToClipboard(integrationCode, 'html')}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {copiedCode === 'html' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedCode === 'html' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="p-6">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{integrationCode}</code>
              </pre>
            </div>
          </div>

          {/* React Integration */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">React Integration</h3>
                <button
                  onClick={() => copyToClipboard(reactIntegration, 'react')}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {copiedCode === 'react' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedCode === 'react' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="p-6">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{reactIntegration}</code>
              </pre>
            </div>
          </div>

          {/* Backend API Example */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Backend API Integration</h3>
                <button
                  onClick={() => copyToClipboard(apiExample, 'api')}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {copiedCode === 'api' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedCode === 'api' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="p-6">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{apiExample}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Configuration Options */}
        <div className="mt-12 bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Configuration Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Widget Settings</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">position</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">primaryColor</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">string (hex color)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">enableScreenshot</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">boolean</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">showPreview</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">boolean</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Event Handlers</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">onSubmit</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">(report) =&gt; void</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">onError</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">(error) =&gt; void</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">onCapture</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">(screenshot) =&gt; void</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Implement our bug reporting tool in minutes and start collecting valuable feedback 
              from your users with automatic screenshots and environment data.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                View Documentation
              </button>
              <button className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Download SDK
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}