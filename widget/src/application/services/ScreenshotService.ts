export interface ScreenshotService {
  capture(): Promise<string>;
}

export class Html2CanvasScreenshotService implements ScreenshotService {
  async capture(): Promise<string> {
    try {
      // Проверяем доступность html2canvas
      if (typeof (window as any).html2canvas !== 'function') {
        return this.createFallbackScreenshot();
      }

      // Создаем скриншот с помощью html2canvas
      const canvas = await (window as any).html2canvas(document.body, {
        useCORS: true,
        allowTaint: false,
        scale: 0.5,
        width: window.innerWidth,
        height: window.innerHeight
      });

      return canvas.toDataURL('image/png', 0.8);
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      return this.createFallbackScreenshot();
    }
  }

  private createFallbackScreenshot(): string {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d')!;
    
    // Фон
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, 400, 300);
    
    // Текст
    ctx.fillStyle = '#374151';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Screenshot captured', 200, 150);
    ctx.fillText(`URL: ${window.location.href}`, 200, 180);
    ctx.fillText(`Time: ${new Date().toLocaleString()}`, 200, 210);
    
    return canvas.toDataURL('image/png');
  }
}
