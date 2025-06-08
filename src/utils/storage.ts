import { BugReport } from '../types';

const STORAGE_KEY = 'bug_reports';

export function saveBugReport(report: BugReport): void {
  const reports = getBugReports();
  reports.push(report);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function getBugReports(): BugReport[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function updateBugReport(id: string, updates: Partial<BugReport>): void {
  const reports = getBugReports();
  const index = reports.findIndex(report => report.id === id);
  
  if (index !== -1) {
    reports[index] = { ...reports[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }
}

export function deleteBugReport(id: string): void {
  const reports = getBugReports().filter(report => report.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function exportBugReports(): string {
  const reports = getBugReports();
  return JSON.stringify(reports, null, 2);
}

export function clearAllReports(): void {
  localStorage.removeItem(STORAGE_KEY);
}