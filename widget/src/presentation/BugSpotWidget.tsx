import { BugReportConfig } from '../domain/entities/BugReport';
import { CreateBugReport } from '../domain/useCases/CreateBugReport';
import { BugReportApi } from '../application/api/BugReportApi';
import { Html2CanvasScreenshotService } from '../application/services/ScreenshotService';
import { WidgetButton } from './components/WidgetButton';
import { Modal, ModalCallbacks } from './components/Modal';

export class BugSpotWidget {
  private config: Required<BugReportConfig>;
  private createBugReport: CreateBugReport;
  private screenshotService: Html2CanvasScreenshotService;
  private button: WidgetButton;
  private modal: Modal;

  constructor(config: BugReportConfig) {
    this.config = {
      apiUrl: 'https://api.bugspot.dev',
      position: 'bottom-right',
      primaryColor: '#3B82F6',
      enableScreenshot: true,
      showPreview: true,
      autoInit: true,
      ...config
    };

    // Инициализация зависимостей
    const bugReportRepository = new BugReportApi(this.config.apiUrl, this.config.apiKey);
    this.createBugReport = new CreateBugReport(bugReportRepository);
    this.screenshotService = new Html2CanvasScreenshotService();

    // Инициализация UI компонентов
    this.button = new WidgetButton(() => this.openModal());
    this.modal = new Modal(this.screenshotService, {
      onSubmit: this.handleSubmit.bind(this),
      onClose: this.closeModal.bind(this)
    });

    if (this.config.autoInit) {
      this.init();
    }
  }

  init(): void {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.mount());
    } else {
      this.mount();
    }
  }

  private mount(): void {
    this.button.mount();
    this.injectStyles();
  }

  private openModal(): void {
    this.modal.open();
  }

  private closeModal(): void {
    this.modal.close();
  }

  private async handleSubmit(data: {
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    email?: string;
    screenshot?: string;
  }): Promise<void> {
    const result = await this.createBugReport.execute({
      title: data.title,
      description: data.description,
      severity: data.severity,
      screenshot: data.screenshot,
      userEmail: data.email
    });

    if (result.success) {
      this.modal.showSuccess();
      setTimeout(() => this.closeModal(), 2000);
    } else {
      console.error('Failed to submit bug report:', result.error);
    }
  }

  private injectStyles(): void {
    if (document.querySelector('#bugspot-styles')) return;

    const style = document.createElement('style');
    style.id = 'bugspot-styles';
    style.textContent = this.getStyles();
    document.head.appendChild(style);
  }

  private getStyles(): string {
    const primaryColor = this.config.primaryColor;

    return `
      .bugspot-widget .bugspot-button {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: ${primaryColor};
        color: white;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .bugspot-widget .bugspot-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(0,0,0,0.2);
      }
      
      .bugspot-modal .bugspot-overlay {
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        width: 100%;
        height: 100%;
      }
      
      .bugspot-modal .bugspot-modal-content {
        background: white;
        border-radius: 12px;
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
      }
      
      .bugspot-modal .bugspot-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .bugspot-modal .bugspot-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #111827;
      }
      
      .bugspot-modal .bugspot-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #6b7280;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .bugspot-modal .bugspot-form {
        padding: 24px;
      }
      
      .bugspot-modal .bugspot-field {
        margin-bottom: 20px;
      }
      
      .bugspot-modal .bugspot-field label {
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
        color: #374151;
        font-size: 14px;
      }
      
      .bugspot-modal .bugspot-field input,
      .bugspot-modal .bugspot-field select,
      .bugspot-modal .bugspot-field textarea {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        font-family: inherit;
        box-sizing: border-box;
      }
      
      .bugspot-modal .bugspot-field textarea {
        resize: vertical;
        min-height: 80px;
      }
      
      .bugspot-modal .bugspot-field input:focus,
      .bugspot-modal .bugspot-field select:focus,
      .bugspot-modal .bugspot-field textarea:focus {
        outline: none;
        border-color: ${primaryColor};
        box-shadow: 0 0 0 3px ${primaryColor}20;
      }
      
      .bugspot-modal .bugspot-screenshot-container {
        border: 2px dashed #d1d5db;
        border-radius: 6px;
        padding: 20px;
        text-align: center;
      }
      
      .bugspot-modal .bugspot-retake {
        margin-top: 12px;
        background: #f3f4f6;
        border: 1px solid #d1d5db;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
      }
      
      .bugspot-modal .bugspot-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 24px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
      }
      
      .bugspot-modal .bugspot-cancel {
        padding: 10px 20px;
        background: #f9fafb;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        color: #374151;
      }
      
      .bugspot-modal .bugspot-submit {
        padding: 10px 20px;
        background: ${primaryColor};
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        color: white;
      }
      
      .bugspot-modal .bugspot-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .bugspot-modal .bugspot-screenshot-placeholder img {
        transition: all 0.3s ease;
      }
      
      .bugspot-modal .bugspot-screenshot-placeholder img:hover {
        transform: scale(1.02);
      }
    `;
  }

  destroy(): void {
    this.button.unmount();
    this.closeModal();
  }
}
