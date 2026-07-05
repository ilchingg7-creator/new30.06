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

Room-unlock goals complete only when the room is actually purchased. Having
enough kopeks to unlock a room in the shop is not enough to claim the goal,
because otherwise goals can disappear before the player makes the intended
decision.

## Visitor Offer Filter

Visitor requests can trade kopeks for comfort, but they should not ask the
player to wait through a long forced saving period. If the player cannot afford
the visitor cost and the missing amount would take more than 7 seconds at the
current income-per-second, the offer is not generated. If income is zero, an
unaffordable visitor offer is also blocked.

`visitor_comfort_bonus` is a renovation upgrade that adds +1 comfort to accepted
visitor rewards; it does not change the offer cost.

## Renovation Gates

Renovation requires more than a positive prestige formula result. The current
cycle must satisfy all three requirements:

- `calculatePrestigeReward(state) > 0`;
- cycle station progress is complete: cycle 0 needs capsule 10+ and kitchen,
  cycle 1 needs capsule 25+ and laundry, cycle 2+ needs teleport or 5 residents;
- at least 4 non-renovation goals from the current goal cycle are completed.

If any requirement is missing, `performPrestige` returns the current state
unchanged and UI buttons stay disabled.

## Condition And Clicks

Room condition decays slowly at `-1` every 3 minutes. Room clicks no longer
repair condition; they only grant a small active kopek reward. Condition repair
comes primarily from Communal Duties so the resident system carries the repair
decision.

## Resident Economy Bonuses

Resident bonuses are part of the actual economy:

- `sleepy_engineer`: x1.05 tenant capsule income;
- `mist_cook`: x1.10 cosmo kitchen income;
- `sock_master`: x1.10 zero-g laundry income;
- `teleport_courier`: x1.05 global income;
- `retired_cosmonaut`: x1.10 global income after renovation;
- `vacuum_gardener`: +5 comfort once when unlocked;
- `three_eyed_housekeeper`: first purchase of each room costs 8% less.

Room-specific resident multipliers apply before comfort, reputation, timed
bonuses and condition multipliers. This keeps resident value visible while
preserving the existing balance formula.

## Goal Reward Effects

Goal reward kinds must match real effects:

- `comfort` adds comfort;
- `visual_detail` unlocks saved visual placeholder ids;
- `temporary_boost` creates a timed income bonus;
- `prestige_hint` only marks cycle progress.

Goal rewards still apply once and completed goals remain hidden from the active
goal panel.

## Resident-Aware Unlock Thresholds

Resident income roles accelerate the middle and late game, so module unlock
thresholds after `teleport_entry` are balanced with those bonuses enabled:

- `antigrav_gym`: 710,000;
- `panorama_dome`: 4,200,000;
- `saucer_dock`: 25,000,000;
- `radiator_balcony`: 200,000,000;
- `mail_tube_office`: 350,000,000;
- `meteorite_pantry`: 900,000,000;
- `shared_observatory`: 1,600,000,000.

The deterministic balance simulation remains the guardrail for these values.
