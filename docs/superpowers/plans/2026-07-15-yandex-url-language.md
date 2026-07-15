# Yandex URL Language Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Выбирать язык интерфейса из URL Yandex Games до завершения асинхронной инициализации SDK.

**Architecture:** `getDefaultLanguage()` использует единый нормализатор языковых кодов и порядок «ручной выбор текущей страницы → URL → SDK → браузер → RU». `initYandexPlatform()` сохраняет фактический язык SDK в памяти страницы для последующих потребителей, не задерживая запуск React.

**Tech Stack:** TypeScript, React 19, Vitest, Yandex Games SDK.

## Global Constraints

- Приоритет: ручной выбор текущей страницы → URL `lang` → SDK → браузер → RU.
- React продолжает запускаться без ожидания SDK.
- `localStorage` не определяет язык.
- Невалидный или отсутствующий `lang` не блокирует резервные источники.
- `ru`, `be`, `uk`, `kk`, `uz` отображаются как RU; остальные корректные двухбуквенные языковые коды — как EN.

---

### Task 1: Определение языка из URL и SDK

**Files:**
- Create: `src/test/i18n.test.ts`
- Modify: `src/platform/i18n.ts`
- Modify: `src/platform/yandex.ts`
- Modify: `src/test/yandex-integration.test.ts`

**Interfaces:**
- Consumes: `window.location.search`, `window.__yaSdkLang`, `navigator.language`, `YandexSdk.environment.i18n.lang`.
- Produces: `getDefaultLanguage(): Language`, `setStoredLanguage(lang: Language): void` с памятью только на время страницы.

- [ ] **Step 1: Write failing tests**

Проверить URL `en`/`ru`, приоритет ручного выбора, fallback при невалидном URL, кириллические коды, SDK-язык и отсутствие записи языка в `localStorage`. В интеграционном тесте проверить запись `sdk.environment.i18n.lang` в `window.__yaSdkLang`.

- [ ] **Step 2: Run tests to verify RED**

Run: `npm.cmd test -- src/test/i18n.test.ts src/test/yandex-integration.test.ts`

Expected: URL-тест возвращает язык браузера; SDK-тест не находит `window.__yaSdkLang`; ручной выбор пишет в `localStorage`.

- [ ] **Step 3: Implement minimal detection**

Добавить общий нормализатор языкового кода, URL-проверку перед SDK/браузером, page-scoped ручной выбор и перенос `sdk.environment.i18n.lang` в `window.__yaSdkLang` после успешного `init()`.

- [ ] **Step 4: Run verification**

Run:

```powershell
npm.cmd test -- src/test/i18n.test.ts src/test/yandex-integration.test.ts
npm.cmd test
npm.cmd run build
git diff --check
```

Expected: все команды завершаются с кодом `0`, Vitest сообщает `0 failed`.
