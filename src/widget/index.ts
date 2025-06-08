// BugSpot Widget - Lightweight bug reporting widget
// Version: 1.0.0
// Size target: <50KB

interface BugSpotConfig {
  apiKey: string;
  apiUrl?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  primaryColor?: string;
  enableScreenshot?: boolean;
  showPreview?: boolean;
  autoInit?: boolean;
}

interface BugReport {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  screenshot?: string;
  environment: any;
  userEmail?: string;
  userAgent: string;
  url: string;
  steps: string[];
  tags: string[];
}

class BugSpotWidget {
  private config: Required<BugSpotConfig>;
  private isOpen = false;
  private widget: HTMLElement | null = null;
  private modal: HTMLElement | null = null;

  constructor(config: BugSpotConfig) {
    this.config = {
      apiUrl: 'https://api.bugspot.dev',
      position: 'bottom-right',
      primaryColor: '#3B82F6',
      enableScreenshot: true,
      showPreview: true,
      autoInit: true,
      ...config
    };

    if (this.config.autoInit) {
      this.init();
    }
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.createWidget());
    } else {
      this.createWidget();
    }
  }

  private createWidget() {
    // Create widget button
    this.widget = document.createElement('div');
    this.widget.className = 'bugspot-widget';
    this.widget.innerHTML = this.getWidgetHTML();
    this.widget.style.cssText = this.getWidgetCSS();

    // Add event listeners
    const button = this.widget.querySelector('.bugspot-button') as HTMLElement;
    button?.addEventListener('click', () => this.openModal());

    document.body.appendChild(this.widget);
  }

  private getWidgetHTML(): string {
    return `
      <button class="bugspot-button" title="Report a bug">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m8 2 1.88 1.88"/>
          <path d="M14.12 3.88 16 2"/>
          <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/>
          <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/>
          <path d="M12 20v-9"/>
          <path d="M6.53 9C4.6 8.8 3 7.1 3 5"/>
          <path d="M6 13H2"/>
          <path d="M3 21c0-2.1 1.7-3.9 3.8-4"/>
          <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/>
          <path d="M22 13h-4"/>
          <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/>
        </svg>
      </button>
    `;
  }

  private getWidgetCSS(): string {
    const positions = {
      'bottom-right': 'bottom: 20px; right: 20px;',
      'bottom-left': 'bottom: 20px; left: 20px;',
      'top-right': 'top: 20px; right: 20px;',
      'top-left': 'top: 20px; left: 20px;'
    };

    return `
      position: fixed;
      ${positions[this.config.position]}
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
  }

  private openModal() {
    if (this.isOpen) return;
    
    this.isOpen = true;
    this.modal = document.createElement('div');
    this.modal.className = 'bugspot-modal';
    this.modal.innerHTML = this.getModalHTML();
    this.modal.style.cssText = this.getModalCSS();

    // Add event listeners
    this.addModalEventListeners();

    document.body.appendChild(this.modal);
    
    // Auto-capture screenshot if enabled
    if (this.config.enableScreenshot) {
      setTimeout(() => this.captureScreenshot(), 100);
    }
  }

  private closeModal() {
    if (this.modal) {
      document.body.removeChild(this.modal);
      this.modal = null;
    }
    this.isOpen = false;
  }

  private getModalHTML(): string {
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
            
            ${this.config.enableScreenshot ? `
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

  private addModalEventListeners() {
    if (!this.modal) return;

    // Close button
    const closeBtn = this.modal.querySelector('.bugspot-close') as HTMLElement;
    closeBtn?.addEventListener('click', () => this.closeModal());

    // Cancel button
    const cancelBtn = this.modal.querySelector('.bugspot-cancel') as HTMLElement;
    cancelBtn?.addEventListener('click', () => this.closeModal());

    // Overlay click
    const overlay = this.modal.querySelector('.bugspot-overlay') as HTMLElement;
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeModal();
    });

    // Form submission
    const form = this.modal.querySelector('.bugspot-form') as HTMLFormElement;
    form?.addEventListener('submit', (e) => this.handleSubmit(e));

    // Retake screenshot
    const retakeBtn = this.modal.querySelector('.bugspot-retake') as HTMLElement;
    retakeBtn?.addEventListener('click', () => this.captureScreenshot());
  }

  private async captureScreenshot() {
    if (!this.config.enableScreenshot || !this.modal) return;

    const container = this.modal.querySelector('.bugspot-screenshot-container') as HTMLElement;
    const placeholder = container?.querySelector('.bugspot-screenshot-placeholder') as HTMLElement;
    
    if (!container || !placeholder) return;

    try {
      // Hide modal temporarily
      this.modal.style.display = 'none';
      
      // Wait a bit for the page to render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Use html2canvas if available, otherwise use a simple fallback
      let screenshotData: string;
      
      if (typeof (window as any).html2canvas === 'function') {
        const canvas = await (window as any).html2canvas(document.body, {
          useCORS: true,
          allowTaint: false,
          scale: 0.5,
          width: window.innerWidth,
          height: window.innerHeight
        });
        screenshotData = canvas.toDataURL('image/png', 0.8);
      } else {
        // Fallback: create a simple canvas with page info
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, 400, 300);
        ctx.fillStyle = '#374151';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Screenshot captured', 200, 150);
        ctx.fillText(`URL: ${window.location.href}`, 200, 180);
        screenshotData = canvas.toDataURL('image/png');
      }

      // Show modal again
      this.modal.style.display = 'block';

      // Update UI
      placeholder.innerHTML = `<img src="${screenshotData}" alt="Screenshot" style="max-width: 100%; height: auto; border-radius: 4px;">`;
      
      // Store screenshot data
      (placeholder as any).screenshotData = screenshotData;

    } catch (error) {
      console.error('Screenshot capture failed:', error);
      this.modal.style.display = 'block';
      placeholder.innerHTML = '<span>❌ Screenshot failed</span>';
    }
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('.bugspot-submit') as HTMLButtonElement;
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      // Collect form data
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const severity = formData.get('severity') as string;
      const email = formData.get('email') as string;

      // Get screenshot if available
      const placeholder = this.modal?.querySelector('.bugspot-screenshot-placeholder') as any;
      const screenshot = placeholder?.screenshotData || '';

      // Collect environment data
      const environment = this.collectEnvironmentData();

      const bugReport: BugReport = {
        title,
        description,
        severity: severity as any,
        screenshot,
        environment,
        userEmail: email || undefined,
        userAgent: navigator.userAgent,
        url: window.location.href,
        steps: [],
        tags: []
      };

      // Submit to API
      const response = await fetch(`${this.config.apiUrl}/api/bug-reports/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey
        },
        body: JSON.stringify(bugReport)
      });

      if (response.ok) {
        this.showSuccessMessage();
        setTimeout(() => this.closeModal(), 2000);
      } else {
        throw new Error('Failed to submit bug report');
      }

    } catch (error) {
      console.error('Submit error:', error);
      this.showErrorMessage();
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Report';
    }
  }

  private collectEnvironmentData() {
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

  private showSuccessMessage() {
    if (!this.modal) return;
    
    const content = this.modal.querySelector('.bugspot-modal-content') as HTMLElement;
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

  private showErrorMessage() {
    if (!this.modal) return;
    
    const form = this.modal.querySelector('.bugspot-form') as HTMLElement;
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'background: #fee2e2; color: #dc2626; padding: 12px; border-radius: 6px; margin-bottom: 16px;';
    errorDiv.textContent = 'Failed to submit bug report. Please try again.';
    form.insertBefore(errorDiv, form.firstChild);
  }
}

// Global API
(window as any).BugSpot = {
  init: (config: BugSpotConfig) => new BugSpotWidget(config),
  version: '1.0.0'
};

// Auto-init if config is provided
if ((window as any).bugSpotConfig) {
  new BugSpotWidget((window as any).bugSpotConfig);
}

// Add CSS styles
const style = document.createElement('style');
style.textContent = `
  .bugspot-widget .bugspot-button {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: ${(window as any).bugSpotConfig?.primaryColor || '#3B82F6'};
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
    border-color: ${(window as any).bugSpotConfig?.primaryColor || '#3B82F6'};
    box-shadow: 0 0 0 3px ${(window as any).bugSpotConfig?.primaryColor || '#3B82F6'}20;
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
    background: ${(window as any).bugSpotConfig?.primaryColor || '#3B82F6'};
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
`;

document.head.appendChild(style);

export default BugSpotWidget;