# Modernization Plan: Banking API → Full-Stack Diploma Project

## Overview

Структура репозитория после модернизации:
```
Banking/               ← Spring Boot backend (существующий)
frontend/              ← React frontend (новый)
docker-compose.yml
Dockerfile             ← backend
frontend/Dockerfile    ← frontend
.env.example
```

Фазы реализации:
1. **Roles + JWT role claims** — ADMIN/USER роли, схема управляется Hibernate DDL auto
2. **Admin endpoints** — admin видит всех пользователей/счета/кредиты
3. **Loan/Credit module** — заявка, одобрение, расписание платежей (аннуитет), погашение
4. **Email notifications** — async события при переводах, изменении статуса кредита, регистрации
5. **React frontend** — SPA на Vite + React + TypeScript + Tailwind CSS
6. **Docker** — docker-compose с тремя сервисами: db, backend, frontend
7. **Full test suite** — unit (Mockito) + integration (MockMvc + Testcontainers)

---

## Phase 1 — Roles + JWT with role claim

### pom.xml additions
- `spring-boot-starter-mail`
- `h2` (test scope)
- `spring-boot-testcontainers`, `testcontainers:postgresql`, `testcontainers:junit-jupiter` (test scope)

### New file: `user/model/Role.java`
```java
public enum Role { USER, ADMIN }
```

### Modify `User.java`
Add: `@Enumerated(EnumType.STRING) @Column(nullable=false, length=20) private Role role;`

### Modify `JwtTokenProvider.java`
- `generateToken(userId, email, role)` — adds `.claim("role", role)`
- Add `getRole(String token)` method

### Modify `JwtAuthenticationFilter.java`
Extract role from token, build `SimpleGrantedAuthority("ROLE_" + role)`.

### Modify `SecurityConfig.java`
- Add `@EnableMethodSecurity`
- Add `.requestMatchers("/api/admin/**").hasRole("ADMIN")`
- Добавить CORS-конфигурацию для React dev server (origin: `http://localhost:5173`):
  ```java
  @Bean
  CorsConfigurationSource corsConfigurationSource() {
      CorsConfiguration config = new CorsConfiguration();
      config.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:80"));
      config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
      config.setAllowedHeaders(List.of("*"));
      config.setExposedHeaders(List.of("Authorization"));
      config.setAllowCredentials(true);
      UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
      source.registerCorsConfiguration("/api/**", config);
      return source;
  }
  ```

### Modify `UserService.java`
- `register()` assigns `Role.USER`, publishes `UserRegisteredEvent`
- `login()` passes role to `generateToken()`

### Modify `application.properties`
```properties
spring.jpa.hibernate.ddl-auto=update
spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/banking}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME:postgres}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD:123321}
jwt.secret=${JWT_SECRET:YmFua2luZy1hcHAtc2VjcmV0LWtleS1mb3Itand0LXRva2VuLWdlbmVyYXRpb24tMjAyNg==}
jwt.expiration=${JWT_EXPIRATION:86400000}
spring.mail.host=${SPRING_MAIL_HOST:smtp.gmail.com}
spring.mail.port=587
spring.mail.username=${SPRING_MAIL_USERNAME:}
spring.mail.password=${SPRING_MAIL_PASSWORD:}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

---

## Phase 1 — Completion Report

**Статус:** ✅ Выполнено (2026-04-09)

### Изменённые файлы

| Файл | Что изменилось |
|------|---------------|
| `pom.xml` | Добавлены: `spring-boot-starter-mail`, `h2` (test), `spring-boot-testcontainers`, `testcontainers:postgresql:1.20.4`, `testcontainers:junit-jupiter:1.20.4` |
| `user/model/User.java` | Добавлено поле `@Enumerated Role role`; конструктор принимает `Role role`; добавлен геттер `getRole()` |
| `config/security/JwtTokenProvider.java` | `generateToken()` принимает третий аргумент `String role`, встраивает его как JWT claim; добавлен метод `getRole(String token)` |
| `config/security/JwtAuthenticationFilter.java` | Извлекает роль из токена, строит `SimpleGrantedAuthority("ROLE_" + role)` — ранее authorities был пустым списком |
| `config/security/SecurityConfig.java` | Добавлен `@EnableMethodSecurity`; правило `hasRole("ADMIN")` на `/api/admin/**`; CORS-конфигурация для `localhost:5173` и `localhost:80` |
| `user/service/UserService.java` | `register()` присваивает `Role.USER`; `login()` возвращает `LoginResult(token, userId, role)` вместо `String` |
| `user/controller/AuthResponse.java` | Добавлено поле `String role` |
| `user/controller/AuthController.java` | `register` возвращает роль; `login` использует новый `LoginResult` |
| `application.properties` | Datasource URL/credentials, JWT secret, mail-настройки читаются из env-переменных с fallback на локальные значения |

### Новые файлы

| Файл | Описание |
|------|----------|
| `user/model/Role.java` | Enum `{ USER, ADMIN }` |

### Функциональные изменения

**Auth API — новый формат ответа:**

`POST /api/auth/register` и `POST /api/auth/login` теперь возвращают поле `role`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "role": "USER"
}
```
Фронтенд получает роль сразу при логине и может показывать/скрывать admin-панель без дополнительных запросов.

**RBAC через Spring Security:**

Все запросы к `/api/admin/**` автоматически отклоняются с `403 Forbidden` если роль в токене не `ADMIN`. Поддержка аннотации `@PreAuthorize` на уровне методов.

**CORS:**

Backend принимает cross-origin запросы от `localhost:5173` (Vite dev server) и `localhost:80` (production nginx).

**БД:**

Hibernate добавит колонку `role VARCHAR(20)` в таблицу `users` при следующем старте. Существующие строки получат `NULL` — исправляется вручную:
```sql
UPDATE users SET role = 'USER' WHERE role IS NULL;
```

---

## Phase 2 — Admin Endpoints

### New `user/controller/UserResponse.java`
```java
public record UserResponse(UUID id, String email, String firstName, String lastName,
                            boolean active, String role, LocalDateTime createdAt) {}
```

### New `user/controller/UserAdminController.java`
```-
GET /api/admin/users                 — Page<UserResponse> всех пользователей
GET /api/admin/users/{id}            — один пользователь
PUT /api/admin/users/{id}/deactivate — деактивация
```
Аннотация: `@PreAuthorize("hasRole('ADMIN')")`

### New `account/controller/AccountAdminController.java`
```
GET /api/admin/accounts      — Page<AccountResponse> всех счетов
GET /api/admin/accounts/{id} — любой счет без проверки владения
```

---

## Phase 2 — Completion Report

**Статус:** ✅ Выполнено (2026-04-09)

### Созданные файлы

| Файл | Описание |
|------|----------|
| `user/controller/UserResponse.java` | Record: id, email, firstName, lastName, active, role, createdAt |
| `user/controller/UserAdminController.java` | Admin-контроллер пользователей (`/api/admin/users`) |
| `account/controller/AccountAdminController.java` | Admin-контроллер счетов (`/api/admin/accounts`) |

### Изменённые файлы

| Файл | Что изменилось |
|------|---------------|
| `user/model/User.java` | Добавлен `setActive(boolean)` для деактивации через JPA |

### Новые эндпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/api/admin/users` | Все пользователи, пагинация (`?page=0&size=20`) |
| `GET` | `/api/admin/users/{id}` | Конкретный пользователь по UUID |
| `PUT` | `/api/admin/users/{id}/deactivate` | Деактивация пользователя (`active = false`) |
| `GET` | `/api/admin/accounts` | Все счета без фильтра по владельцу, пагинация |
| `GET` | `/api/admin/accounts/{id}` | Любой счёт по UUID без проверки владения |

Все эндпоинты защищены `@PreAuthorize("hasRole('ADMIN')")` — вернут `403` для роли `USER`.

### Функциональные изменения

**Admin видит всё:** обычный пользователь через `GET /api/accounts` видит только свои счета. Admin через `GET /api/admin/accounts` получает все счета всех пользователей системы с пагинацией.

**Деактивация пользователей:** `PUT /api/admin/users/{id}/deactivate` устанавливает `active = false`. Деактивированный пользователь не может войти в систему — `UserService.login()` выбрасывает `IllegalArgumentException("Account is deactivated")`.

---

## Phase 3 — Loan/Credit Module

### New entities

**`loan/model/LoanStatus.java`**: `PENDING, APPROVED, REJECTED, ACTIVE, CLOSED`

**`loan/model/RepaymentStatus.java`**: `PENDING, PAID, OVERDUE`

**`loan/model/Loan.java`** (`@Table("loans")`):
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK |
| borrowerId | UUID | FK → users.id |
| accountId | UUID | FK → accounts.id (disbursement + repayment account) |
| principalAmount | BigDecimal | |
| annualInterestRate | BigDecimal | e.g. 0.12 = 12% |
| termMonths | int | |
| monthlyPayment | BigDecimal | computed at approval |
| status | LoanStatus | default PENDING |
| startDate | LocalDate | set at approval |
| endDate | LocalDate | startDate + termMonths |
| createdAt, updatedAt | LocalDateTime | |

**`loan/model/RepaymentScheduleEntry.java`** (`@Table("repayment_schedule")`):
| Field | Type |
|-------|------|
| id | UUID |
| loanId | UUID |
| installmentNumber | int |
| dueDate | LocalDate |
| principal | BigDecimal |
| interest | BigDecimal |
| totalPayment | BigDecimal |
| status | RepaymentStatus |
| paidAt | LocalDate |

### Annuity formula (`LoanCalculator.java`)
```
r = annualRate / 12
M = P × (r × (1+r)^n) / ((1+r)^n − 1)
```
Last installment adjusted to eliminate rounding drift.
`buildSchedule()` returns full list of `RepaymentScheduleEntry`.

### `LoanService.java` methods
1. `applyForLoan(borrowerId, accountId, amount, annualRate, termMonths)` → PENDING loan
2. `approveLoan(loanId)` → ACTIVE, credits account via `AccountService.deposit()`, creates schedule, publishes event
3. `rejectLoan(loanId)` → REJECTED, publishes event
4. `makeRepayment(loanId, requesterId)` → withdraws next installment via `AccountService.withdraw()`, PAID, closes if last
5. `getLoansByBorrower(UUID)`, `getSchedule(UUID, requesterId)`, `getAllLoans(Pageable)`

### REST endpoints
```
POST   /api/loans                    — подать заявку (USER)
GET    /api/loans                    — свои кредиты (USER)
GET    /api/loans/{id}               — детали (USER, владелец)
GET    /api/loans/{id}/schedule      — расписание платежей (USER, владелец)
POST   /api/loans/{id}/repay         — внести платёж (USER, владелец)
GET    /api/admin/loans              — все кредиты (ADMIN)
POST   /api/admin/loans/{id}/approve — одобрить (ADMIN)
POST   /api/admin/loans/{id}/reject  — отклонить (ADMIN)
```

Hibernate DDL auto=update создаст таблицы `loans` и `repayment_schedule` автоматически.

Первый ADMIN создаётся через `DataInitializer` bean (`ApplicationRunner`) — проверяет `existsByEmail("admin@bank.local")`, если нет — вставляет с ролью ADMIN и bcrypt-хешем пароля `admin123`.

### Modify `ApiExceptionHandler.java`
- `LoanNotFoundException` → 404
- `IllegalStateException` → 409 (невалидный переход статуса кредита)

---

## Phase 3 — Completion Report

**Статус:** ✅ Выполнено (2026-04-09)

### Созданные файлы

| Файл | Описание |
|------|----------|
| `loan/model/LoanStatus.java` | Enum `PENDING, ACTIVE, REJECTED, CLOSED` |
| `loan/model/RepaymentStatus.java` | Enum `PENDING, PAID, OVERDUE` |
| `loan/model/Loan.java` | JPA entity `@Table("loans")` со всеми полями кредита |
| `loan/model/RepaymentScheduleEntry.java` | JPA entity `@Table("repayment_schedule")` — одна строка платёжного расписания |
| `loan/repository/LoanRepository.java` | `findByBorrowerIdOrderByCreatedAtDesc`, `findAllByOrderByCreatedAtDesc` |
| `loan/repository/RepaymentScheduleRepository.java` | `findByLoanIdOrderByInstallmentNumber`, `findFirstByLoanIdAndStatus…` |
| `loan/service/LoanCalculator.java` | Аннуитетная формула + генерация расписания с коррекцией последнего взноса |
| `loan/service/LoanService.java` | Бизнес-логика: apply, approve, reject, repay, getters |
| `loan/controller/LoanApplicationRequest.java` | DTO с Bean Validation (`@NotNull`, `@DecimalMin`, `@Min`) |
| `loan/controller/LoanResponse.java` | Record-ответ для кредита |
| `loan/controller/ScheduleEntryResponse.java` | Record-ответ для строки расписания |
| `loan/controller/LoanController.java` | REST-контроллер: 5 user-эндпоинтов + 3 admin-эндпоинта |
| `config/LoanNotFoundException.java` | Runtime exception для 404 по кредиту |
| `config/DataInitializer.java` | `ApplicationRunner` — создаёт `admin@bank.local / admin123` при старте |

### Изменённые файлы

| Файл | Что изменилось |
|------|---------------|
| `config/ApiExceptionHandler.java` | Добавлены обработчики `LoanNotFoundException` (404) и `IllegalStateException` (409) |

### Новые эндпоинты

| Метод | Путь | Роль | Описание |
|-------|------|------|----------|
| `POST` | `/api/loans` | USER | Подать заявку на кредит |
| `GET` | `/api/loans` | USER | Список своих кредитов |
| `GET` | `/api/loans/{id}` | USER | Детали кредита (только владелец) |
| `GET` | `/api/loans/{id}/schedule` | USER | Расписание платежей (только владелец) |
| `POST` | `/api/loans/{id}/repay` | USER | Внести следующий платёж |
| `GET` | `/api/admin/loans` | ADMIN | Все кредиты (пагинация) |
| `POST` | `/api/admin/loans/{id}/approve` | ADMIN | Одобрить заявку → статус ACTIVE, деньги на счёт |
| `POST` | `/api/admin/loans/{id}/reject` | ADMIN | Отклонить заявку → статус REJECTED |

### Функциональные изменения

**Жизненный цикл кредита:**
```
PENDING → (admin) → ACTIVE  → (все взносы уплачены) → CLOSED
         → (admin) → REJECTED
```

**Одобрение (`approveLoan`):**
- Вычисляет `monthlyPayment` по аннуитетной формуле
- Переводит статус в `ACTIVE`, устанавливает `startDate` и `endDate`
- Зачисляет `principalAmount` на счёт через `AccountService.deposit()`
- Генерирует полное расписание платежей и сохраняет его

**Погашение (`makeRepayment`):**
- Берёт ближайший PENDING-взнос из расписания
- Списывает `totalPayment` со счёта через `AccountService.withdraw()`
- Помечает взнос как `PAID`
- Если взносов PENDING больше нет — закрывает кредит (`CLOSED`)

**DataInitializer:**
Admin-пользователь `admin@bank.local / admin123` создаётся автоматически при первом старте приложения. Hibernate DDL auto=update создаст таблицы `loans` и `repayment_schedule` при следующем старте.

---

## Phase 4 — Email Notifications

### Modify `BankingApplication.java`
Add `@EnableAsync`.

### New event records (`notification/event/`)
- `UserRegisteredEvent(String email, String firstName)`
- `TransferCompletedEvent(String senderEmail, String recipientEmail, BigDecimal amount, String currency, UUID transferId)`
- `LoanStatusChangedEvent(String borrowerEmail, String firstName, UUID loanId, String newStatus, BigDecimal monthlyPayment)`
- `LoanRepaymentEvent(String borrowerEmail, int installmentNumber, BigDecimal amount, int remaining)`

### New `EmailNotificationService.java`
Методы с `@Async @EventListener`. Отправка через `JavaMailSender.send(SimpleMailMessage)`.
`MailException` логируется и не пробрасывается.

### Publishing events
- `UserService.register()` → `UserRegisteredEvent`
- `TransferService.transfer()` → `TransferCompletedEvent` (+ ownership check — security-баг)
- `LoanService.approveLoan()`/`rejectLoan()` → `LoanStatusChangedEvent`
- `LoanService.makeRepayment()` → `LoanRepaymentEvent`

---

## Phase 5 — React Frontend

Расположение: `frontend/` в корне репозитория.

### Tech stack
- **Vite + React + TypeScript** — сборщик и фреймворк
- **React Router v6** — клиентская маршрутизация
- **Axios** — HTTP-клиент с interceptors для JWT
- **Zustand** — легковесное глобальное состояние (auth store)
- **Tailwind CSS** — стилизация

### Структура `frontend/src/`
```
api/
  axios.ts          — Axios instance: baseURL=http://localhost:8080,
                      request interceptor добавляет Authorization: Bearer <token>,
                      response interceptor на 401 → logout + redirect /login
  auth.ts           — register(dto), login(dto) → { token, userId }
  accounts.ts       — getAccounts(), getAccount(id), createAccount(dto),
                      deposit(id, dto), withdraw(id, dto), closeAccount(id),
                      getTransactions(id, page)
  transfers.ts      — transfer(dto, idempotencyKey)
  loans.ts          — applyForLoan(dto), getLoans(), getLoan(id),
                      getSchedule(id), makeRepayment(id)
  admin.ts          — getUsers(page), deactivateUser(id),
                      getAllAccounts(page), getAllLoans(page),
                      approveLoan(id), rejectLoan(id)

store/
  authStore.ts      — Zustand: { token, userId, role, login(), logout() }
                      persist в localStorage

components/
  Layout.tsx        — sidebar с навигацией + header с именем пользователя
  ProtectedRoute.tsx — если нет token → redirect /login
  AdminRoute.tsx    — если role !== ADMIN → redirect /dashboard

pages/
  LoginPage.tsx         — форма входа
  RegisterPage.tsx      — форма регистрации
  DashboardPage.tsx     — сводка: общий баланс, кол-во счетов, последние транзакции
  AccountsPage.tsx      — список счетов + кнопка "Открыть счёт" (модальное окно)
  AccountDetailPage.tsx — баланс, кнопки Пополнить/Снять/Закрыть (модалки),
                          таблица транзакций с пагинацией
  TransferPage.tsx      — форма перевода (fromAccount, toAccount, amount, currency)
  LoansPage.tsx         — список кредитов + кнопка "Подать заявку" (модалка с формой)
  LoanDetailPage.tsx    — детали кредита + таблица расписания платежей + кнопка "Внести платёж"
  admin/
    AdminUsersPage.tsx  — таблица пользователей, кнопка деактивации
    AdminAccountsPage.tsx — таблица всех счетов
    AdminLoansPage.tsx  — таблица всех кредитов, кнопки Одобрить/Отклонить
```

### Маршруты (`App.tsx`)
```
/                   → redirect /dashboard
/login              — публичный
/register           — публичный
/dashboard          — ProtectedRoute
/accounts           — ProtectedRoute
/accounts/:id       — ProtectedRoute
/transfer           — ProtectedRoute
/loans              — ProtectedRoute
/loans/:id          — ProtectedRoute
/admin/users        — AdminRoute
/admin/accounts     — AdminRoute
/admin/loans        — AdminRoute
```

### Auth flow на фронтенде
1. После login → сохранить `{ token, userId, role }` в Zustand + localStorage
2. Axios request interceptor добавляет `Authorization: Bearer <token>` ко всем запросам
3. Axios response interceptor: 401/403 → `authStore.logout()` + `navigate('/login')`
4. `ProtectedRoute` проверяет наличие token в store; `AdminRoute` дополнительно проверяет `role === 'ADMIN'`

### `frontend/package.json` (ключевые зависимости)
```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "react-router-dom": "^6",
    "axios": "^1",
    "zustand": "^4"
  },
  "devDependencies": {
    "@types/react": "^18",
    "typescript": "^5",
    "vite": "^5",
    "@vitejs/plugin-react": "^4",
    "tailwindcss": "^3",
    "autoprefixer": "^10",
    "postcss": "^8"
  }
}
```

---

## Phase 6 — Docker

### Backend `Dockerfile` (в корне проекта)
```dockerfile
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline -B
COPY src ./src
RUN ./mvnw package -DskipTests -B

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/Banking-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Frontend `frontend/Dockerfile`
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### `frontend/nginx.conf`
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;  # SPA fallback
    }

    location /api/ {
        proxy_pass http://app:8080;        # проксирование API-запросов к бэкенду
        proxy_set_header Host $host;
    }
}
```

С nginx-прокси CORS-заголовки из backend не нужны в prod, но нужны для локальной разработки (Vite dev server на :5173).

### `docker-compose.yml` — три сервиса
```yaml
version: '3.9'
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: banking
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: 123321
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      retries: 5

  app:
    build: .
    ports:
      - "8080:8080"
    depends_on:
      db:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/banking
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: 123321
      JWT_SECRET: ${JWT_SECRET}
      SPRING_MAIL_USERNAME: ${MAIL_USERNAME:-}
      SPRING_MAIL_PASSWORD: ${MAIL_PASSWORD:-}

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - app

volumes:
  postgres_data:
```

### `.env.example`
```
JWT_SECRET=YmFua2luZy1hcHAtc2VjcmV0LWtleS1mb3Itand0LXRva2VuLWdlbmVyYXRpb24tMjAyNg==
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

---

## Phase 7 — Tests

### Infrastructure
- `src/test/resources/application-test.properties` — Testcontainers JDBC URL: `jdbc:tc:postgresql:16:///banking`, `spring.jpa.hibernate.ddl-auto=create-drop`
- `AbstractIntegrationTest.java` — `@SpringBootTest`, `@AutoConfigureMockMvc`, `@ActiveProfiles("test")`, `@Transactional`; хелперы `registerUser()`, `loginAndGetToken()`, `createAccount()`

### Unit Tests (Mockito)
| Class | Key test cases |
|-------|---------------|
| `UserServiceTest` | register success/duplicate, login success/wrong password/inactive |
| `AccountServiceTest` | create, deposit currency mismatch, withdraw insufficient, close non-zero balance |
| `TransferServiceTest` | idempotency hit, closed account, insufficient funds, success |
| `LoanServiceTest` | apply wrong owner, approve not-PENDING throws, approve success, reject, repay last closes loan |
| `LoanCalculatorTest` | annuity formula known values, zero rate, sum of principal = loan amount |

### Integration Tests (MockMvc + Testcontainers)
| Class | Key test cases |
|-------|---------------|
| `AuthControllerIT` | register 201/400 duplicate/400 validation, login 200/400 |
| `AccountControllerIT` | CRUD + ownership, deposit/withdraw/close scenarios |
| `TransferControllerIT` | success, idempotency replay, missing header 400 |
| `LoanControllerIT` | apply → approve → repay → close lifecycle, role checks (403 for USER on admin endpoints) |

---

## Files to Create/Modify

### Backend — Modify
- `pom.xml`
- `src/main/resources/application.properties`
- `src/main/java/com/example/Banking/BankingApplication.java`
- `src/main/java/com/example/Banking/user/model/User.java`
- `src/main/java/com/example/Banking/user/service/UserService.java`
- `src/main/java/com/example/Banking/config/security/JwtTokenProvider.java`
- `src/main/java/com/example/Banking/config/security/JwtAuthenticationFilter.java`
- `src/main/java/com/example/Banking/config/security/SecurityConfig.java`
- `src/main/java/com/example/Banking/config/ApiExceptionHandler.java`
- `src/main/java/com/example/Banking/transaction/service/TransferService.java`

### Backend — Create
```
src/main/java/com/example/Banking/user/model/Role.java
src/main/java/com/example/Banking/user/controller/UserResponse.java
src/main/java/com/example/Banking/user/controller/UserAdminController.java
src/main/java/com/example/Banking/account/controller/AccountAdminController.java
src/main/java/com/example/Banking/config/LoanNotFoundException.java
src/main/java/com/example/Banking/config/DataInitializer.java
src/main/java/com/example/Banking/loan/model/LoanStatus.java
src/main/java/com/example/Banking/loan/model/RepaymentStatus.java
src/main/java/com/example/Banking/loan/model/Loan.java
src/main/java/com/example/Banking/loan/model/RepaymentScheduleEntry.java
src/main/java/com/example/Banking/loan/repository/LoanRepository.java
src/main/java/com/example/Banking/loan/repository/RepaymentScheduleRepository.java
src/main/java/com/example/Banking/loan/service/LoanCalculator.java
src/main/java/com/example/Banking/loan/service/LoanService.java
src/main/java/com/example/Banking/loan/controller/LoanController.java
src/main/java/com/example/Banking/loan/controller/LoanApplicationRequest.java
src/main/java/com/example/Banking/loan/controller/LoanResponse.java
src/main/java/com/example/Banking/loan/controller/ScheduleEntryResponse.java
src/main/java/com/example/Banking/notification/event/UserRegisteredEvent.java
src/main/java/com/example/Banking/notification/event/TransferCompletedEvent.java
src/main/java/com/example/Banking/notification/event/LoanStatusChangedEvent.java
src/main/java/com/example/Banking/notification/event/LoanRepaymentEvent.java
src/main/java/com/example/Banking/notification/EmailNotificationService.java
Dockerfile
src/test/resources/application-test.properties
src/test/java/com/example/Banking/AbstractIntegrationTest.java
src/test/java/com/example/Banking/user/service/UserServiceTest.java
src/test/java/com/example/Banking/account/service/AccountServiceTest.java
src/test/java/com/example/Banking/transaction/service/TransferServiceTest.java
src/test/java/com/example/Banking/loan/service/LoanServiceTest.java
src/test/java/com/example/Banking/loan/service/LoanCalculatorTest.java
src/test/java/com/example/Banking/user/controller/AuthControllerIT.java
src/test/java/com/example/Banking/account/controller/AccountControllerIT.java
src/test/java/com/example/Banking/transaction/controller/TransferControllerIT.java
src/test/java/com/example/Banking/loan/controller/LoanControllerIT.java
```

### Frontend — Create (все в `frontend/`)
```
frontend/package.json
frontend/vite.config.ts
frontend/tsconfig.json
frontend/tailwind.config.js
frontend/postcss.config.js
frontend/index.html
frontend/Dockerfile
frontend/nginx.conf
frontend/src/main.tsx
frontend/src/App.tsx
frontend/src/api/axios.ts
frontend/src/api/auth.ts
frontend/src/api/accounts.ts
frontend/src/api/transfers.ts
frontend/src/api/loans.ts
frontend/src/api/admin.ts
frontend/src/store/authStore.ts
frontend/src/components/Layout.tsx
frontend/src/components/ProtectedRoute.tsx
frontend/src/components/AdminRoute.tsx
frontend/src/pages/LoginPage.tsx
frontend/src/pages/RegisterPage.tsx
frontend/src/pages/DashboardPage.tsx
frontend/src/pages/AccountsPage.tsx
frontend/src/pages/AccountDetailPage.tsx
frontend/src/pages/TransferPage.tsx
frontend/src/pages/LoansPage.tsx
frontend/src/pages/LoanDetailPage.tsx
frontend/src/pages/admin/AdminUsersPage.tsx
frontend/src/pages/admin/AdminAccountsPage.tsx
frontend/src/pages/admin/AdminLoansPage.tsx
```

### Root — Create
```
docker-compose.yml
.env.example
```
