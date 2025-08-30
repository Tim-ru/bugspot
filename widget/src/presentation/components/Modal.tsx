import { ScreenshotService } from '../../application/services/ScreenshotService';

export interface ModalCallbacks {
  onSubmit: (data: {
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    email?: string;
    screenshot?: string;
  }) => void;
  onClose: () => void;
}

export class Modal {
  private element: HTMLElement | null = null;
  private isOpen = false;
  private screenshotService: ScreenshotService;
  private callbacks: ModalCallbacks;

  constructor(screenshotService: ScreenshotService, callbacks: ModalCallbacks) {
    this.screenshotService = screenshotService;
    this.callbacks = callbacks;
  }

  open(): void {
    if (this.isOpen) return;
    
    this.isOpen = true;
    this.element = document.createElement('div');
    this.element.className = 'bugspot-modal';
    this.element.innerHTML = this.getModalHTML();
    this.element.style.cssText = this.getModalCSS();

    this.addEventListeners();
    document.body.appendChild(this.element);
    
    // Автоматический скриншот
    setTimeout(() => this.captureScreenshot(), 100);
  }

  close(): void {
    if (this.element) {
      document.body.removeChild(this.element);
      this.element = null;
    }
    this.isOpen = false;
  }

  private addEventListeners(): void {
    if (!this.element) return;

    // Кнопка закрытия
    const closeBtn = this.element.querySelector('.bugspot-close') as HTMLElement;
    closeBtn?.addEventListener('click', () => this.callbacks.onClose());

    // Кнопка отмены
    const cancelBtn = this.element.querySelector('.bugspot-cancel') as HTMLElement;
    cancelBtn?.addEventListener('click', () => this.callbacks.onClose());

    // Клик по оверлею
    const overlay = this.element.querySelector('.bugspot-overlay') as HTMLElement;
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) this.callbacks.onClose();
    });

    // Отправка формы
    const form = this.element.querySelector('.bugspot-form') as HTMLFormElement;
    form?.addEventListener('submit', (e) => this.handleSubmit(e));

    // Повторный скриншот
    const retakeBtn = this.element.querySelector('.bugspot-retake') as HTMLElement;
    retakeBtn?.addEventListener('click', () => this.captureScreenshot());
  }

  private async captureScreenshot(): Promise<void> {
    if (!this.element) return;

    const container = this.element.querySelector('.bugspot-screenshot-container') as HTMLElement;
    const placeholder = container?.querySelector('.bugspot-screenshot-placeholder') as HTMLElement;
    
    if (!container || !placeholder) return;

    try {
      // Скрываем модальное окно временно
      this.element.style.display = 'none';
      
      // Ждем рендеринга страницы
      await new Promise(resolve => setTimeout(resolve, 100));

      // Создаем скриншот
      const screenshotData = await this.screenshotService.capture();

      // Показываем модальное окно снова
      this.element.style.display = 'block';

      // Обновляем UI
      placeholder.innerHTML = `<img src="${screenshotData}" alt="Screenshot" style="max-width: 100%; height: auto; border-radius: 4px;">`;
      
      // Сохраняем данные скриншота
      (placeholder as any).screenshotData = screenshotData;

    } catch (error) {
      console.error('Screenshot capture failed:', error);
      this.element.style.display = 'block';
      placeholder.innerHTML = '<span>❌ Screenshot failed</span>';
    }
  }

  private handleSubmit(e: Event): void {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('.bugspot-submit') as HTMLButtonElement;
    
    // Блокируем кнопку
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const severity = formData.get('severity') as 'low' | 'medium' | 'high' | 'critical';
      const email = formData.get('email') as string;

      // Получаем скриншот
      const placeholder = this.element?.querySelector('.bugspot-screenshot-placeholder') as any;
      const screenshot = placeholder?.screenshotData || '';

      this.callbacks.onSubmit({
        title,
        description,
        severity,
        email: email || undefined,
        screenshot
      });

    } catch (error) {
      console.error('Form submission error:', error);
      this.showError();
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Report';
    }
  }

  private showError(): void {
    if (!this.element) return;
    
    const form = this.element.querySelector('.bugspot-form') as HTMLElement;
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'background: #fee2e2; color: #dc2626; padding: 12px; border-radius: 6px; margin-bottom: 16px;';
    errorDiv.textContent = 'Failed to submit bug report. Please try again.';
    form.insertBefore(errorDiv, form.firstChild);
  }

  showSuccess(): void {
    if (!this.element) return;
    
    const content = this.element.querySelector('.bugspot-modal-content') as HTMLElement;
    content.innerHTML = `
      <div class="bugspot-success">
        <div style="text-align: center; padding: 40px 20px;">
          <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
          <h3 style="margin: 0 0 8px 0; color: #059669;">Thank you!</h3>
          <p style="margin: 0; color: #6b7280;">Your bug report has been submitted successfully.</p>
        </div>
      </div>
    `;
  }

  private getModalHTML(): string {
    const config = (window as any).bugSpotConfig || {};
    const enableScreenshot = config.enableScreenshot !== false;

    return `
      <div class="bugspot-overlay">
        <div class="bugspot-modal-content">
          <div class="bugspot-header">
            <h3>Report a Bug</h3>
            <button class="bugspot-close">&times;</button>
          </div>
          <form class="bugspot-form">
            <div class="bugspot-field">
              <label>Title *</label>
              <input type="text" name="title" placeholder="Brief description of the issue" required>
            </div>
            
            <div class="bugspot-field">
              <label>Severity</label>
              <select name="severity">
                <option value="low">Low</option>
                <option value="medium" selected>Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            
            <div class="bugspot-field">
              <label>Description *</label>
              <textarea name="description" placeholder="Detailed description of what went wrong..." required></textarea>
            </div>
            
            <div class="bugspot-field">
              <label>Email (optional)</label>
              <input type="email" name="email" placeholder="your.email@example.com">
            </div>
            
            ${enableScreenshot ? `
              <div class="bugspot-field">
                <label>Screenshot</label>
                <div class="bugspot-screenshot-container">
                  <div class="bugspot-screenshot-placeholder">
                    <span>📸 Capturing screenshot...</span>
                  </div>
                  <button type="button" class="bugspot-retake">Retake Screenshot</button>
                </div>
              </div>
            ` : ''}
            
            <div class="bugspot-actions">
              <button type="button" class="bugspot-cancel">Cancel</button>
              <button type="submit" class="bugspot-submit">Submit Report</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  private getModalCSS(): string {
    return `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1000000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
  }
}
