# Cosmo-Kitchen Level-1 Pilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce one review-ready `840x480` level-1 cosmo-kitchen sprite that deliberately matches the naive amateur pixel-art character of `tenant_capsule_01.png`, then stop for user approval.

**Architecture:** Treat the existing capsule PNG as a style reference, not an edit target. Generate one landscape kitchen draft, normalize it non-destructively to the game frame, validate it mechanically and visually, and keep it under `tmp/imagegen/review/` until the user approves it. Do not register the asset in Pixi or generate levels 2-10 in this plan.

**Tech Stack:** Built-in OpenAI image generation, local image inspection, PowerShell with `System.Drawing` for deterministic crop/resize, PNG assets.

## Global Constraints

- The review sprite must be an opaque `840x480` PNG.
- The room must use a fixed 7:4 camera with a curved orbital shell, one porthole, one counter, and one primitive kettle.
- The style must use large visible pixels, no antialiasing, uneven stair-stepped contours, inconsistent line thickness, imperfect perspective, flat colors, and sparse coarse shadows.
- The result must feel handmade in a simple paint program, not like polished professional pixel art.
- The image must contain no readable signs, generated text, signature, or watermark.
- Generated work remains review material and must not enter `public/assets/` or runtime code before explicit user approval.
- Do not generate levels 2-10 or any other room during this plan.

---

## File Structure

- Reference: `public/assets/rooms/tenant_capsule/tenant_capsule_01.png` — visual roughness, pixel scale, framing, and palette reference.
- Create: `tmp/imagegen/review/cosmo_kitchen_01_source.png` — untouched selected generator output.
- Create: `tmp/imagegen/review/cosmo_kitchen_01_draft.png` — cropped and nearest-neighbor resized `840x480` review sprite.
- Do not modify `src/station/roomScenes.ts` or files under `public/assets/rooms/` in this pilot.

### Task 1: Generate the Naive Pixel-Art Source

**Files:**
- Reference: `public/assets/rooms/tenant_capsule/tenant_capsule_01.png`
- Create: `tmp/imagegen/review/cosmo_kitchen_01_source.png`

**Interfaces:**
- Consumes: the capsule image as a style-only reference.
- Produces: one selected landscape PNG at `tmp/imagegen/review/cosmo_kitchen_01_source.png`.

- [ ] **Step 1: Inspect the reference at original resolution**

Use `view_image` with `detail: "original"` on the absolute path to `tenant_capsule_01.png`.

Record these invariants before prompting: full-frame opaque room, warm pale-yellow shell, black/navy porthole, large jagged pixels, awkward hand-drawn perspective, uneven contour thickness, primitive recognizable furniture, flat fills, and no polished shading.

- [ ] **Step 2: Verify the review source does not already exist**

Run:

```powershell
if (Test-Path -LiteralPath 'tmp\imagegen\review\cosmo_kitchen_01_source.png') { throw 'Review source already exists; preserve it and choose a new revision filename.' } else { 'EXPECTED FAILING PRECONDITION: source is absent' }
```

Expected: `EXPECTED FAILING PRECONDITION: source is absent`.

- [ ] **Step 3: Generate one image with the capsule as the style reference**

Use the built-in image generation tool with `referenced_image_paths` containing only the absolute capsule PNG path and this exact prompt:

```text
Use case: stylized-concept
Asset type: full-frame 2D game-room sprite draft
Input image: Image 1 is a style-only reference. Match its deliberately crude amateur pixel-art execution; do not copy its furniture or room layout.
Primary request: draw the level-1 communal cosmo-kitchen inside the same kind of old orbital apartment.
Scene/backdrop: one full-frame curved orbital room, fixed 7:4 landscape composition, pale warm-yellow walls and floor, one oval porthole showing simple black space with a few blocky stars.
Subject: a bare communal kitchen with one crooked counter and one primitive kettle; the function must be readable immediately, but the room must still feel sparse and low-level.
Style/medium: intentionally naive amateur pixel art, as if drawn by a person who does not know professional pixel-art technique in a basic paint program; very large visible pixels; jagged stair-step curves; uneven hand-drawn outlines; inconsistent line thickness; slightly wrong perspective; clumsy but charming shapes; flat fills; sparse crude shadows; no antialiasing; no smooth vector geometry; no gradients; no polished rendering.
Composition/framing: match the reference's straight-on room framing and generous empty wall area; keep all important objects away from the extreme edges.
Color palette: warm pale yellow and beige shell, dark brown/navy outlines, small amber, faded red, enamel green, and utility blue accents.
Constraints: opaque full-frame image; preserve the deliberately rough handmade look; only one porthole, one counter, and one kettle; no people or animals.
Avoid: professional pixel art, clean circles, precise perspective, isometric view, photorealism, 3D rendering, soft light, smooth curves, tiny detail, readable labels, text, logo, signature, watermark.
```

Expected: one landscape source image visibly closer to the capsule's roughness than to polished pixel art.

- [ ] **Step 4: Inspect the generated source before saving it**

Reject the source immediately if any of these are present: smooth painted edges, clean vector curves, realistic lighting, precise perspective, dense decorative detail, readable text, watermark, multiple windows, residents, or a camera angle different from the reference.

If rejected, issue one targeted image-generation revision that repeats all invariants and changes only the single dominant mismatch. Do not generate multiple unrelated variants.

- [ ] **Step 5: Copy the selected generator output non-destructively**

Create `tmp/imagegen/review/`, then copy the exact local image path returned by the built-in image tool to `tmp/imagegen/review/cosmo_kitchen_01_source.png`. Use a literal-path copy and preserve the original generated file.

Expected: `tmp/imagegen/review/cosmo_kitchen_01_source.png` exists and the original generated file remains untouched.

### Task 2: Normalize and Validate the Review Sprite

**Files:**
- Read: `tmp/imagegen/review/cosmo_kitchen_01_source.png`
- Create: `tmp/imagegen/review/cosmo_kitchen_01_draft.png`

**Interfaces:**
- Consumes: the selected source PNG from Task 1.
- Produces: one exact `840x480` opaque review sprite for user approval.

- [ ] **Step 1: Verify the normalized draft does not yet satisfy the contract**

Run:

```powershell
$path = 'tmp\imagegen\review\cosmo_kitchen_01_draft.png'
if (-not (Test-Path -LiteralPath $path)) { throw 'EXPECTED FAILURE: normalized 840x480 draft is missing' }
```

Expected: command fails with `EXPECTED FAILURE: normalized 840x480 draft is missing`.

- [ ] **Step 2: Center-crop to 7:4 and resize with nearest-neighbor sampling**

Run this PowerShell script from the repository root:

```powershell
Add-Type -AssemblyName System.Drawing
$sourcePath = Resolve-Path -LiteralPath 'tmp\imagegen\review\cosmo_kitchen_01_source.png'
$targetPath = Join-Path (Resolve-Path -LiteralPath 'tmp\imagegen\review') 'cosmo_kitchen_01_draft.png'
$source = [System.Drawing.Bitmap]::FromFile($sourcePath)
try {
  $targetRatio = 840.0 / 480.0
  $sourceRatio = $source.Width / [double]$source.Height
  if ($sourceRatio -gt $targetRatio) {
    $cropHeight = $source.Height
    $cropWidth = [int][Math]::Round($cropHeight * $targetRatio)
    $cropX = [int][Math]::Floor(($source.Width - $cropWidth) / 2)
    $cropY = 0
  } else {
    $cropWidth = $source.Width
    $cropHeight = [int][Math]::Round($cropWidth / $targetRatio)
    $cropX = 0
    $cropY = [int][Math]::Floor(($source.Height - $cropHeight) / 2)
  }
  $target = New-Object System.Drawing.Bitmap 840, 480, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  try {
    $graphics = [System.Drawing.Graphics]::FromImage($target)
    try {
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
      $graphics.DrawImage($source, (New-Object System.Drawing.Rectangle 0,0,840,480), $cropX,$cropY,$cropWidth,$cropHeight, [System.Drawing.GraphicsUnit]::Pixel)
    } finally { $graphics.Dispose() }
    $target.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally { $target.Dispose() }
} finally { $source.Dispose() }
```

Expected: `tmp/imagegen/review/cosmo_kitchen_01_draft.png` is created without modifying the source.

- [ ] **Step 3: Verify dimensions and opacity**

Run:

```powershell
Add-Type -AssemblyName System.Drawing
$image = [System.Drawing.Bitmap]::FromFile((Resolve-Path -LiteralPath 'tmp\imagegen\review\cosmo_kitchen_01_draft.png'))
try {
  if ($image.Width -ne 840 -or $image.Height -ne 480) { throw "Wrong dimensions: $($image.Width)x$($image.Height)" }
  if (($image.PixelFormat -band [System.Drawing.Imaging.PixelFormat]::Alpha) -ne 0) { throw "Unexpected alpha pixel format: $($image.PixelFormat)" }
  "PASS: $($image.Width)x$($image.Height), opaque pixel format $($image.PixelFormat)"
} finally { $image.Dispose() }
```

Expected: `PASS: 840x480, opaque pixel format Format24bppRgb`.

- [ ] **Step 4: Inspect at original and mobile preview sizes**

Open `cosmo_kitchen_01_draft.png` at original resolution. Confirm the kettle, counter, and porthole remain recognizable, while contours remain visibly jagged and amateur.

Create no additional asset for the mobile check. View the same image fitted to approximately `390x223` and confirm the kitchen function is still readable and the room is not cluttered.

- [ ] **Step 5: Compare against the approved checklist**

The draft passes only if all answers are yes:

```text
[ ] Same deliberately crude visual skill level as tenant_capsule_01.png
[ ] Large visible pixels and no antialiasing blur
[ ] Uneven contours and imperfect perspective
[ ] Sparse level-1 composition
[ ] Exactly one porthole, one counter, and one primitive kettle
[ ] Warm orbital-apartment palette
[ ] No readable text, signature, logo, or watermark
[ ] Exact opaque 840x480 PNG
```

If one item fails, make one targeted revision to the source, repeat the deterministic normalization, and re-run the complete checklist.

- [ ] **Step 6: Present the draft and stop for approval**

Show `tmp/imagegen/review/cosmo_kitchen_01_draft.png` inline and state that it is a review draft, not a runtime asset. Ask the user to approve it or name one concrete change.

Do not copy it into `public/assets/`, modify code, generate levels 2-10, stage files, or create a commit in this plan. The approval response determines the next plan.
