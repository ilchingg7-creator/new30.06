# Visual Style: Retro Soviet Space Cozy

## Direction

**Retro Soviet Space Cozy** - основной визуальный стиль игры. Это не историческая реконструкция и не политическая сатира. Это дружелюбная casual-эстетика старой орбитальной коммуналки: эмаль, теплые лампы, округлые модули, общие коридоры, таблички, бытовая техника и смешные сервисы на фоне космоса.

Цель стиля: игрок должен почувствовать, что станция старая, странная, но любимая. Каждый апгрейд делает ее теплее, светлее и живее.

## Keywords

Использовать:

- cozy retro space;
- old orbital apartment;
- enamel panels;
- warm window lights;
- rounded modules;
- analog meters;
- friendly sci-fi;
- communal kitchen in orbit;
- repaired, not ruined.

Избегать:

- dark military sci-fi;
- realistic industrial grime;
- hard dystopia;
- aggressive satire;
- political symbols;
- excessive nostalgia references;
- beige-only palette;
- tiny unreadable decorations.

## Palette

Палитра должна быть теплой, но не однотонной. Космос может быть глубоким, UI и станция - теплыми и читаемыми.

Core colors:

| Role | Hex | Usage |
|---|---|---|
| Space navy | `#172033` | background space, deep contrast |
| Warm panel | `#E7D7B2` | station panels, cards, soft surfaces |
| Enamel green | `#7FB7A6` | module trims, oxygen garden, success states |
| Signal red | `#D95550` | warnings, important badges, limited accents |
| Lamp amber | `#F2B84B` | windows, rewards, active states |
| Utility blue | `#5E8CCB` | interactable UI accents |
| Ink | `#27313F` | primary text on light surfaces |
| Soft white | `#F8F1DF` | text on dark surfaces, highlights |

Rules:

- Do not let beige/warm panel dominate the whole screen.
- Use navy space and colored module accents to prevent a flat sand palette.
- Signal red is an accent, not a primary UI color.
- Lamp amber should mark rewards, active production and inhabited windows.

## Shapes

Station:

- rounded cylinders;
- capsule rooms;
- ring corridors;
- small antennae;
- visible windows;
- soft exterior lights;
- bolt details kept large enough to read.

UI:

- cards radius: 6-8 px;
- buttons radius: 6-8 px;
- icon buttons for common commands;
- segmented tabs for desktop filters;
- bottom tab bar for mobile;
- meters and badges may use analog retro styling.

Avoid deeply rounded pill UI for every element. The station can be soft and round, but the interface should stay compact and readable.

## Materials

Primary materials:

- painted enamel;
- brushed but soft metal;
- rubber seals;
- warm glass;
- old plastic controls;
- cloth labels and stickers for small cozy details.

The station may show repair patches, but it should never feel dirty or hopeless. Patches communicate care and history.

## Station Readability

The station is the main visual reward. It must remain readable at mobile sizes.

The station is rendered with PixiJS. Use canvas for scene composition, lights, subtle motion and module growth. Keep readable UI text, buttons and long labels in React/DOM.

Rules:

- every module has a distinct silhouette;
- module function is visible through one clear feature;
- active modules show warm window light or motion;
- locked modules are visible as silhouettes or empty hardpoints;
- upgrades should add visible details without covering previous ones.

Examples:

- `Космо-кухня`: warm window, kettle silhouette, tiny exhaust puff.
- `Кислородный сад`: green dome, plants, soft glow.
- `Прачечная невесомости`: circular washer window, floating sock icon.
- `Телепорт-прихожая`: blue doorway ring, waiting-line sign.
- `Панорамный купол`: large glass dome, amber interior light.

## Character And Resident Style

Residents should be simple, readable and friendly.

Rules:

- big silhouette first, detail second;
- no realistic faces at small sizes;
- each resident has one memorable prop;
- residents should look odd, not scary.

Examples:

- sleepy engineer with a mug;
- mist-planet cook with a soup ladle;
- vacuum gardener with a watering can;
- laundry master chasing a floating sock;
- teleport courier with a parcel bag.

## UI Tone

UI should feel like a station control board made friendly for casual play.

Use:

- concise labels;
- warm highlight states;
- small analog meter motifs;
- status lamps;
- clear affordances for buy buttons;
- short tooltips on desktop.

Avoid:

- dense cockpit dashboards;
- small decorative labels that compete with real UI text;
- low-contrast text on textured panels;
- long tutorial text.

## Typography

Requirements:

- primary UI font must be highly readable in Cyrillic;
- numbers must be tabular or visually stable where possible;
- no negative letter spacing;
- no viewport-width font scaling;
- headings stay compact inside panels.

Possible direction:

- UI: clean sans-serif with strong Cyrillic support.
- Logo/title: custom retro lettering or display face, used sparingly.

## Motion

Motion should make the station feel alive, not distract from idle decisions.

Good motion:

- window lights turning on;
- small antenna blink;
- soft module pulse after purchase;
- floating sock near laundry;
- slow parallax stars;
- gentle coin/credit collection burst.

Avoid:

- constant screen shake;
- fast flashing indicators;
- large looping animations behind text;
- motion that moves purchase buttons.

PixiJS motion rules:

- animation must pause or remain lightweight when the tab is hidden;
- ambient loops should be subtle enough for idle play;
- the station scene must be nonblank before `LoadingAPI.ready()` is called;
- canvas resize must preserve station framing on 360x640 and 1366x768.

## Promotional Assets

Icon:

- station module or full station silhouette;
- warm window lights;
- strong navy background;
- no tiny text.

Cover:

- station as first read;
- cozy windows and retro panels;
- 2-3 residents visible if readable;
- no dark cropped space-only image.

Screenshots:

- one mobile first-screen shot;
- one desktop layout shot;
- one visual progression shot;
- one rewarded bonus or offline reward shot.

## Implementation Guardrails

- Assets and UI should share palette tokens.
- React renders UI; PixiJS renders only the station scene.
- Visual style must be documented before creating final assets.
- If plan or implementation changes colors, module silhouettes, typography, UI density or promo direction, update this file first.
- Do not use AI-generated art directly in final build without checking rights and consistency; generated images can be used for mood exploration and internal references.
