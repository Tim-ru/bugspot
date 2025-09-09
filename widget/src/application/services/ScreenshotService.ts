export interface ScreenshotService {
  capture(): Promise<string>;
  captureWithPreview(): Promise<{ dataUrl: string; preview: string }>;
}

export interface ScreenshotOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export class Html2CanvasScreenshotService implements ScreenshotService {
  private defaultOptions: ScreenshotOptions = {
    quality: 0.7,
    maxWidth: 1920,
    maxHeight: 1080,
    format: 'jpeg'
  };

  async capture(): Promise<string> {
    const result = await this.captureWithPreview();
    return result.dataUrl;
  }

  async captureWithPreview(): Promise<{ dataUrl: string; preview: string }> {
    try {
      // Проверяем доступность html2canvas
      if (typeof (window as any).html2canvas !== 'function') {
        const fallback = this.createFallbackScreenshot();
        return { dataUrl: fallback, preview: fallback };
      }

      // Создаем скриншот с оптимизированными настройками
      const canvas = await (window as any).html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        scale: this.calculateOptimalScale(),
        width: Math.min(window.innerWidth, this.defaultOptions.maxWidth!),
        height: Math.min(window.innerHeight, this.defaultOptions.maxHeight!),
        backgroundColor: '#ffffff',
        logging: false,
        removeContainer: true
      });

      // Сжимаем изображение
      const compressedDataUrl = await this.compressImage(canvas);
      
      // Создаем превью (уменьшенная версия)
      const preview = await this.createPreview(canvas);

      return {
        dataUrl: compressedDataUrl,
        preview: preview
      };
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      const fallback = this.createFallbackScreenshot();
      return { dataUrl: fallback, preview: fallback };
    }
  }

  private calculateOptimalScale(): number {
    const viewport = window.innerWidth * window.innerHeight;
    const maxPixels = this.defaultOptions.maxWidth! * this.defaultOptions.maxHeight!;
    
    if (viewport <= maxPixels) {
      return 1;
    }
    
    return Math.sqrt(maxPixels / viewport);
  }

  private async compressImage(canvas: HTMLCanvasElement): Promise<string> {
    return new Promise((resolve) => {
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d')!;
      
      // Копируем с учетом максимальных размеров
      const { width, height } = this.calculateOptimalDimensions(
        canvas.width, 
        canvas.height
      );
      
      tempCanvas.width = width;
      tempCanvas.height = height;
      
      // Рисуем сглаженное изображение
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(canvas, 0, 0, width, height);
      
      // Конвертируем в выбранный формат с качеством
      const mimeType = `image/${this.defaultOptions.format}`;
      const quality = this.defaultOptions.quality;
      
      resolve(tempCanvas.toDataURL(mimeType, quality));
    });
  }

  private async createPreview(canvas: HTMLCanvasElement): Promise<string> {
    return new Promise((resolve) => {
      const previewCanvas = document.createElement('canvas');
      const ctx = previewCanvas.getContext('2d')!;
      
      // Размер превью
      const previewSize = 200;
      previewCanvas.width = previewSize;
      previewCanvas.height = previewSize;
      
      // Рассчитываем пропорции
      const aspectRatio = canvas.width / canvas.height;
      let drawWidth = previewSize;
      let drawHeight = previewSize;
      
      if (aspectRatio > 1) {
        drawHeight = previewSize / aspectRatio;
      } else {
        drawWidth = previewSize * aspectRatio;
      }
      
      const offsetX = (previewSize - drawWidth) / 2;
      const offsetY = (previewSize - drawHeight) / 2;
      
      // Рисуем превью
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, previewSize, previewSize);
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(canvas, offsetX, offsetY, drawWidth, drawHeight);
      
      resolve(previewCanvas.toDataURL('image/jpeg', 0.8));
    });
  }

  private calculateOptimalDimensions(width: number, height: number): { width: number; height: number } {
    const maxWidth = this.defaultOptions.maxWidth!;
    const maxHeight = this.defaultOptions.maxHeight!;
    
    if (width <= maxWidth && height <= maxHeight) {
      return { width, height };
    }
    
    const aspectRatio = width / height;
    
    if (width > maxWidth) {
      return {
        width: maxWidth,
        height: Math.round(maxWidth / aspectRatio)
      };
    }
    
    if (height > maxHeight) {
      return {
        width: Math.round(maxHeight * aspectRatio),
        height: maxHeight
      };
    }
    
    return { width, height };
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
