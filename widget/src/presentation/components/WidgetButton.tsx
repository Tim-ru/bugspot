export class WidgetButton {
  private element: HTMLElement;
  private onClick: () => void;

  constructor(onClick: () => void) {
    this.onClick = onClick;
    this.element = this.createButton();
  }

  private createButton(): HTMLElement {
    const button = document.createElement('div');
    button.className = 'bugspot-widget';
    button.innerHTML = this.getButtonHTML();
    button.style.cssText = this.getButtonCSS();

    const buttonElement = button.querySelector('.bugspot-button') as HTMLElement;
    buttonElement?.addEventListener('click', this.onClick);

    return button;
  }

  private getButtonHTML(): string {
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

  private getButtonCSS(): string {
    const positions = {
      'bottom-right': 'bottom: 20px; right: 20px;',
      'bottom-left': 'bottom: 20px; left: 20px;',
      'top-right': 'top: 20px; right: 20px;',
      'top-left': 'top: 20px; left: 20px;'
    };

    const position = (window as any).bugSpotConfig?.position || 'bottom-right';

    return `
      position: fixed;
      ${positions[position]}
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
  }

  mount(): void {
    document.body.appendChild(this.element);
  }

  unmount(): void {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
