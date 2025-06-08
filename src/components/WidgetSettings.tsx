import React, { useState } from 'react';
import { X, Palette, Layout, Shield } from 'lucide-react';
import { WidgetConfig } from '../types';

interface WidgetSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  config: WidgetConfig;
  onConfigChange: (config: WidgetConfig) => void;
}

export default function WidgetSettings({ 
  isOpen, 
  onClose, 
  config, 
  onConfigChange 
}: WidgetSettingsProps) {
  const [localConfig, setLocalConfig] = useState(config);

  const positions = [
    { value: 'bottom-right', label: 'Bottom Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'top-left', label: 'Top Left' },
  ] as const;

  const borderRadiuses = [
    { value: 'rounded', label: 'Small' },
    { value: 'rounded-lg', label: 'Medium' },
    { value: 'rounded-xl', label: 'Large' },
    { value: 'rounded-full', label: 'Full' },
  ] as const;

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  const handleSave = () => {
    onConfigChange(localConfig);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Widget Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Position */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layout className="w-5 h-5 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">Position</label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {positions.map((position) => (
                <button
                  key={position.value}
                  onClick={() => setLocalConfig({ ...localConfig, position: position.value })}
                  className={`
                    p-3 text-sm rounded-lg border-2 transition-all
                    ${localConfig.position === position.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  {position.label}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Color */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-5 h-5 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">Primary Color</label>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setLocalConfig({ ...localConfig, primaryColor: color })}
                  className={`
                    w-12 h-12 rounded-lg border-2 transition-all
                    ${localConfig.primaryColor === color
                      ? 'border-gray-400 scale-110'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  style={{ backgroundColor: color }}
                >
                  {localConfig.primaryColor === color && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Border Radius */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Border Radius
            </label>
            <div className="grid grid-cols-2 gap-2">
              {borderRadiuses.map((radius) => (
                <button
                  key={radius.value}
                  onClick={() => setLocalConfig({ ...localConfig, borderRadius: radius.value })}
                  className={`
                    p-3 text-sm border-2 transition-all
                    ${localConfig.borderRadius === radius.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  style={{
                    borderRadius: radius.value === 'rounded' ? '4px' :
                                radius.value === 'rounded-lg' ? '8px' :
                                radius.value === 'rounded-xl' ? '12px' : '50px'
                  }}
                >
                  {radius.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Features</h3>
            
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Enable Screenshots</label>
              <button
                onClick={() => setLocalConfig({ 
                  ...localConfig, 
                  enableScreenshot: !localConfig.enableScreenshot 
                })}
                className={`
                  relative w-12 h-6 rounded-full transition-colors
                  ${localConfig.enableScreenshot ? 'bg-blue-600' : 'bg-gray-300'}
                `}
              >
                <div className={`
                  absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform
                  ${localConfig.enableScreenshot ? 'translate-x-6' : 'translate-x-0.5'}
                `} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Show Preview</label>
              <button
                onClick={() => setLocalConfig({ 
                  ...localConfig, 
                  showPreview: !localConfig.showPreview 
                })}
                className={`
                  relative w-12 h-6 rounded-full transition-colors
                  ${localConfig.showPreview ? 'bg-blue-600' : 'bg-gray-300'}
                `}
              >
                <div className={`
                  absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform
                  ${localConfig.showPreview ? 'translate-x-6' : 'translate-x-0.5'}
                `} />
              </button>
            </div>
          </div>
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
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}