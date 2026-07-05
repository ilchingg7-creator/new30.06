# Content And Progression

## Визуальные этапы станции

### Этап 1: Один старый модуль

Игрок видит маленькую станцию: одна округлая капсула, тусклый теплый свет, эмалевая панель и простая табличка. Это первые 1-2 минуты.

Открытия:

- капсула арендатора;
- первая лампа в окне;
- маленькая антенна;
- базовый доход.

### Этап 2: Жилая секция

Станция получает кухню, коридор, больше окон, лампы и первые бытовые декоративные элементы. Это первые 5-10 минут.

Открытия:

- общая космо-кухня;
- табличка станции;
- первые жильцы;
- задачи.

### Этап 3: Сервисный блок

Появляются кислородный сад, прачечная, сервисные трубы и аккуратные предупреждающие таблички. Станция выглядит уже как маленький дом на орбите.

Открытия:

- комфорт;
- первые множители;
- офлайн-доход становится заметным;
- VIP-жилец.

### Этап 4: Орбитальный дом

Станция расширяется в кольцо. Появляются телепорт, спортзал, купол, наружные прожекторы и заметные ретро-панели. Это середина MVP-прогресса.

Открытия:

- дорогие модули;
- подготовка к prestige;
- больше целей;
- декоративные изменения от комфорта.

### Этап 5: Коммуналка мечты

Станция яркая, многомодульная, с доком для мини-тарелок, панорамным куполом, гирляндами индикаторов и уютным орбитальным силуэтом. Игрок готов к первой реновации.

Открытия:

- prestige;
- постоянные улучшения;
- новый цикл с быстрым стартом.

## Жильцы MVP

Жильцы дают маленькие бонусы и характер станции. В MVP их не нужно делать сложной коллекционной системой, но они должны быть видимыми.

| Жилец | Открытие | Бонус |
|---|---|---|
| Сонный инженер | Капсула арендатора 10 уровня | +5% к доходу капсул |
| Повар с туманной планеты | Космо-кухня 10 уровня | +10% к доходу кухни |
| Садовник вакуума | Кислородный сад открыт | +5 комфорта |
| Мастер носков в невесомости | Прачечная 10 уровня | +10% к сервисному доходу |
| Курьер через телепорт | Телепорт открыт | +5% к общему доходу |
| VIP-астроарендатор | Rewarded ad или редкий бонус | x2 доход на 10 минут |

## Цели MVP

Цели должны направлять игрока, а не превращаться в отдельную систему квестов.

Примеры:

- купить 10 уровней капсулы;
- открыть космо-кухню;
- повысить комфорт до 25;
- заработать 10 000 кредитов;
- заселить 3 жильцов;
- открыть панорамный купол;
- сделать первую реновацию орбиты.

Награды:

- кредиты;
- комфорт;
- временный множитель;
- косметический элемент станции.

## Названия и копирайтинг

Фразы должны быть короткими, дружелюбными и понятными.

Примеры:

- "Кухня снова греет суп в невесомости."
- "Жильцы довольны. Почти все."
- "Телепорт-прихожая уменьшила очередь на три световых года."
- "Прачечная нашла носки, потерянные в прошлом цикле."

Копирайтинг не должен объяснять механику вместо интерфейса. Механика должна быть ясна по числам, кнопкам и прогрессу.

## Focused Room Progression

MVP progression should be visible through separate focused room scenes rather than only through one exterior station overview.

Each module owns one room scene:

- `tenant_capsule`: rented capsule;
- `cosmo_kitchen`: communal space kitchen;
- `oxygen_garden`: oxygen garden;
- `zero_g_laundry`: zero-g laundry;
- `teleport_entry`: teleport entry hall;
- `antigrav_gym`: antigrav gym;
- `panorama_dome`: panorama dome;
- `saucer_dock`: mini-saucer dock.

Detail tiers:

- level `0`: locked, not selectable as a scene;
- levels `1-9`: basic room;
- levels `10-24`: working room with first resident/work detail;
- levels `25-49`: cozy room with comfort props;
- levels `50-99`: busy room with service details;
- level `100+`: complete prestige-ready room.

Room switching:

- the player can manually select any unlocked room;
- buying a module level automatically focuses that room;
- after prestige or invalid saved selection, focus returns to the first unlocked room, then to the capsule.

Sprite progression:

- `tenant_capsule` now uses raster room sprites instead of the vector fallback scene;
- sprite slots are named `tenant_capsule_01.png` through `tenant_capsule_10.png`;
- each slot maps to one 10-level band: levels 1-10 use slot 01, 11-20 use slot 02, and so on up to 91-100+ using slot 10;
- the first implementation keeps all ten slots as copies of the first tenant room sprite until unique progression art is ready.

Micro-interaction layer:

- `tenant_capsule` can carry small GIF overlays that are decorative and interactive without changing income balance;
- `strange-cat.gif` is placed in the lower-right room area, away from the edge;
- clicking it plays the smaller `cat-love.gif` above the cat and starts a randomized 2-4 second cooldown.

Goal behavior:

- completed goals are removed from the active goal list;
- goals should guide the next action and should not remain as permanent completed entries in the main panel;
- goal rewards should no longer be credits in MVP. Use comfort, visual detail unlocks, resident-related details or temporary boosts.
- room-unlock goals complete only after the room is purchased, not when the player merely has enough kopeks;
- the visible goal list is selected by renovation cycle: cycle 0 before the first renovation, cycle 1 after one renovation, and cycle 2 for the second and all later renovations.

Renovation cycle goal sets:

- cycle 0: build the first capsule, open kitchen, reach comfort 25, earn 10k, unlock three residents, open panorama, make the first renovation;
- cycle 1: rebuild capsule 10, reopen kitchen, open laundry, reach comfort 40, earn 50k, make the second renovation;
- cycle 2+: rebuild capsule 25, open teleport entry, unlock five residents, reach comfort 60, earn 100k, repeat renovation.

Renovation upgrade choices:

- each completed renovation opens exactly 3 upgrade options for the next unspent tier;
- the player chooses 1 option, then waits for the next renovation to see the next tier;
- active tiers should avoid similar numeric duplicates. `higher_offline_cap` and `starting_comfort_plus` remain legacy-compatible ids but are not active choices.

Active tiers:

- tier 1: `warm_start_credits`, `first_room_discount`, `starting_comfort`;
- tier 2: `residents_survive`, `capsule_head_start`, `visitor_comfort_bonus`;
- tier 3: `reputation_income`, `offline_cap_16h`, `maintenance_drones`.

Station incident content starts with 40 ids. The first 15 are active MVP
incidents; the remaining entries are disabled backlog entries with stable ids and
visual placeholder ids.

## Communal Duty Content

The first duty slice covers tenant capsule, cosmo kitchen, oxygen garden and
zero-g laundry. Each duty has 2-3 eligible residents and one best match, but
every eligible resident succeeds with a useful result.

## Active Incident Slice

The station incident catalog keeps 40 stable ids. The active MVP slice is now
15 incidents. The extra active incidents promote existing backlog ids for
condition, resident and room-open triggers while preserving the unresolved cap
of 3 and the generation limit of 1 new incident per state update.

Active incidents should vary rewards: visual placeholder details, condition
repair and timed boosts should appear more often than direct positive kopek
rewards.

## Resident Roles

Residents now act as the first build-engine layer. Role totals are derived from
settled residents and are not stored as a new save currency.

Roles:

- `income`: improves rent/economy-oriented options;
- `comfort`: improves cozy resident and comfort options;
- `maintenance`: improves condition repair and practical station work;
- `visitor`: improves guest, courier and traffic options;
- `renovation`: reserved for future renovation-build choices.

Each resident has one primary role worth 2 points and one optional secondary
role worth 1 point. Current role profiles live in `src/game/residents.ts`.

Communal duties use preferred roles as a bonus layer. Any eligible resident can
finish a duty, but a matching role adds extra comfort or condition repair when
the result is claimed.

Station incidents can add optional role-gated choices. These choices are never
required to resolve an incident; each incident keeps at least one always
available option. Locked choices are filtered in the journal and rejected in the
domain resolver.

Renovation-build role upgrades remain future scope: the current slice only
makes resident composition matter inside duties and incident choices.
