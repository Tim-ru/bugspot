import React, { useState, useEffect } from 'react';
import { X, Camera, AlertTriangle, Info, Bug, Zap } from 'lucide-react';
import { BugReport, WidgetConfig } from '../types';
import { captureScreenshot } from '../utils/screenshotCapture';
import { collectEnvironmentData } from '../utils/environmentData';
import { saveBugReport } from '../utils/storage';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WidgetConfig;
  onSubmit?: (report: BugReport) => void;
}

export default function BugReportModal({ 
  isOpen, 
  onClose, 
  config, 
  onSubmit 
}: BugReportModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [userEmail, setUserEmail] = useState('');
  const [steps, setSteps] = useState(['']);
  const [tags, setTags] = useState<string[]>([]);
  const [screenshot, setScreenshot] = useState<string>('');
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const severityConfig = {
    low: { color: 'text-green-600', bg: 'bg-green-50', icon: Info },
    medium: { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: AlertTriangle },
    high: { color: 'text-orange-600', bg: 'bg-orange-50', icon: Bug },
    critical: { color: 'text-red-600', bg: 'bg-red-50', icon: Zap },
  };

  useEffect(() => {
    if (isOpen && config.enableScreenshot) {
      handleScreenshot();
    }
  }, [isOpen, config.enableScreenshot]);

  const handleScreenshot = async () => {
    if (!config.enableScreenshot) return;
    
    setIsCapturingScreenshot(true);
    try {
      // Hide the modal temporarily for screenshot
      const modal = document.querySelector('.bug-report-modal');
      if (modal) {
        (modal as HTMLElement).style.display = 'none';
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      const screenshotData = await captureScreenshot({
        excludeElements: ['bug-report-widget', 'bug-report-modal']
      });
      
      if (modal) {
        (modal as HTMLElement).style.display = 'block';
      }
      
      setScreenshot(screenshotData);
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
    } finally {
      setIsCapturingScreenshot(false);
    }
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      const newTag = e.currentTarget.value.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      e.currentTarget.value = '';
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    
    const report: BugReport = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      severity,
      status: 'open',
      screenshot,
      environment: collectEnvironmentData(),
      timestamp: new Date().toISOString(),
      userEmail: userEmail.trim() || undefined,
      tags,
      steps: steps.filter(step => step.trim()),
    };

    try {
      saveBugReport(report);
      onSubmit?.(report);
      
      // Reset form
      setTitle('');
      setDescription('');
      setSeverity('medium');
      setUserEmail('');
      setSteps(['']);
      setTags([]);
      setScreenshot('');
      
      onClose();
    } catch (error) {
      console.error('Failed to submit bug report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const SeverityIcon = severityConfig[severity].icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm bug-report-modal">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: config.primaryColor + '20', color: config.primaryColor }}
            >
              <Bug className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Report a Bug</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bug Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the issue"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Severity Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(severityConfig) as Array<keyof typeof severityConfig>).map((level) => {
                const isSelected = severity === level;
                const Icon = severityConfig[level].icon;
                return (
                  <button
                    key={level}
                    onClick={() => setSeverity(level)}
                    className={`
                      p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2
                      ${isSelected 
                        ? `${severityConfig[level].bg} border-current ${severityConfig[level].color}` 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? severityConfig[level].color : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium capitalize ${isSelected ? severityConfig[level].color : 'text-gray-600'}`}>
                      {level}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of what went wrong..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Steps to Reproduce */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Steps to Reproduce
            </label>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium mt-2">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => updateStep(index, e.target.value)}
                    placeholder={`Step ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  {steps.length > 1 && (
                    <button
                      onClick={() => removeStep(index)}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addStep}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                + Add Step
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="space-y-2">
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <input
                type="text"
                onKeyDown={handleTagInput}
                placeholder="Type a tag and press Enter"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Screenshot */}
          {config.enableScreenshot && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Screenshot
                </label>
                <button
                  onClick={handleScreenshot}
                  disabled={isCapturingScreenshot}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  {isCapturingScreenshot ? 'Capturing...' : 'Retake'}
                </button>
              </div>
              {screenshot && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <img
                    src={screenshot}
                    alt="Screenshot"
                    className="max-w-full h-32 object-contain mx-auto rounded"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !description.trim() || isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Report'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}