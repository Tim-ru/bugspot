import { BugReport, EnvironmentData } from '../entities/BugReport';
import { BugReportRepository } from '../interfaces/BugReportRepository';

export class CreateBugReport {
  constructor(private bugReportRepository: BugReportRepository) {}

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

    // Сбор данных окружения
    const environment = this.collectEnvironmentData();

    // Создание bug report
    const bugReport: BugReport = {
      title: data.title.trim(),
      description: data.description.trim(),
      severity: data.severity,
      screenshot: data.screenshot,
      environment,
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
