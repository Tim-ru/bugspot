import { BugReport } from '../../domain/entities/BugReport';
import { BugReportRepository } from '../../domain/interfaces/BugReportRepository';

export class BugReportApi implements BugReportRepository {
  constructor(
    private apiUrl: string,
    private apiKey: string
  ) {}

  async submit(bugReport: BugReport): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Валидация входных данных
      if (!bugReport.title || !bugReport.title.trim()) {
        return { success: false, error: 'Title is required' };
      }
      if (!bugReport.description || !bugReport.description.trim()) {
        return { success: false, error: 'Description is required' };
      }
      if (!this.apiKey) {
        return { success: false, error: 'API key is required' };
      }

      // Попытка отправить на API с timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 секунд timeout

      try {
        const response = await fetch(`${this.apiUrl}/api/bug-reports/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey
          },
          body: JSON.stringify(bugReport),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const result = await response.json();
          return { success: true, id: result.id };
        } else {
          // Пытаемся получить детали ошибки
          let errorMessage = `API error: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            // Игнорируем ошибку парсинга
          }

          // Для некоторых ошибок не используем fallback
          if (response.status === 400 || response.status === 401) {
            return { success: false, error: errorMessage };
          }

          throw new Error(errorMessage);
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timeout - please check your connection');
        }
        throw fetchError;
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred';
      console.warn('API submission failed, falling back to localStorage:', errorMessage);
      
      // Fallback: сохранить в localStorage только для сетевых ошибок
      if (errorMessage.includes('timeout') || errorMessage.includes('network') || errorMessage.includes('fetch')) {
        return this.saveToLocalStorage(bugReport);
      }
      
      return { success: false, error: errorMessage };
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
