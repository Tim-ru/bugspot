import { BugReport } from '../../domain/entities/BugReport';
import { BugReportRepository } from '../../domain/interfaces/BugReportRepository';

export class BugReportApi implements BugReportRepository {
  constructor(
    private apiUrl: string,
    private apiKey: string
  ) {}

  async submit(bugReport: BugReport): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Попытка отправить на API
      const response = await fetch(`${this.apiUrl}/api/bug-reports/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify(bugReport)
      });

      if (response.ok) {
        const result = await response.json();
        return { success: true, id: result.id };
      } else {
        throw new Error(`API error: ${response.status}`);
      }
    } catch (error) {
      console.warn('API submission failed, falling back to localStorage:', error);
      
      // Fallback: сохранить в localStorage
      return this.saveToLocalStorage(bugReport);
    }
  }

  private saveToLocalStorage(bugReport: BugReport): { success: boolean; id?: string; error?: string } {
    try {
      const key = 'bugspot_widget_reports';
      const existing = localStorage.getItem(key);
      const list = existing ? JSON.parse(existing) : [];
      
      const reportWithMetadata = {
        ...bugReport,
        id: `local_${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };
      
      list.push(reportWithMetadata);
      localStorage.setItem(key, JSON.stringify(list));
      
      return { success: true, id: reportWithMetadata.id };
    } catch (error) {
      console.error('LocalStorage fallback failed:', error);
      return { success: false, error: 'Failed to save report locally' };
    }
  }
}
