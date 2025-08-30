# BugSpot Widget

Легковесный виджет для сбора bug reports с веб-сайтов. Реализован с использованием Clean Architecture и TypeScript.

## 📦 Размер

- **Размер файла**: 15.42 kB
- **Gzipped**: 4.54 kB
- **Цель**: < 50 kB ✅

## 🚀 Быстрый старт

### 1. Подключение виджета

```html
<!-- Конфигурация виджета -->
<script>
window.bugSpotConfig = {
  apiKey: 'your-api-key-here',
  apiUrl: 'https://api.bugspot.dev',
  position: 'bottom-right',
  primaryColor: '#3B82F6',
  enableScreenshot: true
};
</script>

<!-- Загрузка виджета -->
<script src="https://api.bugspot.dev/widget.js"></script>
```

### 2. Программная инициализация

```javascript
// Инициализация с кастомной конфигурацией
const widget = window.BugSpot.init({
  apiKey: 'your-api-key-here',
  apiUrl: 'https://api.bugspot.dev',
  position: 'top-left',
  primaryColor: '#EF4444',
  enableScreenshot: false
});

// Уничтожение виджета
widget.destroy();
```

## ⚙️ Конфигурация

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| `apiKey` | `string` | **обязательный** | API ключ проекта |
| `apiUrl` | `string` | `'https://api.bugspot.dev'` | URL API сервера |
| `position` | `string` | `'bottom-right'` | Позиция кнопки: `'top-left'`, `'top-right'`, `'bottom-left'`, `'bottom-right'` |
| `primaryColor` | `string` | `'#3B82F6'` | Основной цвет виджета |
| `enableScreenshot` | `boolean` | `true` | Включить автоматические скриншоты |
| `showPreview` | `boolean` | `true` | Показывать предпросмотр скриншота |
| `autoInit` | `boolean` | `true` | Автоматическая инициализация |

## 🏗️ Архитектура

Виджет построен по принципам Clean Architecture:

```
widget/src/
├── domain/              # Бизнес-логика
│   ├── entities/        # Сущности (BugReport, EnvironmentData)
│   ├── useCases/        # Use Cases (CreateBugReport)
│   └── interfaces/      # Интерфейсы репозиториев
├── application/         # Адаптеры
│   ├── api/            # API клиенты
│   └── services/       # Сервисы (ScreenshotService)
└── presentation/       # UI компоненты
    ├── components/     # Компоненты (WidgetButton, Modal)
    └── BugSpotWidget.tsx # Главный класс виджета
```

## 🔧 Разработка

### Установка зависимостей

```bash
npm install
```

### Сборка виджета

```bash
npm run build:widget
```

### Тестирование

Откройте `widget/test.html` в браузере для тестирования функционала.

## 📊 Собираемые данные

Виджет автоматически собирает:

- **User Agent** браузера
- **URL** текущей страницы
- **Разрешение экрана** и viewport
- **Временная зона** и язык
- **Скриншот** страницы (опционально)
- **Пользовательские данные** (email, описание, приоритет)

## 🔄 Fallback механизм

При недоступности API виджет автоматически сохраняет отчеты в localStorage для последующей синхронизации.

## 🛡️ Безопасность

- Валидация всех входных данных
- Защита от XSS
- HTTPS для всех запросов
- Rate limiting на API

## 📱 Совместимость

- **Браузеры**: IE11+, Chrome, Firefox, Safari, Edge
- **Мобильные**: iOS Safari, Chrome Mobile
- **Размер**: < 50KB gzipped

## 🐛 Отладка

```javascript
// Включить отладочные логи
window.bugSpotConfig = {
  debug: true,
  // ... остальная конфигурация
};
```

## 📄 Лицензия

MIT License
