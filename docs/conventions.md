# BugSpot - Правила разработки

> Основано на техническом видении: [vision.md](./vision.md)

## Основные принципы

### 1. Clean Architecture
- Разделяй код по слоям: `domain/`, `application/`, `infrastructure/`, `presentation/`
- Зависимости направлены внутрь (domain не зависит от внешних слоев)
- Используй интерфейсы для абстракций

### 2. SOLID принципы
- **Single Responsibility**: один класс/функция = одна задача
- **Open/Closed**: расширяй, не изменяй существующий код
- **Dependency Inversion**: зависимости от абстракций, не от конкретных классов

### 3. KISS (Keep It Simple, Stupid)
- Простые решения лучше сложных
- Минимум зависимостей
- Понятный код без "магии"

## Структура проекта

```
src/
├── domain/          # Бизнес-логика (Entities, Use Cases)
├── application/     # Адаптеры (API, Services)
├── infrastructure/  # Внешние зависимости (DB, Config)
└── presentation/    # UI компоненты (только в frontend)

server/
├── domain/          # Бизнес-логика
├── application/     # Controllers, Services
├── infrastructure/  # Database, Config
└── routes/          # Express routes

widget/              # Отдельная папка для виджета
tests/               # Отдельная папка для тестов
```

## Правила именования

### Файлы и папки
- **kebab-case** для папок: `bug-reports/`, `user-management/`
- **PascalCase** для компонентов: `BugReportModal.tsx`
- **camelCase** для утилит: `formatDate.ts`, `apiClient.ts`

### Переменные и функции
- **camelCase** для переменных и функций: `getBugReports()`
- **PascalCase** для классов и типов: `BugReport`, `UserService`
- **UPPER_SNAKE_CASE** для констант: `API_BASE_URL`

### База данных
- **snake_case** для таблиц и полей: `bug_reports`, `user_id`
- **plural** для таблиц: `users`, `projects`, `bug_reports`

## TypeScript правила

### Типизация
- Всегда используй типы, избегай `any`
- Создавай интерфейсы для API ответов
- Используй `enum` для констант: `BugStatus.OPEN`

### Примеры
```typescript
// ✅ Хорошо
interface BugReport {
  id: number;
  title: string;
  status: BugStatus;
  createdAt: Date;
}

// ❌ Плохо
const bugReport: any = { id: 1, title: "Bug" };
```

## React правила

### Компоненты
- Функциональные компоненты с хуками
- Один компонент = один файл
- Используй `React.memo()` для оптимизации

### State Management
- **Redux Toolkit** + **RTK Query** для глобального состояния
- **useState** для локального состояния компонента
- **useContext** для простого глобального состояния

### Примеры
```typescript
// ✅ Хорошо
const BugReportList: React.FC<BugReportListProps> = ({ reports }) => {
  const [filter, setFilter] = useState('all');
  
  return (
    <div className="bug-report-list">
      {reports.map(report => (
        <BugReportItem key={report.id} report={report} />
      ))}
    </div>
  );
};

// ❌ Плохо
const BugReportList = ({ reports }) => {
  return <div>{reports.map(r => <div>{r.title}</div>)}</div>;
};
```

## API правила

### RESTful endpoints
- Используй HTTP методы правильно: GET, POST, PUT, DELETE
- Возвращай правильные HTTP статусы
- Валидируй входные данные с Joi

### Примеры
```typescript
// ✅ Хорошо
app.get('/api/bug-reports', authMiddleware, async (req, res) => {
  try {
    const reports = await bugReportService.getAll(req.user.id);
    res.json({ data: reports });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ❌ Плохо
app.get('/api/getBugs', (req, res) => {
  res.json(bugs);
});
```

## Безопасность

### Валидация
- Валидируй все входные данные
- Используй Joi схемы для API
- Санитайзуй пользовательский ввод

### Аутентификация
- JWT токены для dashboard
- API ключи для widget
- Rate limiting (100 req/min)

### Примеры
```typescript
// ✅ Хорошо
const bugReportSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().min(1).max(2000).required(),
  severity: Joi.string().valid('low', 'medium', 'high', 'critical')
});

// ❌ Плохо
const title = req.body.title; // без валидации
```

## Производительность

### Размер бандла
- Виджет < 50KB gzipped
- Используй динамические импорты
- Оптимизируй изображения

### API
- Ответы < 200ms
- Используй кэширование RTK Query
- Пагинация для больших списков

## Тестирование

### Unit тесты
- Тестируй бизнес-логику
- Используй Jest + React Testing Library
- Покрытие > 80% для критических модулей

### Примеры
```typescript
// ✅ Хорошо
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

## Логирование

### Winston
- Структурированные логи
- Разные уровни: error, warn, info, debug
- Ротация логов

### Примеры
```typescript
// ✅ Хорошо
logger.info('Bug report created', {
  bugId: bugReport.id,
  projectId: bugReport.projectId,
  userId: req.user.id
});

// ❌ Плохо
console.log('Bug created:', bugReport);
```

## Git правила

### Коммиты
- **Conventional Commits**: `feat: add bug report creation`
- **Английский язык** для коммитов
- **Один коммит = одна задача**

### Ветки
- **main** - продакшен
- **develop** - разработка
- **feature/bug-report-form** - новые фичи
- **hotfix/critical-bug** - срочные исправления

## Документация

### Код
- JSDoc для публичных функций
- Примеры использования

### API
- OpenAPI/Swagger для API документации
- Примеры запросов и ответов
- Описание ошибок

---

> **Помни**: Эти правила основаны на [vision.md](./vision.md). Следуй принципам Clean Architecture, SOLID и KISS. Пиши простой, понятный и поддерживаемый код.
