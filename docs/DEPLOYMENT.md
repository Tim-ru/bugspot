# BugSpot - Руководство по деплою

## Обзор

Это руководство описывает процесс деплоя BugSpot в production окружение. BugSpot состоит из трех основных компонентов:

1. **Frontend Dashboard** - React приложение для управления баг-репортами
2. **Backend API** - Express.js сервер с REST API
3. **Widget** - JavaScript виджет для встраивания на сайты клиентов

## Требования

- Node.js 18+ 
- npm или pnpm
- Supabase проект (для базы данных)
- VPS или облачный хостинг (например, DigitalOcean, AWS, Heroku)

## Переменные окружения

### Обязательные переменные

Создайте файл `.env` в корне проекта со следующими переменными:

```env
# Node Environment
NODE_ENV=production

# Server Configuration
PORT=3001

# JWT Secret (ОБЯЗАТЕЛЬНО измените на случайную строку!)
# Генерируйте безопасный ключ: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Analysis (опционально)
AI_ANALYSIS_ENABLED=false
```

### Генерация JWT_SECRET

**КРИТИЧЕСКИ ВАЖНО**: Никогда не используйте значение по умолчанию в production!

Генерируйте безопасный ключ одним из способов:

```bash
# Используя OpenSSL
openssl rand -base64 32

# Используя Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Получение Supabase ключей

1. Зайдите в [Supabase Dashboard](https://app.supabase.com)
2. Выберите ваш проект
3. Перейдите в Settings → API
4. Скопируйте:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (НЕ anon key!)

⚠️ **ВНИМАНИЕ**: `service_role` ключ имеет полный доступ к базе данных. Храните его в секрете!

## Настройка Supabase

### 1. Создание проекта

1. Создайте новый проект в [Supabase](https://app.supabase.com)
2. Дождитесь завершения инициализации проекта

### 2. Применение миграций

Миграции находятся в папке `supabase/migrations/`. Примените их через Supabase Dashboard:

1. Перейдите в SQL Editor
2. Откройте файл `supabase/migrations/20250610173141_frosty_brook.sql`
3. Скопируйте содержимое и выполните в SQL Editor
4. Повторите для `supabase/migrations/20250610173300_black_oasis.sql`

Или используйте Supabase CLI:

```bash
# Установите Supabase CLI
npm install -g supabase

# Логин
supabase login

# Свяжите проект
supabase link --project-ref your-project-ref

# Примените миграции
supabase db push
```

### 3. Проверка RLS политик

Убедитесь, что Row Level Security (RLS) включен для всех таблиц:

- `users`
- `projects`
- `bug_reports`
- `analytics`

Политики должны быть созданы автоматически при применении миграций.

## Сборка проекта

### 1. Установка зависимостей

```bash
npm install
```

### 2. Сборка Frontend Dashboard

```bash
npm run build
```

Это создаст папку `dist/` с собранным React приложением.

### 3. Сборка Widget

```bash
npm run build:widget
```

Это создаст файл `widget/dist/widget.js` - готовый виджет для встраивания.

## Деплой на VPS

### Вариант 1: PM2 (рекомендуется)

#### 1. Установка PM2

```bash
npm install -g pm2
```

#### 2. Запуск приложения

```bash
# Запуск в production режиме
NODE_ENV=production pm2 start server/index.js --name bugspot

# Сохранение конфигурации PM2
pm2 save

# Настройка автозапуска при перезагрузке
pm2 startup
```

#### 3. Мониторинг

```bash
# Просмотр логов
pm2 logs bugspot

# Статус приложения
pm2 status

# Перезапуск
pm2 restart bugspot
```

### Вариант 2: Systemd Service

Создайте файл `/etc/systemd/system/bugspot.service`:

```ini
[Unit]
Description=BugSpot API Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/bugspot
Environment=NODE_ENV=production
EnvironmentFile=/path/to/bugspot/.env
ExecStart=/usr/bin/node server/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Затем:

```bash
# Перезагрузите systemd
sudo systemctl daemon-reload

# Запустите сервис
sudo systemctl start bugspot

# Включите автозапуск
sudo systemctl enable bugspot

# Проверьте статус
sudo systemctl status bugspot
```

## Настройка Nginx (Reverse Proxy)

Создайте конфигурацию Nginx `/etc/nginx/sites-available/bugspot`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Редирект на HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    # Размер загрузки для скриншотов
    client_max_body_size 10M;

    # Frontend Dashboard
    location / {
        root /path/to/bugspot/dist;
        try_files $uri $uri/ /index.html;
    }

    # Widget endpoint
    location /widget.js {
        root /path/to/bugspot/widget/dist;
        add_header Content-Type application/javascript;
        add_header Access-Control-Allow-Origin *;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API endpoints
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Активируйте конфигурацию:

```bash
sudo ln -s /etc/nginx/sites-available/bugspot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Деплой на Heroku

### 1. Создание Heroku приложения

```bash
heroku create your-app-name
```

### 2. Настройка переменных окружения

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key
heroku config:set SUPABASE_URL=your-supabase-url
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Деплой

```bash
# Добавьте build скрипт в package.json
# "heroku-postbuild": "npm run build && npm run build:widget"

git push heroku main
```

## Деплой на Vercel / Netlify

### Frontend Dashboard

1. Подключите репозиторий к Vercel/Netlify
2. Настройте build команду: `npm run build`
3. Настройте output directory: `dist`
4. Добавьте переменные окружения для API URL

### Backend API

Backend должен быть развернут отдельно (VPS, Heroku, Railway и т.д.), так как Vercel/Netlify не поддерживают долгоживущие процессы.

## CDN для Widget (опционально)

Для лучшей производительности можно разместить виджет на CDN:

### Cloudflare Workers

```javascript
// worker.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  if (url.pathname === '/widget.js') {
    const widget = await fetch('https://your-domain.com/widget.js')
    return new Response(widget.body, {
      headers: {
        'Content-Type': 'application/javascript',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  }
  
  return fetch(request)
}
```

### AWS CloudFront / Cloudflare CDN

1. Загрузите `widget/dist/widget.js` в S3 bucket
2. Настройте CloudFront distribution
3. Используйте CDN URL для виджета

## Проверка деплоя

### 1. Health Check

```bash
curl https://your-domain.com/api/health
```

Ожидаемый ответ:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Тест регистрации

```bash
curl -X POST https://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 3. Тест виджета

Откройте тестовую HTML страницу:

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://your-domain.com/widget.js"></script>
  <script>
    window.bugSpotConfig = {
      apiKey: 'your-project-api-key',
      apiUrl: 'https://your-domain.com'
    };
  </script>
</head>
<body>
  <h1>Test Page</h1>
</body>
</html>
```

## Мониторинг

### Логирование

Используйте PM2 для логирования:

```bash
pm2 logs bugspot --lines 100
```

Или настройте централизованное логирование (например, Logtail, Datadog).

### Мониторинг доступности

Настройте uptime monitoring:

- [UptimeRobot](https://uptimerobot.com) (бесплатно)
- [Pingdom](https://www.pingdom.com)
- [StatusCake](https://www.statuscake.com)

### Метрики

Добавьте мониторинг метрик:

- Response time
- Error rate
- Database connection pool
- Memory usage

## Безопасность

### Checklist

- [ ] JWT_SECRET изменен на случайное значение
- [ ] SUPABASE_SERVICE_ROLE_KEY хранится в секрете
- [ ] HTTPS включен (SSL сертификат)
- [ ] Rate limiting настроен (100 req/min)
- [ ] CORS настроен правильно
- [ ] Helmet.js включен
- [ ] Переменные окружения не в git
- [ ] Firewall настроен (только необходимые порты)

### Обновление зависимостей

Регулярно обновляйте зависимости:

```bash
npm audit
npm audit fix
```

## Troubleshooting

### Проблема: "JWT_SECRET not set"

**Решение**: Убедитесь, что переменная окружения установлена:

```bash
echo $JWT_SECRET
```

### Проблема: "Supabase connection failed"

**Решение**: 
1. Проверьте SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY
2. Убедитесь, что миграции применены
3. Проверьте RLS политики

### Проблема: "Widget не загружается"

**Решение**:
1. Проверьте CORS настройки
2. Убедитесь, что `/widget.js` доступен
3. Проверьте консоль браузера на ошибки

### Проблема: "Analytics RPC functions not found"

**Решение**: Примените миграцию `20250610173300_black_oasis.sql` в Supabase.

## Поддержка

При возникновении проблем:

1. Проверьте логи: `pm2 logs bugspot`
2. Проверьте health endpoint: `/api/health`
3. Проверьте переменные окружения
4. Создайте issue в репозитории

## Дополнительные ресурсы

- [Supabase Documentation](https://supabase.com/docs)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)


