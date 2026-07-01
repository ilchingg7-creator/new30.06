# Contributing

## Перед началом работы

Прочитайте `docs/game-design/README.md` — индекс дизайн-документов. Любое изменение механики, UI, экономики, Yandex-интеграции, контента, архитектуры или визуального стиля **сначала** должно быть отражено в соответствующем markdown-документе, и только потом в коде.

## Архитектурные принципы

1. **Чистая game-логика.** `src/game/*` не импортирует React, PixiJS или браузерные API. Экономика тестируется без UI.
2. **PixiJS только для сцены.** `src/station/*` рендерит station/room scenes. Кнопки, текст, длинные лейблы — в React/DOM, не в canvas.
3. **Один state, два layout'а.** Desktop и mobile используют один `GameState` и одну экономику. Layout переключается на 900px.
4. **Save-совместимость.** При изменении `GameState` схемы:
   - Новые опциональные поля — добавляйте как `field?: Type` и валидируйте в `save.ts` через `hasOptional*`.
   - Несовместимые изменения — bump `CURRENT_SCHEMA_VERSION` в `save.ts` и добавьте миграцию в `migrateGameState`.
   - Никогда не делайте существующее поле обязательным, если не хотите сломать старые сейвы.

## Процесс разработки

```bash
# 1. Установить зависимости
npm install

# 2. Запустить dev-сервер
npm run dev

# 3. Перед коммитом — прогнать тесты и сборку
npm test
npm run build
```

## Добавление нового контента

### Новый модуль

1. `src/game/types.ts` — добавить id в `ModuleId`
2. `src/game/economy.ts` — добавить в `createEmptyModuleLevels`
3. `src/game/content/modules.ts` — добавить `ModuleDefinition` (baseCost, baseIncome, comfortBonus, unlockAtCredits, visualKey)
4. `src/station/roomScenes.ts` — добавить accent color в `roomAccentColors`, prop kind в `RoomSceneProp`, case в `createBaseProps`, builder-функцию, case в `createRoomProp`
5. `src/test/balance-simulation.test.ts` — добавить target window в `unlockTargets`, при необходимости тюнить `unlockAtCredits`
6. `docs/game-design/02-economy-balance.md` — обновить таблицу модулей

### Новый жилец

1. `src/game/types.ts` — добавить id в `ResidentId`
2. `src/game/content/residents.ts` — добавить `ResidentDefinition` (unlockText, bonusText, requiredModule/requiredComfort)
3. `src/game/residents.ts` — если unlock condition нестандартный, обновить `isResidentUnlocked`

### Новое достижение

1. `src/game/types.ts` — добавить id в `AchievementId`
2. `src/game/content/achievements.ts` — добавить `AchievementDefinition`
3. `src/game/achievements.ts` — добавить case в `isAchievementUnlocked`
4. `src/game/save.ts` — добавить id в `VALID_ACHIEVEMENT_IDS`

### Новый престиж-апгрейд

1. `src/game/types.ts` — добавить id в `PrestigeUpgradeId`
2. `src/game/content/prestigeUpgrades.ts` — добавить `PrestigeUpgradeDefinition`
3. `src/game/economy.ts` — реализовать эффект в `performPrestige` или соответствующем мутаторе
4. `src/game/save.ts` — добавить id в `VALID_PRESTIGE_UPGRADE_IDS`

## Тестирование

- **Чистая логика** (`src/game/*`) — тестируется без браузера/Pixi.
- **Pixi mapping** (`src/station/*`) — тестируется как pure data: descriptors, tiers, fit.
- **React components** — `@testing-library/react` через jsdom с замоканным canvas (см. `vitest.setup.ts`).
- **Balance** — `balance-simulation.test.ts` детерминированно симулирует 125 минут и проверяет, что комнаты открываются в целевых окнах.

## Стиль кода

- TypeScript throughout, strict mode
- ES6+ import/export
- Имена функций: `camelCase`, имена типов: `PascalCase`
- Никаких `any` без крайней необходимости
- Коммиты в стиле Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`)

## Визуальный стиль

Следуйте `docs/game-design/07-visual-style.md`:

- Палитра: 8 цветов (space navy, warm panel, enamel green, signal red, lamp amber, utility blue, ink, soft white)
- Не использовать indigo/blue как primary
- Кнопки ≥ 44px высоты
- Motion: subtle, не отвлекает (0.18-0.3s transitions)
- Текст должен быть читаемым на Cyrillic
