# Cosmo-Kitchen Levels 2-10 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce nine cumulative, review-ready `840x480` Soviet communal cosmo-kitchen sprites for detail levels 2-10, using the approved level-1 Soviet draft as the fixed visual base.

**Architecture:** Generate each level as a precise edit of the immediately preceding approved-in-sequence draft, preserving camera, shell, furniture, pixel scale, and every earlier addition. Normalize each generator output through the same deterministic 210x120 nearest-neighbor pipeline used for level 1, validate every frame, build one contact sheet, and stop for user approval before runtime integration.

**Tech Stack:** Built-in OpenAI image generation, PowerShell `System.Drawing`, PNG assets, local image inspection.

## Global Constraints

- The approved base is `tmp/imagegen/review/cosmo_kitchen_01_soviet_draft.png`.
- Every review frame must be an opaque `840x480` PNG composed of uniform `4x4` pixel blocks.
- Camera, curved room shell, porthole, counter, sink, red kettle, ceiling lamp, cabinet layout, calendar, checked oilcloth, and faceted tea glass must stay fixed unless the stage explicitly adds an item.
- Every stage preserves all prior additions and introduces only its specified new element.
- Soviet domestic styling is mandatory; political symbols, flags, propaganda, and military imagery are forbidden.
- Keep deliberately amateur pixel art: jagged contours, inconsistent line thickness, imperfect perspective, flat fills, crude shadows, and no antialiasing or gradients.
- No readable text, logo, signature, or watermark.
- Do not modify `src/` or `public/assets/rooms/` and do not register the review sprites in Pixi before user approval.

---

## File Structure

- Read: `tmp/imagegen/review/cosmo_kitchen_01_soviet_draft.png` — approved fixed base.
- Create: `tmp/imagegen/review/cosmo_kitchen_02_source.png` through `cosmo_kitchen_10_source.png` — untouched generator outputs.
- Create: `tmp/imagegen/review/cosmo_kitchen_02_draft.png` through `cosmo_kitchen_10_draft.png` — normalized review frames.
- Create: `tmp/imagegen/review/cosmo_kitchen_levels_01-10_contact_sheet.png` — review-only 5-by-2 contact sheet.

### Task 1: Generate the Nine Cumulative Source Frames

**Files:**
- Read: the previous normalized draft for each level.
- Create: `tmp/imagegen/review/cosmo_kitchen_02_source.png` through `cosmo_kitchen_10_source.png`.

**Interfaces:**
- Consumes: `cosmo_kitchen_01_soviet_draft.png`, then each normalized draft produced by Task 2's per-level normalization step.
- Produces: nine ordered generator source images, one for each detail level.

- [ ] **Step 1: Confirm all nine source targets are absent**

Run:

```powershell
$existing = 2..10 | ForEach-Object { 'tmp\imagegen\review\cosmo_kitchen_{0:D2}_source.png' -f $_ } | Where-Object { Test-Path -LiteralPath $_ }
if ($existing) { throw "Preserve existing sources and use revision filenames: $($existing -join ', ')" }
'PASS: level 2-10 source targets are absent'
```

Expected: `PASS: level 2-10 source targets are absent`.

- [ ] **Step 2: Use the shared precise-edit prompt for every level**

For each level, call the built-in image generation tool once. Supply the immediately preceding normalized draft as the only edit target. Use this shared prompt verbatim and append the exact stage line from Step 3:

```text
Use case: precise-object-edit
Asset type: cumulative full-frame 2D game-room sprite
Input image: edit target and previous progression stage. Preserve its exact fixed camera, 7:4 framing, curved room shell, porthole, counter, sink, red kettle, ceiling lamp, cabinet layout, Soviet household props, empty-space balance, and deliberately amateur 4x pixel-art execution.
Primary request: create the next detail level of the same Soviet communal cosmo-kitchen. Add only the stage-specific element stated below. Preserve every existing object, color region, architectural line, and object position.
Style/medium: intentionally inexperienced amateur pixel art made in a basic paint program; large square pixels; jagged staircase contours; inconsistent outline thickness; clumsy shapes; slightly wrong perspective; flat solid fills; crude sparse shadows; no antialiasing; no gradients; no professional polish.
Soviet domestic direction: worn painted enamel, chunky dark Bakelite controls, checked oilcloth, faceted glassware, old analog appliances, simple communal furniture, and visible repairs. Use only the stage-specific new cue; do not add political imagery.
Constraints: opaque full-frame image; preserve all earlier progression details; exactly one porthole; additions must remain large and readable at mobile size; no people or animals.
Avoid: moved or removed existing objects, redesigned architecture, political symbols, flags, propaganda, military imagery, readable text, logos, signatures, watermark, photorealism, 3D, clean vector geometry, smooth curves, soft glow, gradients, precise perspective, modern appliances, clutter.
```

- [ ] **Step 3: Generate and normalize each stage before using it as the next target**

Append exactly one line per call:

| Level | Stage-specific line |
|---:|---|
| 2 | `Stage-specific addition: add one crooked warm secondary wall lamp with a dark Bakelite switch and a short visible wire; change nothing else.` |
| 3 | `Stage-specific addition: add one simple enamel soup pot beside the red kettle, with two or three blocky white steam clusters; change nothing else.` |
| 4 | `Stage-specific addition: add one uneven wall shelf holding two mismatched enamel mugs and two primitive food jars with no readable labels; change nothing else.` |
| 5 | `Stage-specific addition: add one obvious bolted enamel repair patch on the right wall and one hanging striped kitchen towel; change nothing else.` |
| 6 | `Stage-specific addition: add one small old rounded refrigerator/storage cabinet with a chunky Bakelite handle at the far right, without covering the porthole or counter; change nothing else.` |
| 7 | `Stage-specific addition: add one small communal table with one mismatched wooden stool in the open right-floor area; change nothing else.` |
| 8 | `Stage-specific addition: add three hanging kitchen utensils and one large analog kitchen gauge/control panel with abstract unreadable marks; change nothing else.` |
| 9 | `Stage-specific addition: add one dim amber practical light over the communal table and a few large inhabited countertop items: one bread loaf, one folded cloth, and one extra enamel mug; change nothing else.` |
| 10 | `Stage-specific addition: add restrained celebratory warm accents for a fully equipped communal kitchen: one short string of large amber bulbs and one neat row of preserved-food jars, while keeping the room uncluttered; change nothing else.` |

After each generation:

1. Reject it if an existing object moved, disappeared, changed identity, or if extra unrequested objects appeared.
2. Copy the selected output to the exact level source filename.
3. Immediately execute Task 2 Steps 1-3 for that level.
4. Use the resulting normalized draft as the next edit target.

If a frame fails visual preservation, issue one targeted revision that names only the preservation error. Do not create unrelated variants.

### Task 2: Normalize and Validate Every Frame

**Files:**
- Read: `tmp/imagegen/review/cosmo_kitchen_02_source.png` through `cosmo_kitchen_10_source.png`.
- Create: `tmp/imagegen/review/cosmo_kitchen_02_draft.png` through `cosmo_kitchen_10_draft.png`.

**Interfaces:**
- Consumes: one generator source image at a time.
- Produces: one exact `840x480`, opaque, uniform-`4x4`-block draft that becomes the next generation target.

- [ ] **Step 1: Normalize each source through the approved level-1 pipeline**

For each source level `NN`, center-crop to 7:4, draw it to a `210x120` `Format24bppRgb` bitmap with `NearestNeighbor`, flatten only smooth warm-yellow wall pixels to RGB `(246,222,139)`, then draw the result to an `840x480` `Format24bppRgb` bitmap with `NearestNeighbor`. Save it as `cosmo_kitchen_NN_draft.png` and preserve the source.

Use the same wall-pixel predicate as level 1:

```powershell
$isWall = $color.R -ge 190 -and $color.G -ge 165 -and $color.B -ge 70 -and $color.B -le 200 -and ($color.R - $color.B) -ge 40
```

Run this function with the current integer level immediately after copying its source:

```powershell
function Convert-KitchenDraft([int]$Level) {
  Add-Type -AssemblyName System.Drawing
  $name = 'cosmo_kitchen_{0:D2}' -f $Level
  $sourcePath = Resolve-Path -LiteralPath "tmp\imagegen\review\${name}_source.png"
  $targetPath = Join-Path (Resolve-Path -LiteralPath 'tmp\imagegen\review') "${name}_draft.png"
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
    $small = New-Object System.Drawing.Bitmap 210,120,([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    try {
      $g1 = [System.Drawing.Graphics]::FromImage($small)
      try {
        $g1.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
        $g1.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
        $g1.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
        $g1.DrawImage($source,(New-Object System.Drawing.Rectangle 0,0,210,120),$cropX,$cropY,$cropWidth,$cropHeight,[System.Drawing.GraphicsUnit]::Pixel)
      } finally { $g1.Dispose() }
      $wall = [System.Drawing.Color]::FromArgb(246,222,139)
      for ($y = 0; $y -lt 120; $y++) {
        for ($x = 0; $x -lt 210; $x++) {
          $color = $small.GetPixel($x,$y)
          $isWall = $color.R -ge 190 -and $color.G -ge 165 -and $color.B -ge 70 -and $color.B -le 200 -and ($color.R - $color.B) -ge 40
          if ($isWall) { $small.SetPixel($x,$y,$wall) }
        }
      }
      $target = New-Object System.Drawing.Bitmap 840,480,([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
      try {
        $g2 = [System.Drawing.Graphics]::FromImage($target)
        try {
          $g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
          $g2.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
          $g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
          $g2.DrawImage($small,0,0,840,480)
        } finally { $g2.Dispose() }
        $target.Save($targetPath,[System.Drawing.Imaging.ImageFormat]::Png)
      } finally { $target.Dispose() }
    } finally { $small.Dispose() }
  } finally { $source.Dispose() }
}

Convert-KitchenDraft -Level 2
```

For later frames, change only the final integer argument to the current level.

- [ ] **Step 2: Run the mechanical contract after every normalization**

For each normalized draft, verify:

```text
width = 840
height = 480
pixel format = Format24bppRgb
alpha flag = absent
uniform 4x4 blocks = 25,200 of 25,200
```

Stop immediately on the first failed condition and fix only that level before generating the next one.

- [ ] **Step 3: Run the cumulative visual checklist after every level**

```text
[ ] Fixed camera and shell preserved
[ ] All prior-stage objects preserved in place
[ ] Exactly one requested new stage element is present
[ ] Soviet domestic styling remains clear
[ ] No political imagery
[ ] Deliberately rough amateur pixel-art skill level preserved
[ ] No smooth gradient, antialiasing blur, readable text, logo, signature, or watermark
[ ] Room remains readable and uncluttered at mobile scale
```

### Task 3: Build the Review Contact Sheet and Stop for Approval

**Files:**
- Read: `cosmo_kitchen_01_soviet_draft.png` and `cosmo_kitchen_02_draft.png` through `cosmo_kitchen_10_draft.png`.
- Create: `tmp/imagegen/review/cosmo_kitchen_levels_01-10_contact_sheet.png`.

**Interfaces:**
- Consumes: ten mechanically and visually validated drafts.
- Produces: one ordered 5-by-2 contact sheet for the user's room-level approval gate.

- [ ] **Step 1: Create the contact sheet**

Use `System.Drawing` to place levels 1-5 in the top row and levels 6-10 in the bottom row. Scale each frame with nearest-neighbor sampling to `420x240`. Add a `24`-pixel neutral separator between cells and a small level number outside each image; do not alter the ten source drafts.

Run:

```powershell
Add-Type -AssemblyName System.Drawing
$cellWidth = 420
$cellHeight = 240
$gap = 24
$labelHeight = 28
$sheetWidth = 5 * $cellWidth + 6 * $gap
$sheetHeight = 2 * ($cellHeight + $labelHeight) + 3 * $gap
$sheet = New-Object System.Drawing.Bitmap $sheetWidth,$sheetHeight,([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
try {
  $graphics = [System.Drawing.Graphics]::FromImage($sheet)
  try {
    $graphics.Clear([System.Drawing.Color]::FromArgb(39,49,63))
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
    $font = New-Object System.Drawing.Font 'Arial',14,([System.Drawing.FontStyle]::Bold)
    $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(248,241,223))
    try {
      for ($level = 1; $level -le 10; $level++) {
        $path = if ($level -eq 1) { 'tmp\imagegen\review\cosmo_kitchen_01_soviet_draft.png' } else { 'tmp\imagegen\review\cosmo_kitchen_{0:D2}_draft.png' -f $level }
        $image = [System.Drawing.Bitmap]::FromFile((Resolve-Path -LiteralPath $path))
        try {
          $column = ($level - 1) % 5
          $row = [Math]::Floor(($level - 1) / 5)
          $x = $gap + $column * ($cellWidth + $gap)
          $y = $gap + $row * ($cellHeight + $labelHeight + $gap)
          $graphics.DrawImage($image,$x,$y,$cellWidth,$cellHeight)
          $graphics.DrawString("LEVEL $level",$font,$brush,$x,$y + $cellHeight + 4)
        } finally { $image.Dispose() }
      }
    } finally { $font.Dispose(); $brush.Dispose() }
  } finally { $graphics.Dispose() }
  $sheet.Save((Join-Path (Resolve-Path -LiteralPath 'tmp\imagegen\review') 'cosmo_kitchen_levels_01-10_contact_sheet.png'),[System.Drawing.Imaging.ImageFormat]::Png)
} finally { $sheet.Dispose() }
```

- [ ] **Step 2: Verify the series is complete and unique**

Run:

```powershell
$drafts = @('tmp\imagegen\review\cosmo_kitchen_01_soviet_draft.png') + (2..10 | ForEach-Object { 'tmp\imagegen\review\cosmo_kitchen_{0:D2}_draft.png' -f $_ })
if (($drafts | Where-Object { Test-Path -LiteralPath $_ }).Count -ne 10) { throw 'Expected ten draft files' }
$hashes = $drafts | ForEach-Object { (Get-FileHash -LiteralPath $_ -Algorithm SHA256).Hash }
if (($hashes | Sort-Object -Unique).Count -ne 10) { throw 'Every detail level must have unique artwork' }
'PASS: ten present, ten unique'
```

Expected: `PASS: ten present, ten unique`.

- [ ] **Step 3: Present the contact sheet and stop**

Show `cosmo_kitchen_levels_01-10_contact_sheet.png` inline. Ask the user to approve the complete kitchen series or identify specific level numbers for revision.

Do not copy any draft into `public/assets/`, modify runtime code, stage files, or commit generated sprites before this approval.
