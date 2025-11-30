import React, { useState } from 'react';
import { Bug, MessageSquare, X, Settings } from 'lucide-react';
import { WidgetConfig } from '../types';
import BugReportModal from './BugReportModal';
import WidgetSettings from './WidgetSettings';

interface BugReportWidgetProps {
  config?: Partial<WidgetConfig>;
  onReportSubmit?: (report: any) => void;
}

export default function BugReportWidget({ 
  config = {}, 
  onReportSubmit 
}: BugReportWidgetProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const defaultConfig: WidgetConfig = {
    position: 'bottom-right',
    primaryColor: '#3B82F6',
    borderRadius: 'rounded-xl',
    showPreview: true,
    enableScreenshot: true,
    requiredFields: ['title', 'description'],
  };

  const widgetConfig = { ...defaultConfig, ...config };

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  const menuPositionClasses = {
    'bottom-right': 'right-0',
    'bottom-left': 'left-0',
    'top-right': 'right-0',
    'top-left': 'left-0',
  };

  const borderRadiusClasses = {
    'rounded': 'rounded',
    'rounded-lg': 'rounded-lg',
    'rounded-xl': 'rounded-xl',
    'rounded-full': 'rounded-full',
  };

  return (
    <>
      <div 
        className={`fixed z-50 ${positionClasses[widgetConfig.position]} bug-report-widget`}
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        {/* Main Widget Button */}
        <div className="relative">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`
              bg-white shadow-lg border-2 hover:shadow-xl transform hover:scale-105 
              transition-all duration-300 ease-out p-4 flex items-center gap-3
              ${borderRadiusClasses[widgetConfig.borderRadius]}
            `}
            style={{ borderColor: widgetConfig.primaryColor }}
          >
            <Bug 
              className="w-6 h-6" 
              style={{ color: widgetConfig.primaryColor }} 
            />
            <span className="text-gray-700 font-medium hidden sm:block">
              Report Bug
            </span>
          </button>

          {/* Expanded Menu */}
          {isExpanded && (
            <div 
              className={`
                absolute bottom-full mb-2 ${menuPositionClasses[widgetConfig.position]} bg-white shadow-2xl border-2 p-2 min-w-48
                transform origin-bottom animate-in zoom-in-95 duration-200
                ${borderRadiusClasses[widgetConfig.borderRadius]}
              `}
              style={{ borderColor: widgetConfig.primaryColor }}
            >
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setIsExpanded(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Report Issue</span>
              </button>
              
              <button
                onClick={() => {
                  setIsSettingsOpen(true);
                  setIsExpanded(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Settings</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bug Report Modal */}
      <BugReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        config={widgetConfig}
        onSubmit={onReportSubmit}
      />

      {/* Settings Modal */}
      <WidgetSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={widgetConfig}
        onConfigChange={() => {}} // In production, this would update the config
      />
    </>
  );
}