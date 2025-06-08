import React, { useState } from 'react';
import { Bug, BarChart3, Code, Home } from 'lucide-react';
import BugReportWidget from './components/BugReportWidget';
import BugReportDashboard from './components/BugReportDashboard';
import IntegrationDemo from './components/IntegrationDemo';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'integration'>('home');

  const renderNavigation = () => (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Bug className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Bug Reporter Pro</h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentView('home')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'home' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Home className="w-4 h-4" />
              Demo
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'dashboard' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('integration')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'integration' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Code className="w-4 h-4" />
              Integration
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  const renderHomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Bug className="w-4 h-4" />
              Production Ready Bug Reporting Tool
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Streamline Bug
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Reporting</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Empower your users to report bugs effortlessly with automatic screenshot capture, 
              environment data collection, and seamless integration into your existing workflow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setCurrentView('integration')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Get Started
              </button>
              <button 
                onClick={() => setCurrentView('dashboard')}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:shadow-md transition-all duration-200"
              >
                View Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to collect, manage, and resolve bug reports efficiently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: '📸',
              title: 'Automatic Screenshots',
              description: 'Capture screenshots automatically when users report bugs, including full page or specific elements.'
            },
            {
              icon: '🌐',
              title: 'Environment Data',
              description: 'Collect browser, OS, screen resolution, and other technical details automatically.'
            },
            {
              icon: '🎨',
              title: 'Customizable Widget',
              description: 'Match your brand with customizable colors, positioning, and styling options.'
            },
            {
              icon: '📊',
              title: 'Analytics Dashboard',
              description: 'Track bug trends, resolution times, and user feedback with comprehensive analytics.'
            },
            {
              icon: '🔗',
              title: 'Easy Integration',
              description: 'Integrate with just a few lines of code. Works with any website or web application.'
            },
            {
              icon: '⚡',
              title: 'Real-time Notifications',
              description: 'Get instant notifications when new bugs are reported via Slack, email, or webhooks.'
            }
          ].map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Demo Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Try It Out</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            The bug reporting widget is already active on this page. Click the bug icon in the bottom-right corner to test it out!
          </p>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Widget Active</span>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Improve Your Bug Tracking?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who have streamlined their bug reporting process with our tool.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setCurrentView('integration')}
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Start Integration
            </button>
            <button 
              onClick={() => setCurrentView('dashboard')}
              className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              View Examples
            </button>
          </div>
        </div>
      </div>

      {/* Bug Report Widget */}
      <BugReportWidget
        config={{
          position: 'bottom-right',
          primaryColor: '#3B82F6',
          enableScreenshot: true,
          showPreview: true
        }}
        onReportSubmit={(report) => {
          console.log('Bug report submitted:', report);
        }}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {renderNavigation()}
      {currentView === 'home' && renderHomePage()}
      {currentView === 'dashboard' && <BugReportDashboard />}
      {currentView === 'integration' && <IntegrationDemo />}
    </div>
  );
}

export default App;