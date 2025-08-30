export interface BugReport {
  id?: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  screenshot?: string;
  environment: EnvironmentData;
  userEmail?: string;
  userAgent: string;
  url: string;
  steps: string[];
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EnvironmentData {
  userAgent: string;
  url: string;
  referrer: string;
  viewport: string;
  screen: string;
  timestamp: string;
  language: string;
  platform: string;
}

export interface BugReportConfig {
  apiKey: string;
  apiUrl?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  primaryColor?: string;
  enableScreenshot?: boolean;
  showPreview?: boolean;
  autoInit?: boolean;
}
