# Core Loop

## Базовый цикл

Основной цикл:

```text
заработать кредиты -> купить модуль или апгрейд -> повысить доход/комфорт -> открыть новый модуль -> получить бонус -> приблизиться к prestige
```

Игрок должен всегда видеть ближайшую полезную покупку. Если денег не хватает, интерфейс показывает, сколько времени осталось при текущем доходе.

Station Director guidance is the first-pass answer to "is something live
happening right now?". It is event-only: visitors, daily rewards, communal duty
claim/assignment prompts, and prestige readiness. Goals and module purchases
stay in their own panels so the player is not pushed through a fake task list.

If no live event is relevant, the current-task panel is hidden. This prevents
low-value reminders from competing with the room scene and renovation goals,
especially on mobile.

## Communal Duties

Communal Duties are the short resident-driven decision beat. One station
situation can be active at a time. The player assigns an unlocked resident,
waits for the duty to finish, then claims comfort, condition repair or a
temporary boost. Duties do not grant direct kopeks and do not replace goals.

## Ресурсы цикла

- **Кредиты** - основная валюта, идет на модули, апгрейды и обслуживание.
- **Комфорт** - показатель качества станции, дает множители к доходу и открывает жильцов.
- **Репутация станции** - prestige-валюта, остается после перезапуска цикла.
- **Жильцы** - коллекционные бонусы и мягкая мета-прогрессия.

## Сессия на 1 минуту

Игрок заходит, забирает офлайн-доход, покупает 1-2 улучшения, видит изменение станции и уходит. В такой сессии не должно быть обязательных всплывающих окон.

## Сессия на 5 минут

Игрок открывает новый модуль, закрывает 1-2 цели, решает смотреть ли rewarded ad за ускорение, настраивает покупку апгрейдов и получает визуальный прогресс.

## Сессия на 20 минут

Игрок оптимизирует порядок апгрейдов, открывает жильцов, готовится к prestige, сравнивает мультипликаторы и может несколько раз использовать добровольные бонусы.

## Возврат после паузы

Офлайн-доход считается по времени отсутствия. MVP-ограничение: начислять максимум 8 часов офлайн-дохода без бонусов. Rewarded ad может удвоить полученный офлайн-доход.

Окно возврата должно показывать:

- сколько времени игрок отсутствовал;
- сколько кредитов заработала станция;
- что можно купить прямо сейчас;
- кнопку удвоения награды через rewarded ad.

## Реклама

Rewarded ads:

- `x2 аренда на 5 минут`;
- `удвоить офлайн-доход`;
- `заселить VIP-жильца на 10 минут`;
- `ускорить ремонт модуля`.

Interstitial ads не должны срабатывать в первые 3 минуты игры и не должны появляться во время покупки, чтения награды или prestige-экрана.

## Station Incidents

Narrative events are non-blocking station incidents. They appear in a journal
and never interrupt bulk room upgrades with modal popups. Room level can be a
supporting condition, but the main triggers are room openings, residents,
renovations, condition, room combos, offline return and scene interactions.

## Prestige loop

Current renovation rule: each completed renovation grants one permanent-upgrade
purchase slot and presents exactly 3 upgrades for that slot's tier. If the
player has made one renovation, they choose 1 of 3 tier-1 upgrades; after two
renovations, they choose 1 of 3 tier-2 upgrades; later tiers follow the same
rule. Similar linear upgrades should not appear as separate active choices
across different tiers.

Renovation is locked until the current cycle checklist is complete:

- expected renovation reputation reward is at least +1;
- the cycle's station-progress requirement is complete;
- at least 4 non-renovation goals from the current cycle are complete.

Prestige называется **"Реновация орбиты"**. Игрок временно сбрасывает модули и кредиты, но получает репутацию станции. Репутация покупает постоянные бонусы:

- выше стартовый доход;
- больше офлайн-лимит;
- дешевле первые модули;
- шанс VIP-жильца;
- декоративные уровни станции.

## Resident Roles

Residents now affect the loop mechanically, not only through collection text.
Room specialists increase their matching room income, the courier and retired
cosmonaut add global income multipliers, the vacuum gardener grants a one-time
comfort unlock bonus, and the housekeeper discounts the first purchase of each
room. These bonuses make room progression a path toward station roles instead
of only a numeric income ladder.

## Reward Variety

Goals and incidents should use varied rewards. Comfort remains valid, but some
goals now unlock visual placeholder details or short timed income boosts.
Station incidents should stay non-blocking and avoid credit-heavy rewards:
visual details, condition repair and timed bonuses are preferred.
