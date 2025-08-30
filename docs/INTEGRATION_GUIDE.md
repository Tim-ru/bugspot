# Руководство по интеграции BugSpot Widget

## Быстрый старт

### 1. Простое подключение

Добавьте одну строку в `<head>` вашего HTML:

```html
<script src="https://cdn.bugspot.io/widget.js" data-project-id="YOUR_PROJECT_ID"></script>
```

### 2. Расширенная конфигурация

```html
<script>
window.bugSpotConfig = {
  apiKey: 'your-api-key',
  position: 'bottom-right',
  primaryColor: '#3B82F6',
  enableScreenshot: true,
  showPreview: true,
  autoInit: true
};
</script>
<script src="https://cdn.bugspot.io/widget.js"></script>
```

## Интеграция с фреймворками

### React

#### Простая интеграция

```jsx
import React, { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Инициализация виджета
    if (window.BugSpot) {
      window.BugSpot.init({
        apiKey: process.env.REACT_APP_BUGSPOT_API_KEY,
        position: 'bottom-right'
      });
    }
  }, []);

  return (
    <div className="App">
      {/* Ваше приложение */}
    </div>
  );
}
```

#### React Hook

```jsx
// hooks/useBugSpot.js
import { useEffect, useRef } from 'react';

export function useBugSpot(config) {
  const widgetRef = useRef(null);

  useEffect(() => {
    if (window.BugSpot && !widgetRef.current) {
      widgetRef.current = window.BugSpot.init(config);
    }

    return () => {
      // Очистка при размонтировании
      if (widgetRef.current) {
        widgetRef.current.destroy?.();
      }
    };
  }, [config]);

  return widgetRef.current;
}

// Использование
function App() {
  const bugSpot = useBugSpot({
    apiKey: process.env.REACT_APP_BUGSPOT_API_KEY,
    position: 'bottom-right'
  });

  const handleError = () => {
    bugSpot?.openModal();
  };

  return (
    <div>
      <button onClick={handleError}>Report Bug</button>
    </div>
  );
}
```

### Vue.js

#### Vue 3 Composition API

```vue
<template>
  <div id="app">
    <!-- Ваше приложение -->
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const bugSpotWidget = ref(null);

onMounted(() => {
  if (window.BugSpot) {
    bugSpotWidget.value = window.BugSpot.init({
      apiKey: import.meta.env.VITE_BUGSPOT_API_KEY,
      position: 'bottom-right'
    });
  }
});

onUnmounted(() => {
  if (bugSpotWidget.value) {
    bugSpotWidget.value.destroy?.();
  }
});
</script>
```

#### Vue Plugin

```javascript
// plugins/bugspot.js
export default {
  install(app, options) {
    app.config.globalProperties.$bugSpot = null;
    
    app.mixin({
      mounted() {
        if (window.BugSpot && !this.$bugSpot) {
          this.$bugSpot = window.BugSpot.init(options);
        }
      },
      beforeUnmount() {
        if (this.$bugSpot) {
          this.$bugSpot.destroy?.();
        }
      }
    });
  }
};

// main.js
import BugSpotPlugin from './plugins/bugspot';

app.use(BugSpotPlugin, {
  apiKey: import.meta.env.VITE_BUGSPOT_API_KEY,
  position: 'bottom-right'
});
```

### Angular

#### Angular Service

```typescript
// services/bug-spot.service.ts
import { Injectable, OnDestroy } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BugSpotService implements OnDestroy {
  private widget: any = null;

  constructor() {
    this.initWidget();
  }

  private initWidget() {
    if ((window as any).BugSpot) {
      this.widget = (window as any).BugSpot.init({
        apiKey: environment.bugSpotApiKey,
        position: 'bottom-right'
      });
    }
  }

  openModal() {
    this.widget?.openModal();
  }

  submitReport(report: any) {
    return this.widget?.submitReport(report);
  }

  ngOnDestroy() {
    this.widget?.destroy?.();
  }
}

// app.component.ts
import { Component } from '@angular/core';
import { BugSpotService } from './services/bug-spot.service';

@Component({
  selector: 'app-root',
  template: `
    <div>
      <button (click)="reportBug()">Report Bug</button>
    </div>
  `
})
export class AppComponent {
  constructor(private bugSpotService: BugSpotService) {}

  reportBug() {
    this.bugSpotService.openModal();
  }
}
```

### Next.js

#### Next.js с App Router

```typescript
// app/layout.tsx
import Script from 'next/script';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          id="bugspot-config"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.bugSpotConfig = {
                apiKey: '${process.env.NEXT_PUBLIC_BUGSPOT_API_KEY}',
                position: 'bottom-right',
                enableScreenshot: true
              };
            `,
          }}
        />
        <Script
          src="https://cdn.bugspot.io/widget.js"
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

#### Next.js с Pages Router

```typescript
// pages/_app.tsx
import { useEffect } from 'react';
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (window.BugSpot && window.bugSpotConfig) {
      window.BugSpot.init(window.bugSpotConfig);
    }
  }, []);

  return (
    <>
      <Script
        id="bugspot-config"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.bugSpotConfig = {
              apiKey: '${process.env.NEXT_PUBLIC_BUGSPOT_API_KEY}',
              position: 'bottom-right'
            };
          `,
        }}
      />
      <Script
        src="https://cdn.bugspot.io/widget.js"
        strategy="afterInteractive"
      />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
```

### Nuxt.js

#### Nuxt 3 Plugin

```typescript
// plugins/bugspot.client.ts
export default defineNuxtPlugin(() => {
  if (process.client) {
    const config = useRuntimeConfig();
    
    // Конфигурация виджета
    (window as any).bugSpotConfig = {
      apiKey: config.public.bugSpotApiKey,
      position: 'bottom-right',
      enableScreenshot: true
    };

    // Загрузка скрипта
    const script = document.createElement('script');
    script.src = 'https://cdn.bugspot.io/widget.js';
    script.onload = () => {
      if ((window as any).BugSpot) {
        (window as any).BugSpot.init((window as any).bugSpotConfig);
      }
    };
    document.head.appendChild(script);
  }
});
```

#### Nuxt Config

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      bugSpotApiKey: process.env.BUGSPOT_API_KEY
    }
  },
  
  app: {
    head: {
      script: [
        {
          src: 'https://cdn.bugspot.io/widget.js',
          defer: true
        }
      ]
    }
  }
});
```

## Интеграция с CMS

### WordPress

#### WordPress Plugin

```php
<?php
/*
Plugin Name: BugSpot Widget
Description: Integrate BugSpot bug reporting widget
Version: 1.0
*/

function bugspot_enqueue_script() {
    wp_enqueue_script(
        'bugspot-widget',
        'https://cdn.bugspot.io/widget.js',
        array(),
        '1.0.0',
        true
    );
    
    wp_add_inline_script('bugspot-widget', '
        window.bugSpotConfig = {
            apiKey: "' . get_option('bugspot_api_key') . '",
            position: "' . get_option('bugspot_position', 'bottom-right') . '",
            enableScreenshot: ' . (get_option('bugspot_screenshot', true) ? 'true' : 'false') . '
        };
    ');
}
add_action('wp_enqueue_scripts', 'bugspot_enqueue_script');
```

### Shopify

#### Shopify Theme Integration

```liquid
<!-- snippets/bugspot-widget.liquid -->
<script>
window.bugSpotConfig = {
  apiKey: '{{ settings.bugspot_api_key }}',
  position: '{{ settings.bugspot_position | default: "bottom-right" }}',
  enableScreenshot: {{ settings.bugspot_screenshot | default: true }},
  primaryColor: '{{ settings.bugspot_color | default: "#3B82F6" }}'
};
</script>
<script src="https://cdn.bugspot.io/widget.js" defer></script>

<!-- В theme.liquid -->
{% render 'bugspot-widget' %}
```

## Программное API

### JavaScript API

```javascript
// Инициализация
const widget = BugSpot.init({
  apiKey: 'your-api-key',
  position: 'bottom-right',
  enableScreenshot: true
});

// Открытие модального окна
widget.openModal();

// Закрытие модального окна
widget.closeModal();

// Отправка отчета программно
widget.submitReport({
  title: 'Custom Error Report',
  description: 'This is a programmatically submitted report',
  severity: 'high',
  userEmail: 'user@example.com'
});

// События
widget.on('modalOpened', () => {
  console.log('Modal opened');
});

widget.on('reportSubmitted', (report) => {
  console.log('Report submitted:', report);
});

widget.on('screenshotCaptured', (screenshot) => {
  console.log('Screenshot captured:', screenshot);
});

// Уничтожение виджета
widget.destroy();
```

### TypeScript типы

```typescript
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

interface BugSpotWidget {
  openModal(): void;
  closeModal(): void;
  submitReport(report: BugReport): Promise<void>;
  on(event: string, callback: Function): void;
  off(event: string, callback: Function): void;
  destroy(): void;
}

declare global {
  interface Window {
    BugSpot: {
      init(config: BugSpotConfig): BugSpotWidget;
      version: string;
    };
    bugSpotConfig?: BugSpotConfig;
  }
}
```

## Настройка и кастомизация

### CSS кастомизация

```css
/* Кастомизация виджета */
.bugspot-widget .bugspot-button {
  /* Ваши стили */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.bugspot-modal .bugspot-modal-content {
  /* Кастомизация модального окна */
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.bugspot-modal .bugspot-submit {
  /* Кастомизация кнопки отправки */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

### Конфигурация по умолчанию

```javascript
const defaultConfig = {
  // Позиция виджета
  position: 'bottom-right',
  
  // Цветовая схема
  primaryColor: '#3B82F6',
  
  // Функциональность
  enableScreenshot: true,
  showPreview: true,
  autoInit: true,
  
  // API
  apiUrl: 'https://api.bugspot.dev',
  
  // Локализация
  locale: 'en',
  
  // Кастомизация
  customFields: [],
  requiredFields: ['title', 'description'],
  
  // Уведомления
  showNotifications: true,
  notificationDuration: 3000
};
```

## Обработка ошибок

### Обработка сетевых ошибок

```javascript
const widget = BugSpot.init({
  apiKey: 'your-api-key',
  onError: (error) => {
    console.error('BugSpot error:', error);
    
    // Сохранение отчета локально при ошибке сети
    if (error.type === 'network') {
      saveReportLocally(error.report);
    }
  }
});

function saveReportLocally(report) {
  const reports = JSON.parse(localStorage.getItem('bugspot_offline_reports') || '[]');
  reports.push({
    ...report,
    timestamp: new Date().toISOString(),
    status: 'pending'
  });
  localStorage.setItem('bugspot_offline_reports', JSON.stringify(reports));
}
```

### Синхронизация офлайн отчетов

```javascript
// Синхронизация при восстановлении соединения
window.addEventListener('online', () => {
  const offlineReports = JSON.parse(localStorage.getItem('bugspot_offline_reports') || '[]');
  
  offlineReports.forEach(async (report) => {
    try {
      await widget.submitReport(report);
      // Удаляем успешно отправленный отчет
      const updatedReports = offlineReports.filter(r => r.id !== report.id);
      localStorage.setItem('bugspot_offline_reports', JSON.stringify(updatedReports));
    } catch (error) {
      console.error('Failed to sync report:', error);
    }
  });
});
```

## Заключение

BugSpot Widget предоставляет простой и гибкий способ интеграции системы отчетов об ошибках в любое веб-приложение. Основные преимущества:

- ✅ **Простота интеграции** - одна строка кода
- ✅ **Гибкость** - поддержка всех популярных фреймворков
- ✅ **Кастомизация** - настройка под дизайн приложения
- ✅ **Надежность** - обработка ошибок и офлайн режим
- ✅ **Производительность** - минимальное влияние на сайт

Выберите подходящий способ интеграции для вашего проекта и начните получать качественные отчеты об ошибках от пользователей!
