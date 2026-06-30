# Economy And Balance

## Валюты

### Кредиты

Кредиты - основная валюта. Источники:

- доход модулей в секунду;
- офлайн-доход;
- rewarded ad бонусы;
- VIP-жильцы.

Траты:

- покупка модулей;
- уровни модулей;
- апгрейды;
- ремонт и сервисные улучшения.

### Комфорт

Комфорт - не тратится как валюта в MVP. Это пороговый и множительный показатель. Он растет от специальных апгрейдов и модулей.

Использование:

- открывает жильцов;
- повышает общий доход;
- влияет на prestige-награду.

Comfort from modules is granted when a room is first opened, not on every level purchase. Repeated level purchases should primarily increase credits/sec and visual detail; otherwise comfort snowballs too fast and collapses late-room pacing.

### Репутация станции

Репутация станции - prestige-валюта. Она начисляется при "Реновации орбиты" и не сбрасывается.

Формула MVP:

```text
репутация = floor(sqrt(суммарно заработанные кредиты / 100000))
```

Эта формула простая и предсказуемая. Ее нужно балансировать после первых тестов, но она задает понятный старт.

## Генераторы дохода MVP

| Модуль | Роль | Стартовая цена | Базовый доход/сек | Комфорт | Открытие (кредиты) |
|---|---:|---:|---:|---:|---:|
| Капсула арендатора | первый генератор | 15 | 1 | 0 | 0 |
| Общая космо-кухня | ранний сервис | 130 | 5 | 1 | 75 |
| Кислородный сад | комфорт и доход | 1 600 | 22 | 5 | 1 100 |
| Прачечная невесомости | средний доход | 12 000 | 120 | 2 | 9 000 |
| Телепорт-прихожая | поток жильцов | 90 000 | 650 | 4 | 88 000 |
| Антиграв-спортзал | дорогой сервис | 450 000 | 2 600 | 6 | 600 000 |
| Панорамный купол | премиум зона | 1 600 000 | 9 000 | 10 | 2 800 000 |
| Док для мини-тарелок | поздний MVP | 6 000 000 | 23 000 | 12 | 12 000 000 |
| Радиаторный балкон | тепло и комфорт | 18 000 000 | 60 000 | 15 | 115 000 000 |
| Почтовая труба-контора | пневмопочта станции | 50 000 000 | 150 000 | 8 | 200 000 000 |

> Примечание: значения в таблице соответствуют `src/game/content/modules.ts`. Ранние модули намеренно дешевле проектных ориентиров из первой версии дизайна, чтобы первая сессия (45-90 сек до кухни) ощущалась активной; поздние модули (panorama_dome, saucer_dock) наоборот дороже, чтобы не открываться в первые 2-3 минуты. Баланс проверяется детерминированным тестом `src/test/balance-simulation.test.ts`.

## Цена уровней

Каждый следующий уровень модуля стоит дороже:

```text
цена следующего уровня = ceil(базовая цена * 1.18 ^ текущий уровень)
```

Рост `1.18` (вместо изначально планированного `1.15`) выбран после баланс-симуляции: более крутая кривая не даёт последней комнате (`saucer_dock`) открыться раньше целевого окна 60-90 минут без обязательной рекламы. Значение экспортировано как `LEVEL_COST_GROWTH` из `src/game/economy.ts`.

## Доход уровней

```text
доход модуля = базовый доход * уровень * множители
```

Множители приходят от:

- milestone уровней модуля;
- общего комфорта;
- жильцов;
- prestige-улучшений;
- временных рекламных бонусов.

## Milestone уровни

На уровнях `10`, `25`, `50`, `100` модуль получает постоянный множитель. MVP-значения:

- уровень 10: x2;
- уровень 25: x2;
- уровень 50: x3;
- уровень 100: x4.

Эти множители должны показываться заранее, чтобы игрок видел следующую цель.

## Баланс первых минут

Ориентиры:

- 0:00 - игрок покупает первую капсулу или получает ее бесплатно.
- 0:20 - первая покупка уровня.
- 1:00 - открыта космо-кухня.
- 2:00 - видимый апгрейд станции.
- 5:00 - открыт кислородный сад или игрок близок к нему.
- 10:00 - доступен первый meaningful rewarded ad.
- 30:00 - игрок понимает, что такое prestige.
- 60:00 - первый prestige должен быть достижим без обязательной рекламы.

## Unlock Pacing Targets

Opening the last room in 2-3 minutes is too fast for the MVP. The early loop should feel active, but the full station should not be exhausted during the first short session.

Target unlock pacing without mandatory rewarded ads:

| Room | Target Unlock Window |
|---|---:|
| `tenant_capsule` | immediately |
| `cosmo_kitchen` | 45-90 seconds |
| `oxygen_garden` | 4-7 minutes |
| `zero_g_laundry` | 9-14 minutes |
| `teleport_entry` | 18-28 minutes |
| `antigrav_gym` | 30-45 minutes |
| `panorama_dome` | 45-65 minutes |
| `saucer_dock` | 60-90 minutes |

Balancing should prefer changing module costs, income growth and milestone multipliers over adding artificial timers. Rewarded bonuses may speed up progression, but they must not be required and must not collapse the full unlock arc to a few minutes.

Implementation should include a deterministic progression simulation test that prevents `saucer_dock` from becoming unlockable before the target window under normal play assumptions.

## Защита от тупика

Если игрок потратил кредиты неэффективно, он все равно должен получать доход. Никакой апгрейд не может снижать базовый доход. Обслуживание и ремонт могут быть темой, но не должны создавать отрицательный баланс в MVP.

## Goal Rewards

Goals should not grant credits in the MVP. Credits already come from room income, offline rewards and voluntary rewarded bonuses, so credit goal rewards do not create a meaningful decision.

Use goals for progression guidance and non-credit rewards:

- comfort;
- room visual detail unlocks;
- resident-related scene details;
- temporary income boosts;
- prestige education or acknowledgement.

Completed goals must be applied once and then removed from the active visible goal list. They may remain in save data as `completedGoals` for persistence and analytics, but the main goal panel should show only incomplete next goals.
