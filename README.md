# BugSpot - Bug Reporting Widget

BugSpot - это легковесный виджет для сбора отчетов об ошибках, который можно легко интегрировать в любой веб-сайт.

## Быстрый старт (Development)

### Mock режим (без backend)

```bash
# Установка зависимостей
npm install

# Создайте .env.local файл
echo "VITE_USE_MOCK=true" > .env.local

# Запуск dev сервера
npm run dev
```

### Полный режим (с backend)

```bash
# Установка зависимостей
npm install

# Настройте переменные окружения (см. docs/DEPLOYMENT.md)
cp .env.example .env
# Отредактируйте .env и добавьте Supabase ключи

# Запуск сервера и frontend
npm run dev:full
```

## Встраивание виджета локально

```bash
# Сборка виджета
npm run build:widget

# Виджет будет доступен в widget/dist/widget.js
# Используйте его локально или загрузите на CDN
```

## Переменные окружения

### Development

Создайте `.env.local` для frontend:

```env
VITE_USE_MOCK=true  # Использовать mock API
```

Создайте `.env` в корне для backend:

```env
NODE_ENV=development
PORT=3001
JWT_SECRET=dev-secret-key-change-in-production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AI_ANALYSIS_ENABLED=false
```

### Production

⚠️ **ВАЖНО**: См. [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) для полной инструкции по деплою.

Обязательные переменные:
- `JWT_SECRET` - случайная строка (генерируйте: `openssl rand -base64 32`)
- `SUPABASE_URL` - URL вашего Supabase проекта
- `SUPABASE_SERVICE_ROLE_KEY` - service role ключ из Supabase

## Документация

- [Руководство по деплою](docs/DEPLOYMENT.md) - полная инструкция по деплою в production
- [Руководство по интеграции](docs/INTEGRATION_GUIDE.md) - как интегрировать виджет
- [API документация](docs/API.md) - описание API endpoints
- [Quick Start для пилотов](docs/PILOT_QUICKSTART.md) - быстрый старт для первых пользователей

## Структура проекта

```
bugspot/
├── src/              # Frontend Dashboard (React)
├── server/           # Backend API (Express)
├── widget/           # Виджет для встраивания
├── docs/             # Документация
└── supabase/         # Миграции базы данных
```

## Основные команды

```bash
# Development
npm run dev              # Запуск frontend dev сервера
npm run server           # Запуск backend сервера
npm run dev:full         # Запуск frontend + backend

# Build
npm run build            # Сборка frontend dashboard
npm run build:widget      # Сборка виджета

# Production
npm start                # Запуск production сервера
```

## Безопасность

⚠️ **КРИТИЧЕСКИ ВАЖНО**: 

1. Никогда не коммитьте `.env` файлы в git
2. Всегда используйте уникальный `JWT_SECRET` в production
3. Храните `SUPABASE_SERVICE_ROLE_KEY` в секрете
4. Используйте HTTPS в production

## Поддержка

- Документация: [docs/](docs/)
- Проблемы: создайте issue в репозитории

## Лицензия

MIT
