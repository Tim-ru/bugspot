import { BugReport, EnvironmentData } from '../entities/BugReport';
import { BugReportRepository } from '../interfaces/BugReportRepository';
import { ContextCollector } from '../../application/services/ContextCollector';

export class CreateBugReport {
  private contextCollector: ContextCollector;

  constructor(private bugReportRepository: BugReportRepository) {
    this.contextCollector = new ContextCollector();
  }

  async execute(data: {
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    screenshot?: string;
    userEmail?: string;
    steps?: string[];
    tags?: string[];
  }): Promise<{ success: boolean; id?: string; error?: string }> {
    // Валидация входных данных
    if (!data.title?.trim()) {
      return { success: false, error: 'Title is required' };
    }

    if (!data.description?.trim()) {
      return { success: false, error: 'Description is required' };
    }

    // Сбор расширенных данных окружения
    const environment = this.collectEnvironmentData();
    const contextData = this.contextCollector.collectAllContext();

    // Создание bug report с расширенным контекстом
    const bugReport: BugReport = {
      title: data.title.trim(),
      description: data.description.trim(),
      severity: data.severity,
      screenshot: data.screenshot,
      environment: {
        ...environment,
        // Добавляем расширенный контекст
        errors: contextData.errors,
        domState: contextData.domState,
        performance: contextData.performance,
        networkRequests: contextData.network
      },
      userEmail: data.userEmail?.trim(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      steps: data.steps || [],
      tags: data.tags || []
    };

    // Отправка через репозиторий
    return await this.bugReportRepository.submit(bugReport);
  }

  private collectEnvironmentData(): EnvironmentData {
    return {
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      screen: `${screen.width}x${screen.height}`,
      timestamp: new Date().toISOString(),
      language: navigator.language,
      platform: navigator.platform
    };
  }
}
