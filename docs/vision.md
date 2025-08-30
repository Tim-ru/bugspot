# BugSpot - Техническое видение проекта

## Содержание

1. [Технологии](#технологии)
2. [Принципы разработки](#принципы-разработки)
3. [Структура проекта](#структура-проекта)
4. [Архитектура проекта](#архитектура-проекта)
5. [Модель данных](#модель-данных)
6. [Работа с AI](#работа-с-ai)
7. [Мониторинг багов](#мониторинг-багов)
8. [Сценарии работы](#сценарии-работы)
9. [Деплой](#деплой)
10. [Подход к конфигурированию](#подход-к-конфигурированию)
11. [Подход к логгированию](#подход-к-логгированию)

---

## Технологии

*[Раздел в разработке - требует согласования]*

### Предлагаемый стек технологий

#### Frontend
- **React 18** + **TypeScript** - основная клиентская библиотека
- **Vite** - сборщик и dev-сервер
- **Tailwind CSS** - стилизация
- **React Router** - навигация
- **Lucide React** - иконки

#### Backend
- **Node.js 18+** - серверная платформа
- **Express.js** - веб-фреймворк
- **TypeScript** - типизация
- **SQLite** - база данных (для MVP)
- **JWT** - аутентификация

#### Виджет
- **Vanilla JavaScript** - легковесность
- **html2canvas** - скриншоты
- **Webpack/Vite** - сборка

#### Инфраструктура
- **Docker** - контейнеризация
- **Nginx** - reverse proxy
- **PM2** - process manager

#### Мониторинг и аналитика
- **Winston** - логирование
- **Sentry** - мониторинг ошибок
- **Prometheus + Grafana** - метрики

### Принятые решения для MVP:

#### База данных
- **SQLite** - для быстрого запуска и простоты
- **Миграция на PostgreSQL** - при достижении 1000+ пользователей

#### Контейнеризация
- **Без Docker** - простой деплой на VPS для быстрого старта
- **PM2** - process manager для продакшена

#### Мониторинг
- **Winston** - структурированное логирование
- **UptimeRobot** - мониторинг доступности (бесплатно)
- **Google Analytics** - аналитика лендинга

#### Дополнительные технологии
- **Multer** - обработка загрузки файлов
- **Joi** - валидация API запросов
- **Rate limiting** - защита от злоупотреблений

### Финальный стек для MVP:

#### Frontend
- **React 18** + **TypeScript** - основная клиентская библиотека
- **Vite** - сборщик и dev-сервер
- **Tailwind CSS** - стилизация
- **React Router** - навигация
- **Lucide React** - иконки

#### Backend
- **Node.js 18+** - серверная платформа
- **Express.js** - веб-фреймворк
- **TypeScript** - типизация
- **SQLite** - база данных
- **JWT** - аутентификация
- **Multer** - обработка файлов
- **Joi** - валидация данных

#### Виджет
- **Vanilla JavaScript** - легковесность
- **html2canvas** - скриншоты
- **Vite** - сборка

#### Инфраструктура
- **PM2** - process manager
- **Nginx** - reverse proxy (опционально)
- **VPS** - хостинг

#### Мониторинг
- **Winston** - логирование
- **UptimeRobot** - мониторинг доступности
- **Google Analytics** - аналитика

---

## Принципы разработки

### Архитектурные принципы

#### Clean Architecture
- **Entities** - бизнес-сущности (BugReport, User, Project)
- **Use Cases** - бизнес-логика (CreateBugReport, AuthenticateUser)
- **Interface Adapters** - адаптеры для внешних систем (API, Database)
- **Frameworks & Drivers** - внешние зависимости (Express, SQLite)

**Структура по слоям:**
```
src/
├── domain/          # Entities & Use Cases
├── application/     # Interface Adapters
├── infrastructure/  # Frameworks & Drivers
└── presentation/    # UI Components
```

#### SOLID принципы
- **Single Responsibility** - каждый модуль отвечает за одну задачу
- **Open/Closed** - открыт для расширения, закрыт для модификации
- **Liskov Substitution** - подтипы взаимозаменяемы
- **Interface Segregation** - много специфичных интерфейсов
- **Dependency Inversion** - зависимости от абстракций

### Практические принципы

#### KISS (Keep It Simple, Stupid)
- Простые решения лучше сложных
- Минимум зависимостей
- Понятный код без "магии"

#### MVP-first подход
- Функциональность важнее красоты кода
- Быстрые итерации
- Рефакторинг по мере роста

#### Безопасность с самого начала
- Валидация всех входных данных
- Rate limiting (100 req/min)
- JWT токены с коротким сроком жизни (24h)
- HTTPS везде

#### Производительность
- Виджет < 50KB gzipped
- API ответы < 200ms
- Ленивая загрузка компонентов

### Инструменты разработки

#### Code Quality
- **Prettier** - форматирование кода
- **ESLint** - статический анализ (опционально)
- **TypeScript** - типизация

#### Тестирование
- **Ручное тестирование** - основной подход для MVP
- **Jest + React Testing Library** - базовые unit-тесты (2-3 примера)
- **Postman/Insomnia** - тестирование API

#### Пример простого теста:
```typescript
// tests/bugReport.test.ts
describe('BugReport Entity', () => {
  test('should create bug report with required fields', () => {
    const bugReport = new BugReport({
      title: 'Button not working',
      description: 'Login button does not respond',
      projectId: 1
    });
    
    expect(bugReport.title).toBe('Button not working');
    expect(bugReport.status).toBe('open');
  });
});
```

---

## Структура проекта

### Общая архитектура

Проект разделен на три основные части:
- **Frontend** - React приложение (dashboard)
- **Backend** - Express API сервер
- **Widget** - Vanilla JS виджет для встраивания

### Детальная структура

```
bugspot/
├── src/                    # Frontend (React Dashboard)
│   ├── domain/            # Бизнес-логика
│   │   ├── entities/      # BugReport, User, Project
│   │   ├── useCases/      # CreateBugReport, AuthenticateUser
│   │   └── interfaces/    # Repository interfaces
│   ├── application/       # Адаптеры
│   │   ├── api/          # API клиенты
│   │   ├── services/     # Business services
│   │   └── stores/       # State management
│   ├── infrastructure/   # Внешние зависимости
│   │   ├── config/       # Конфигурация
│   │   └── utils/        # Утилиты
│   └── presentation/     # UI компоненты
│       ├── components/   # React компоненты
│       ├── pages/        # Страницы
│       └── router/       # Роутинг
├── server/               # Backend (Express API)
│   ├── domain/          # Бизнес-логика
│   │   ├── entities/    # Domain entities
│   │   ├── useCases/    # Business logic
│   │   └── interfaces/  # Repository interfaces
│   ├── application/     # Адаптеры
│   │   ├── controllers/ # Route controllers
│   │   ├── services/    # Business services
│   │   └── middleware/  # Express middleware
│   ├── infrastructure/  # Внешние зависимости
│   │   ├── database/    # SQLite repositories
│   │   ├── config/      # Конфигурация
│   │   └── utils/       # Утилиты
│   └── routes/          # Express routes
├── widget/              # Виджет (Vanilla JS)
│   ├── src/            # Исходный код виджета
│   ├── dist/           # Сборка виджета
│   └── config/         # Конфигурация виджета
├── tests/              # Тесты (отдельная папка)
│   ├── unit/           # Unit тесты
│   ├── integration/    # Integration тесты
│   └── e2e/            # End-to-end тесты
├── docs/               # Документация
├── dist/               # Сборка frontend
└── database/           # SQLite файлы
```

### Принципы организации

#### Разделение ответственности
- **Frontend** - только UI и взаимодействие с API
- **Backend** - бизнес-логика и данные
- **Widget** - независимый компонент для встраивания

#### Clean Architecture в каждой части
- **Domain** - бизнес-сущности и правила
- **Application** - use cases и адаптеры
- **Infrastructure** - внешние зависимости
- **Presentation** - UI (только в frontend)

#### Тестирование
- **Отдельная папка tests/** - все тесты в одном месте
- **Unit тесты** - для бизнес-логики
- **Integration тесты** - для API
- **E2E тесты** - для критических сценариев

---

## Архитектура проекта

### Общая архитектура

```
┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐
│   Client Sites  │ ◄──────────────► │   BugSpot API   │
│  (Widget)       │                  │   (Express)     │
└─────────────────┘                  └─────────────────┘
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │   SQLite DB     │
                                    └─────────────────┘

┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐
│   Dashboard     │ ◄──────────────► │   BugSpot API   │
│   (Next.js)     │                  │   (Express)     │
└─────────────────┘                  └─────────────────┘
```

### Компонентная архитектура

#### 1. Widget (Vanilla JS)
- **Изолированный компонент** - не зависит от других частей
- **Минимальный размер** - < 50KB gzipped
- **Автономность** - работает без внешних зависимостей
- **Безопасность** - только отправка данных, никакой логики

#### 2. Backend (Express API)
- **RESTful API** - стандартные HTTP методы
- **JWT аутентификация** - для dashboard
- **API Key аутентификация** - для widget
- **Rate limiting** - защита от злоупотреблений
- **Валидация данных** - Joi схемы

#### 3. Frontend (Next.js Dashboard)
- **SSR/SSG** - для лендинга и dashboard
- **Redux Toolkit** - state management
- **RTK Query** - API клиент с кэшированием
- **App Router** - современный роутинг Next.js 14

### Гибридный подход для MVP

#### Фаза 1: MVP (текущий стек)
- **React + Vite** - dashboard
- **Express API** - backend
- **Vanilla JS** - widget
- **SQLite** - база данных

#### Фаза 2: Миграция на Next.js
- **Next.js 14** - dashboard и лендинг
- **Redux Toolkit + RTK Query** - state management
- **Express API** - оставляем как есть
- **shadcn/ui** - компоненты UI

#### Фаза 3: Оптимизация
- **SSR** для лендинга (SEO)
- **ISR** для dashboard (производительность)
- **API Routes** - постепенная миграция

### Технические решения

#### State Management
- **Redux Toolkit** - основной state
- **RTK Query** - API клиент и кэширование
- **DevTools** - отладка

#### UI/UX
- **Tailwind CSS** - стилизация
- **shadcn/ui** - готовые компоненты
- **Lucide React** - иконки

#### Производительность
- **Next.js Image** - оптимизация изображений
- **Dynamic imports** - ленивая загрузка
- **Bundle analyzer** - контроль размера

---

## Модель данных

### Основные сущности

#### 1. Users (Пользователи)
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free',
  settings TEXT DEFAULT '{}', -- JSON настройки пользователя
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. Projects (Проекты)
```sql
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  domain TEXT,
  api_key TEXT UNIQUE NOT NULL,
  settings TEXT DEFAULT '{}', -- JSON настройки виджета
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 3. BugReports (Баг-репорты)
```sql
CREATE TABLE bug_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'normal',
  screenshot TEXT, -- base64 для MVP, файлы позже
  environment TEXT, -- JSON данные окружения
  user_email TEXT,
  user_agent TEXT,
  url TEXT,
  steps TEXT, -- JSON массив шагов
  tags TEXT, -- JSON массив тегов
  metadata TEXT, -- JSON дополнительные данные
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

### Принятые решения для MVP:

#### Дополнительные поля
- ✅ **Priority** - для приоритизации багов
- ✅ **Tags** - для категоризации
- ✅ **Metadata** - для расширяемости

#### Скриншоты
- **Base64 в БД** - для MVP (простота)
- **Файловая система** - для продакшена (производительность)

#### Аудит
- **Базовый аудит** - `created_at`, `updated_at`
- **Расширенный аудит** - добавим позже при необходимости

#### Мягкое удаление
- **Без мягкого удаления** - для MVP (простота)
- **Добавим позже** - при росте данных

### Индексы для производительности

```sql
-- Индексы для быстрого поиска
CREATE INDEX idx_bug_reports_project_id ON bug_reports(project_id);
CREATE INDEX idx_bug_reports_status ON bug_reports(status);
CREATE INDEX idx_bug_reports_created_at ON bug_reports(created_at);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_users_email ON users(email);
```

### JSON поля (SQLite)

```sql
-- Примеры использования JSON полей
-- settings в projects
{
  "widgetPosition": "bottom-right",
  "primaryColor": "#3B82F6",
  "enableScreenshot": true,
  "showPreview": true
}

-- environment в bug_reports
{
  "userAgent": "Mozilla/5.0...",
  "viewport": "1920x1080",
  "screen": "1920x1080",
  "language": "en-US",
  "platform": "Win32"
}

-- metadata in bug_reports
{
  "browser": "Chrome",
  "version": "120.0.0.0",
  "os": "Windows 10",
  "timezone": "Europe/Moscow"
}
```

---

## Работа с AI

### Стратегия AI для MVP

#### Принятые решения:
- **OpenAI GPT-4** - основной AI провайдер
- **AI функции как премиум-фича** - в платных планах
- **Минимальный набор функций** - для быстрого старта
- **Безопасность данных** - не отправляем приватные данные в AI

### AI функции по планам

#### Free Plan (без AI)
- Базовая категоризация по ключевым словам
- Простые теги на основе заголовка

#### Pro Plan ($19/month) - AI включен
- **Автоматический приоритет багов**
- **Умная категоризация**
- **Похожие баги в проекте**

#### Enterprise Plan ($99/month) - Расширенный AI
- **Автоматическое резюме багов**
- **Предложения по исправлению**
- **Анализ трендов**

### Техническая реализация

#### MVP AI функции (Pro Plan)

##### 1. Автоматический приоритет
```typescript
// Анализ заголовка и описания
const analyzePriority = async (title: string, description: string) => {
  const prompt = `
    Analyze this bug report and assign priority (low/medium/high/critical):
    Title: ${title}
    Description: ${description}
    
    Consider:
    - User impact
    - Business impact
    - Frequency of occurrence
    - Security implications
    
    Return only: low, medium, high, or critical
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 10
  });
  
  return response.choices[0].message.content;
};
```

##### 2. Умная категоризация
```typescript
// Автоматические теги
const generateTags = async (title: string, description: string) => {
  const prompt = `
    Generate 3-5 relevant tags for this bug report:
    Title: ${title}
    Description: ${description}
    
    Return only: tag1, tag2, tag3, tag4, tag5
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 50
  });
  
  return response.choices[0].message.content.split(', ');
};
```

##### 3. Похожие баги
```typescript
// Поиск похожих багов в проекте
const findSimilarBugs = async (newBug: BugReport, existingBugs: BugReport[]) => {
  const prompt = `
    Find similar bugs from this list:
    New bug: ${newBug.title} - ${newBug.description}
    
    Existing bugs:
    ${existingBugs.map(bug => `${bug.id}: ${bug.title}`).join('\n')}
    
    Return only bug IDs that are similar (max 3): id1, id2, id3
  `;
  
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 20
  });
  
  return response.choices[0].message.content.split(', ');
};
```

### Экономика AI

#### Стоимость (примерно):
- **GPT-3.5-turbo**: $0.002 за 1K токенов
- **Средний баг-репорт**: ~200 токенов
- **Стоимость анализа**: ~$0.0004 за баг

#### Лимиты по планам:
- **Free**: 0 AI запросов
- **Pro**: 1000 AI запросов/месяц
- **Enterprise**: 10000 AI запросов/месяц

### Безопасность и приватность

#### Защита данных:
- **Не отправляем** скриншоты в AI
- **Анонимизируем** пользовательские данные
- **Логируем** все AI запросы
- **Rate limiting** для AI функций

#### Fallback механизмы:
- **Простая логика** если AI недоступен
- **Кэширование** результатов
- **Graceful degradation** при ошибках

---
