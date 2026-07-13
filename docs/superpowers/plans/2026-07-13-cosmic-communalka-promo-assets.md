# Cosmic Communalka Promo Assets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce the Yandex Games icon, cover and three desktop screenshots as cohesive PNG promotional artwork.

**Architecture:** Generate one source illustration per asset with a shared visual brief, then create exact-dimension PNG delivery files in `promo/`. Preserve the sources separately so that individual artwork can be regenerated without affecting the rest of the set.

**Tech Stack:** Built-in image generator, PowerShell file management, ImageMagick or bundled Python/Pillow runtime for image inspection and resizing.

## Global Constraints

- Icon delivery file is PNG at exactly 512×512 px.
- Cover delivery file is PNG at exactly 800×470 px.
- Use hand-drawn 2D retro-futurism: warm cream walls, muted blue-grey machinery, amber lights, deep navy space.
- Do not include watermarks, logos, UI chrome, or generated text.
- Do not upload to Yandex Games or save the application draft without confirmation at action time.

---

### Task 1: Generate and prepare the application icon

**Files:**
- Create: `promo/cosmic-communalka-icon-source.png`
- Create: `promo/cosmic-communalka-icon-512.png`

**Interfaces:**
- Consumes: the approved visual brief in `docs/superpowers/specs/2026-07-13-cosmic-communalka-promo-design.md`.
- Produces: the 512×512 PNG used by the Yandex Games «Иконка» field.

- [ ] **Step 1: Generate the source artwork**

Use one image-generation request with this core prompt:

```text
Use case: stylized-concept
Asset type: Yandex Games application icon
Primary request: a highly readable round porthole on an old orbital communal station, warm amber metal inner rim, deep navy starfield and a tiny blue nebula seen through the glass, one small domestic station detail such as a hanging lamp, no text
Style/medium: hand-drawn 2D retro-futurist game illustration, textured paint and subtle grain
Composition/framing: centered circular porthole, bold silhouette, generous edge clearance, square composition
Lighting/mood: cozy amber interior against cool outer space
Constraints: no watermark, no letters, no logos, no UI, no photorealism
```

- [ ] **Step 2: Save the selected source as `promo/cosmic-communalka-icon-source.png`**

Copy the selected generated PNG into the workspace `promo/` directory without replacing existing files.

- [ ] **Step 3: Produce the delivery size**

Resize the source with high-quality Lanczos resampling and write `promo/cosmic-communalka-icon-512.png` at exactly 512×512 px.

- [ ] **Step 4: Verify the delivery file**

Run an image metadata check and visually inspect the PNG. Expected result: PNG, 512×512 px, centred porthole visible at a small preview size, no text or watermark.

- [ ] **Step 5: Commit**

```bash
git add promo/cosmic-communalka-icon-source.png promo/cosmic-communalka-icon-512.png
git commit -m "assets: add Cosmic Communalka application icon"
```

### Task 2: Generate and prepare the application cover

**Files:**
- Create: `promo/cosmic-communalka-cover-source.png`
- Create: `promo/cosmic-communalka-cover-800x470.png`

**Interfaces:**
- Consumes: the approved visual brief in `docs/superpowers/specs/2026-07-13-cosmic-communalka-promo-design.md`.
- Produces: the 800×470 PNG used by the Yandex Games «Обложка» field.

- [ ] **Step 1: Generate the source artwork**

```text
Use case: ads-marketing
Asset type: Yandex Games landscape cover
Primary request: wide inviting interior of an old orbital communal station, a compact shared cosmo-kitchen connected to a resident capsule, oxygen-garden plants, warm lamps, worn cream wall panels, and a large porthole opening to navy space
Style/medium: hand-drawn 2D retro-futurist game illustration matching a cozy Soviet-era communal home in space, subtle grain
Composition/framing: cinematic landscape; important scene elements in the center and right; leave the upper-left calm and uncluttered for later title treatment; no text in image
Lighting/mood: warm domestic amber light, calm and hopeful
Constraints: no watermark, no letters, no logos, no UI, no photorealism
```

- [ ] **Step 2: Save the selected source as `promo/cosmic-communalka-cover-source.png`**

- [ ] **Step 3: Crop and resize the delivery file**

Center-crop only if required and resize to 800×470 px, writing `promo/cosmic-communalka-cover-800x470.png`. Preserve the porthole, kitchen, plants and the quiet upper-left space.

- [ ] **Step 4: Verify the delivery file**

Expected result: PNG, 800×470 px, a clear cozy station scene, no visible generated text or watermark.

- [ ] **Step 5: Commit**

```bash
git add promo/cosmic-communalka-cover-source.png promo/cosmic-communalka-cover-800x470.png
git commit -m "assets: add Cosmic Communalka cover"
```

### Task 3: Generate desktop screenshot set

**Files:**
- Create: `promo/screenshots/cosmo-kitchen-desktop.png`
- Create: `promo/screenshots/oxygen-garden-desktop.png`
- Create: `promo/screenshots/zero-g-laundry-desktop.png`

**Interfaces:**
- Consumes: approved visual brief and palette.
- Produces: three complementary desktop promotional screenshots for the Yandex Games «Скриншоты» field.

- [ ] **Step 1: Generate the cosmo-kitchen scene**

```text
Use case: stylized-concept
Asset type: desktop game promotional screenshot
Primary request: developed shared cosmo-kitchen on a worn orbital station, pantry shelves, compact stove, utensils, a warm prepared meal atmosphere, a large porthole to space
Style/medium: hand-drawn 2D retro-futurist game room illustration, warm cream and amber palette, subtle painted grain
Composition/framing: wide desktop landscape, readable room layout, no interface elements
Constraints: no watermark, no letters, no logos, no UI, no photorealism
```

- [ ] **Step 2: Generate the oxygen-garden scene**

```text
Use case: stylized-concept
Asset type: desktop game promotional screenshot
Primary request: thriving oxygen garden inside an old orbital communal station, hydroponic wall, leafy plants, small growth lamps, utility pipes and a porthole to deep space
Style/medium: hand-drawn 2D retro-futurist game room illustration, warm cream walls with muted green plants and amber light
Composition/framing: wide desktop landscape, readable room layout, no interface elements
Constraints: no watermark, no letters, no logos, no UI, no photorealism
```

- [ ] **Step 3: Generate the zero-G laundry scene**

```text
Use case: stylized-concept
Asset type: desktop game promotional screenshot
Primary request: compact zero-gravity laundry on an aging orbital station, washed blue-grey wall panels, round portholes, laundry machine, a few small domestic objects floating gently
Style/medium: hand-drawn 2D retro-futurist game room illustration, muted blue-grey machinery, cream details, amber practical lights
Composition/framing: wide desktop landscape, readable room layout, no interface elements
Constraints: no watermark, no letters, no logos, no UI, no photorealism
```

- [ ] **Step 4: Save and normalize all screenshot PNGs**

Save each approved source under `promo/screenshots/`; normalize every file to a consistent landscape desktop aspect ratio without adding text or UI.

- [ ] **Step 5: Verify the set**

Inspect each image for a coherent palette, clear room identity, landscape dimensions, PNG format, and absence of text artifacts or watermarks.

- [ ] **Step 6: Commit**

```bash
git add promo/screenshots
git commit -m "assets: add Cosmic Communalka promo screenshots"
```

### Task 4: Upload approved delivery assets

**Files:**
- Uses: `promo/cosmic-communalka-icon-512.png`
- Uses: `promo/cosmic-communalka-cover-800x470.png`
- Uses: `promo/screenshots/*.png`

**Interfaces:**
- Consumes: verified delivery PNGs and explicit user confirmation.
- Produces: uploaded artwork in the Yandex Games application draft.

- [ ] **Step 1: Ask for action-time upload confirmation**

State the exact files, destination (Yandex Games application ID 548126) and that the console will receive the uploads.

- [ ] **Step 2: Upload the icon and cover**

Choose the delivery files in their matching icon and cover controls, then verify their previews appear in the form.

- [ ] **Step 3: Upload desktop screenshots**

Select the desktop screenshot platform, upload the three verified screenshot PNGs and verify the thumbnails appear.

- [ ] **Step 4: Ask for action-time save confirmation**

State that the populated metadata and uploaded promotional assets will be saved to the Yandex Games draft.

- [ ] **Step 5: Save and verify**

Click «Сохранить» and confirm a successful save signal from the console.

## Self-review

- The icon, cover and screenshots from the approved spec each have their own generation and validation task.
- Exact icon and cover dimensions are specified in the relevant delivery steps.
- Upload and draft save remain explicitly gated on user confirmation.
- Plan contains no placeholders or undefined interfaces.
