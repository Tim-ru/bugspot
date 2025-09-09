export interface ErrorInfo {
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
  timestamp: string;
}

export interface DOMState {
  activeElement?: string;
  focusedElement?: string;
  scrollPosition: { x: number; y: number };
  visibleElements: string[];
  formStates: Record<string, any>;
}

export interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  networkInfo?: {
    connectionType?: string;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  };
}

export interface NetworkRequest {
  url: string;
  method: string;
  status?: number;
  duration?: number;
  timestamp: string;
}

export class ContextCollector {
  private errorLog: ErrorInfo[] = [];
  private networkRequests: NetworkRequest[] = [];
  private performanceObserver?: PerformanceObserver;

  constructor() {
    this.setupErrorHandling();
    this.setupNetworkMonitoring();
    this.setupPerformanceMonitoring();
  }

  /**
   * Собирает все контекстные данные
   */
  collectAllContext(): {
    errors: ErrorInfo[];
    domState: DOMState;
    performance: PerformanceMetrics;
    network: NetworkRequest[];
  } {
    return {
      errors: this.collectJavaScriptErrors(),
      domState: this.collectDOMState(),
      performance: this.collectPerformanceMetrics(),
      network: this.networkRequests.slice(-10) // Последние 10 запросов
    };
  }

  /**
   * Собирает JavaScript ошибки
   */
  collectJavaScriptErrors(): ErrorInfo[] {
    return [...this.errorLog];
  }

  /**
   * Собирает состояние DOM
   */
  collectDOMState(): DOMState {
    const activeElement = document.activeElement;
    const scrollPosition = {
      x: window.pageXOffset || document.documentElement.scrollLeft,
      y: window.pageYOffset || document.documentElement.scrollTop
    };

    // Собираем видимые элементы (первые 10)
    const visibleElements = this.getVisibleElements(10);

    // Собираем состояние форм
    const formStates = this.getFormStates();

    return {
      activeElement: activeElement ? this.getElementSelector(activeElement) : undefined,
      focusedElement: activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA' 
        ? this.getElementSelector(activeElement) 
        : undefined,
      scrollPosition,
      visibleElements,
      formStates
    };
  }

  /**
   * Собирает метрики производительности
   */
  collectPerformanceMetrics(): PerformanceMetrics {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType('paint');
    
    const metrics: PerformanceMetrics = {
      loadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
      domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0
    };

    // First Paint и First Contentful Paint
    paintEntries.forEach(entry => {
      if (entry.name === 'first-paint') {
        metrics.firstPaint = entry.startTime;
      } else if (entry.name === 'first-contentful-paint') {
        metrics.firstContentfulPaint = entry.startTime;
      }
    });

    // Memory usage (если доступно)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metrics.memoryUsage = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };
    }

    // Network information (если доступно)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      metrics.networkInfo = {
        connectionType: connection.type,
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      };
    }

    return metrics;
  }

  /**
   * Настраивает обработку ошибок
   */
  private setupErrorHandling(): void {
    // Обработка глобальных ошибок
    window.addEventListener('error', (event) => {
      this.errorLog.push({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString()
      });
    });

    // Обработка необработанных промисов
    window.addEventListener('unhandledrejection', (event) => {
      this.errorLog.push({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Настраивает мониторинг сетевых запросов
   */
  private setupNetworkMonitoring(): void {
    if ('PerformanceObserver' in window) {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'resource') {
              const resourceEntry = entry as PerformanceResourceTiming;
              this.networkRequests.push({
                url: resourceEntry.name,
                method: 'GET', // Performance API не предоставляет метод
                status: this.extractStatusFromUrl(resourceEntry.name),
                duration: resourceEntry.duration,
                timestamp: new Date().toISOString()
              });
            }
          });
        });

        this.performanceObserver.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.warn('PerformanceObserver not supported:', error);
      }
    }
  }

  /**
   * Настраивает мониторинг производительности
   */
  private setupPerformanceMonitoring(): void {
    // Дополнительные метрики можно добавить здесь
  }

  /**
   * Получает видимые элементы на странице
   */
  private getVisibleElements(limit: number): string[] {
    const elements: string[] = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          const element = node as Element;
          const rect = element.getBoundingClientRect();
          const isVisible = rect.width > 0 && rect.height > 0 && 
                           rect.top >= 0 && rect.left >= 0 &&
                           rect.bottom <= window.innerHeight && 
                           rect.right <= window.innerWidth;
          
          return isVisible ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      }
    );

    let node;
    while ((node = walker.nextNode()) && elements.length < limit) {
      const element = node as Element;
      if (element.tagName && element.id) {
        elements.push(`#${element.id}`);
      } else if (element.tagName && element.className) {
        elements.push(`.${element.className.split(' ')[0]}`);
      } else if (element.tagName) {
        elements.push(element.tagName.toLowerCase());
      }
    }

    return elements;
  }

  /**
   * Получает состояние форм на странице
   */
  private getFormStates(): Record<string, any> {
    const formStates: Record<string, any> = {};
    const forms = document.querySelectorAll('form');

    forms.forEach((form, index) => {
      const formId = form.id || `form-${index}`;
      const formData: any = {};

      // Собираем данные из полей формы
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach((input) => {
        const element = input as HTMLInputElement;
        if (element.name) {
          formData[element.name] = {
            type: element.type,
            value: element.type === 'password' ? '[HIDDEN]' : element.value,
            required: element.required,
            disabled: element.disabled
          };
        }
      });

      formStates[formId] = formData;
    });

    return formStates;
  }

  /**
   * Создает селектор для элемента
   */
  private getElementSelector(element: Element): string {
    if (element.id) {
      return `#${element.id}`;
    }

    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.trim());
      if (classes.length > 0) {
        return `.${classes[0]}`;
      }
    }

    // Создаем путь к элементу
    const path: string[] = [];
    let current: Element | null = element;

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      
      if (current.id) {
        selector += `#${current.id}`;
        path.unshift(selector);
        break;
      }
      
      if (current.className) {
        const classes = current.className.split(' ').filter(c => c.trim());
        if (classes.length > 0) {
          selector += `.${classes[0]}`;
        }
      }

      path.unshift(selector);
      current = current.parentElement;
    }

    return path.join(' > ');
  }

  /**
   * Извлекает статус код из URL (приблизительно)
   */
  private extractStatusFromUrl(url: string): number | undefined {
    // Это упрощенная логика, в реальности нужно анализировать ответы
    if (url.includes('error') || url.includes('404')) return 404;
    if (url.includes('500')) return 500;
    return 200; // Предполагаем успешный ответ
  }

  /**
   * Очищает собранные данные
   */
  clear(): void {
    this.errorLog = [];
    this.networkRequests = [];
  }

  /**
   * Уничтожает наблюдатели
   */
  destroy(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}
