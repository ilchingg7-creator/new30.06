# Cosmic Communalka Key Art Cover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing cover with a more immediately recognizable advertising key art image at 800×470 px.

**Architecture:** Generate a new source illustration focused on one large luminous porthole and an intimate foreground of domestic orbital-station details, then crop and resample it into a dedicated versioned delivery PNG. Retain the prior cover so the selected final can be changed without data loss.

**Tech Stack:** Built-in image generator, PowerShell and System.Drawing image normalization.

## Global Constraints

- Delivery file is a PNG at exactly 800×470 px.
- The focal hook is a single large luminous porthole connecting cozy home life and deep space.
- Include a kettle, plaid throw, small cat, lamps and plants as domestic details.
- Use the existing warm cream, muted blue-grey, amber and deep-navy palette.
- No text, watermark, logo, UI chrome or photorealism.

---

### Task 1: Generate and normalize key art cover

**Files:**
- Create: `promo/cosmic-communalka-cover-key-art-source.png`
- Create: `promo/cosmic-communalka-cover-key-art-800x470.png`

**Interfaces:**
- Consumes: `docs/superpowers/specs/2026-07-13-cosmic-communalka-promo-design.md`.
- Produces: a versioned PNG that can replace the existing cover in the Yandex Games upload field.

- [ ] **Step 1: Generate source artwork**

```text
Use case: ads-marketing
Asset type: Yandex Games landscape key art cover
Primary request: bold advertising key art for a cozy orbital communal home; a single enormous luminous amber-rimmed porthole fills the left-center and opens onto deep navy starry space and a small blue nebula; in the foreground, a compact worn station room shows a steaming kettle, plaid throw, one small friendly cat resting on a cushion, leafy plants and warm hanging lamps; the image must sell the surprising idea of homey communal living in space instantly
Style/medium: polished hand-drawn 2D retro-futurist game illustration, textured paint and subtle grain
Composition/framing: 16:9 cinematic landscape, one dominant porthole focal point, high contrast silhouette, strong readable thumbnail, quieter upper-left corner for later title treatment
Lighting/mood: rich amber domestic light versus cold blue outer space, inviting and whimsical
Constraints: no text, no letters, no watermark, no logos, no UI, no photorealism
```

- [ ] **Step 2: Copy the selected source into the workspace**

Write the selected generated file as `promo/cosmic-communalka-cover-key-art-source.png` without altering existing cover variants.

- [ ] **Step 3: Normalize the delivery asset**

Center-crop only as needed, use high-quality bicubic resampling, and create `promo/cosmic-communalka-cover-key-art-800x470.png` at 800×470 px.

- [ ] **Step 4: Verify output**

Check that the final is a PNG at 800×470 px. Visually verify the large porthole remains the primary focal point, the domestic details are readable, and no generated text or watermark is present.

- [ ] **Step 5: Commit**

```bash
git add promo/cosmic-communalka-cover-key-art-source.png promo/cosmic-communalka-cover-key-art-800x470.png docs/superpowers/plans/2026-07-13-cosmic-communalka-key-art-cover.md
git commit -m "assets: add Cosmic Communalka key art cover"
```

## Self-review

- The plan covers key art generation, non-destructive workspace storage, exact-size normalization and visual verification.
- No upload or console save is included; those still require action-time confirmation.
