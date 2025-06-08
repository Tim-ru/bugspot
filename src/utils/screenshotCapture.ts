import html2canvas from 'html2canvas';

export async function captureScreenshot(options: {
  quality?: number;
  includeElement?: HTMLElement;
  excludeElements?: string[];
} = {}): Promise<string> {
  try {
    const { quality = 0.8, includeElement, excludeElements = [] } = options;
    
    const element = includeElement || document.body;
    
    const canvas = await html2canvas(element, {
      quality,
      useCORS: true,
      allowTaint: false,
      scale: window.devicePixelRatio,
      backgroundColor: '#ffffff',
      ignoreElements: (node) => {
        if (node.classList) {
          return excludeElements.some(className => 
            node.classList.contains(className)
          );
        }
        return false;
      },
    });

    return canvas.toDataURL('image/png', quality);
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    throw new Error('Failed to capture screenshot');
  }
}

export async function captureElementScreenshot(selector: string): Promise<string> {
  const element = document.querySelector(selector) as HTMLElement;
  if (!element) {
    throw new Error(`Element with selector "${selector}" not found`);
  }
  
  return captureScreenshot({ includeElement: element });
}

export function downloadScreenshot(dataUrl: string, filename = 'screenshot.png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}