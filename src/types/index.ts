export type AiBugArea = 'frontend' | 'backend' | 'fullstack';

export type AiBugCategory = 'api' | 'auth' | 'ui' | 'performance' | 'other';

export interface AiBugAnalysis {
  area: AiBugArea;
  category: AiBugCategory;
  estimatedHours: number;
  confidence: number;
  summary: string;
}

export interface BugReport {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  screenshot?: string;
  environment: EnvironmentData;
  timestamp: string;
  userEmail?: string;
  tags: string[];
  steps: string[];
  aiAnalysis?: AiBugAnalysis;
}

export interface EnvironmentData {
  userAgent: string;
  browser: string;
  os: string;
  screenResolution: string;
  viewport: string;
  url: string;
  referrer: string;
  timestamp: string;
}

export interface WidgetConfig {
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  primaryColor: string;
  borderRadius: 'rounded' | 'rounded-lg' | 'rounded-xl' | 'rounded-full';
  showPreview: boolean;
  enableScreenshot: boolean;
  requiredFields: string[];
}