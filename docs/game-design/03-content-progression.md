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

Goal behavior:

- completed goals are removed from the active goal list;
- goals should guide the next action and should not remain as permanent completed entries in the main panel;
- goal rewards should no longer be credits in MVP. Use comfort, visual detail unlocks, resident-related details or temporary boosts.

## Communal Duty Content

The first duty slice covers tenant capsule, cosmo kitchen, oxygen garden and
zero-g laundry. Each duty has 2-3 eligible residents and one best match, but
every eligible resident succeeds with a useful result.
