# Космическая коммуналка

Cozy-comedy idle/tycoon игра для Yandex Games. Игрок получает в управление старую орбитальную коммуналку и постепенно превращает её в тёплый космический жилой комплекс: покупает модули, повышает комфорт, заселяет странных жильцов и делает реновацию орбиты.

Визуальный стиль: **Retro Soviet Space Cozy** — тёплые окна, округлые модули, эмалевые панели, ламповые индикаторы.

## Технологии

- **Vite 7** — dev-сервер и сборка
- **React 19** — UI, layouts, state
- **PixiJS 8** — живая сцена станции (focused room scenes)
- **TypeScript 5** — строгая типизация
- **Vitest 3** + **Testing Library** — unit/integration тесты
- **Framer Motion** — subtle UI-анимации
- **Yandex Games SDK** — реклама, cloud save, loading ready

## Запуск

```bash
# Установить зависимости
npm install

# Dev-сервер (http://127.0.0.1:5173)
npm run dev

# Production-сборка в dist/
npm run build

# Превью production-сборки
npm run preview

# Тесты (однократно)
npm test

# Тесты в watch-режиме
npm run test:watch
```

## Структура проекта

```
src/
├── game/              # Чистая game-логика (без React/Pixi)
│   ├── types.ts       # ModuleId, ResidentId, GoalId, GameState, ...
│   ├── economy.ts     # доход, покупка, offline, prestige, daily login
│   ├── goals.ts       # цели (eligibility, completion)
│   ├── residents.ts   # жильцы (unlock conditions)
│   ├── achievements.ts# достижения
│   ├── save.ts        # сериализация + миграция (schemaVersion)
│   ├── format.ts      # 12.4K / 8.1M / 3.2B
│   └── content/       # статические данные: modules, residents, goals,
│                      # prestigeUpgrades, achievements
├── station/           # PixiJS-сцены
│   ├── roomScenes.ts  # focused room descriptors + builders
│   └── stationTheme.ts# палитра Retro Soviet Space Cozy
├── platform/          # Yandex SDK + storage
│   ├── yandex.ts      # initYandexPlatform, rewarded ads, cloud save
│   └── storage.ts     # localStorage port (SSR-safe)
├── ui/
│   ├── useGameState.ts# главный hook: state, autosave, tick, ads, daily
│   ├── components/    # TopBar, ModuleList, RoomSelector, GoalPanel,
│   │                  # ResidentsPanel, BonusPanel, PrestigePanel,
│   │                  # PrestigeUpgradesPanel, CosmeticsPanel,
│   │                  # AchievementsPanel, PixiStationScene
│   ├── layouts/       # DesktopLayout (3 колонки), MobileLayout (tabs)
│   └── screens/       # LoadingScreen, OfflineRewardDialog, DailyLoginDialog
├── styles/            # tokens.css (палитра) + global.css (responsive)
└── test/              # 18 тест-файлов, 78 тестов

docs/
├── game-design/       # 12 дизайн-документов (vision, economy, UX, ...)
└── superpowers/       # планы реализации + спецификации
```

## Архитектура

```
GameState → React layouts → PixiStationScene props → roomScenes renderer
```

- **`src/game/*`** — детерминированная бизнес-логика, не зависит от React/Pixi/браузера. Тестируется без UI.
- **`src/station/*`** — PixiJS-сцены получают plain data, не мутируют экономику.
- **`src/platform/*`** — изоляция Yandex SDK и storage fallback.
- **`src/ui/*`** — React владеет state, layouts, dialogs, Yandex-интеграцией.

## Ключевые механики

- **8 + 2 модуля** станции (capsule → mail_tube_office), каждый со своей PixiJS-сценой
- **8 жильцов** с условиями разблокировки (уровень модуля / комфорт / реновация)
- **8 достижений** (first_purchase, credits_million, daily_streak_7, ...)
- **Цели** без кредитных наград (только comfort / visual / boost / prestige hint)
- **Prestige** «Реновация орбиты» с деревом апгрейдов (residents_survive, starting_comfort, higher_offline_cap)
- **Daily login** с 7-дневным стриком (циклические награды)
- **Cosmetics** — цвет света в окнах (amber/green/red/blue)
- **Rewarded ads** — x2 аренда, VIP-жилец, удвоение офлайн-дохода (добровольные)
- **Cloud save** через Yandex SDK с localStorage fallback
- **Save migration** — schemaVersion + v1→v2 миграция для обратной совместимости

## Дизайн-документы

Полная документация в `docs/game-design/`:

- [00-product-vision](docs/game-design/00-product-vision.md) — концепт, аудитория, тон
- [01-core-loop](docs/game-design/01-core-loop.md) — игровой цикл, сессии, реклама
- [02-economy-balance](docs/game-design/02-economy-balance.md) — валюты, цены, баланс
- [03-content-progression](docs/game-design/03-content-progression.md) — модули, жильцы, цели
- [04-desktop-mobile-ux](docs/game-design/04-desktop-mobile-ux.md) — layouts, responsive
- [05-yandex-games](docs/game-design/05-yandex-games.md) — SDK, сохранения, реклама
- [06-mvp-roadmap](docs/game-design/06-mvp-roadmap.md) — этапы разработки
- [07-visual-style](docs/game-design/07-visual-style.md) — палитра, формы, motion
- [08-technical-architecture](docs/game-design/08-technical-architecture.md) — архитектура
- [09-content-roadmap](docs/game-design/09-content-roadmap.md) — будущий контент
- [10-progression-roadmap](docs/game-design/10-progression-roadmap.md) — долгосрочная прогрессия
- [11-mvp-verification](docs/game-design/11-mvp-verification.md) — чек-лист готовности

## Публикация на Yandex Games

1. `npm run build` — собрать `dist/`
2. Загрузить `dist/` как ZIP в [Yandex Games Console](https://games.yandex.ru/console)
3. SDK подключается автоматически через `<script src="https://yandex.ru/games/sdk/v2">` в `index.html`
4. Проверить: сохранения (cloud + local fallback), rewarded ads, loading ready
5. Скриншоты 390×844 (mobile) и 1366×768 (desktop) для storefront

## Лицензия

Private.
