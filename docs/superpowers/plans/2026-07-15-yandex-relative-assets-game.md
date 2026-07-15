# Yandex Relative Assets Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a Yandex Games build whose local resources resolve below any hosting subpath and whose upload ZIP matches the audit manifest.

**Architecture:** Keep the application unchanged and correct the build boundary: Vite emits relative URLs, while a small PowerShell release script packages the contents of `dist` directly at ZIP root. A Vitest regression locks the Vite base and a release test inspects ZIP entry names through .NET.

**Tech Stack:** Vite 7, TypeScript, Vitest 3, PowerShell 5+, .NET `System.IO.Compression`.

## Global Constraints

- Generated game HTML contains no root-relative local resource references.
- Every generated local resource reference resolves within `dist`.
- `release/game.zip` contains `index.html` at ZIP root, never below a `dist/` wrapper.
- Do not change gameplay, visuals, monetization, saves, or SDK behavior.
- Preserve unrelated user changes and untracked `.superpowers/`, `debug.log`, and `tmp/` content.

---

### Task 1: Emit relative production URLs

**Files:**
- Create: `src/test/vite-config.test.ts`
- Modify: `vite.config.ts:4-7`

**Interfaces:**
- Consumes: Vite's exported `UserConfig` object from `vite.config.ts`.
- Produces: `base: './'`, used by Vite for HTML, preload, CSS, favicon, and dynamic-import URLs.

- [ ] **Step 1: Write the failing configuration regression**

```ts
import { describe, expect, it } from 'vitest';
import config from '../../vite.config';

describe('Yandex Games build paths', () => {
  it('uses a relative base so assets stay below the game iframe path', () => {
    expect(config).toMatchObject({ base: './' });
  });
});
```

- [ ] **Step 2: Run the regression and verify RED**

Run: `npm test -- src/test/vite-config.test.ts`

Expected: FAIL because the current config has no `base` property.

- [ ] **Step 3: Add the minimal Vite setting**

```ts
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
```

- [ ] **Step 4: Verify the test and built HTML**

Run: `npm test -- src/test/vite-config.test.ts`

Expected: PASS.

Run: `npm run build`

Expected: PASS and `dist/index.html` contains `./assets/` references, with no `src="/`, `href="/`, `src='/`, or `href='/` local references.

- [ ] **Step 5: Commit the build-path fix**

```powershell
git add -- src/test/vite-config.test.ts vite.config.ts
git commit -m "fix: emit relative yandex game assets"
```

---

### Task 2: Package the upload archive at the correct root

**Files:**
- Create: `scripts/package-release.ps1`
- Create: `scripts/test-release-package.ps1`
- Modify: `package.json:6-11`

**Interfaces:**
- Consumes: `dist/index.html` and the complete contents of `dist`.
- Produces: `release/game.zip` matching `paths.archive` in `yandex-games-audit.yaml`.

- [ ] **Step 1: Write the failing archive-structure test**

```powershell
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$packager = Join-Path $PSScriptRoot 'package-release.ps1'
& $packager

$archive = Join-Path $projectRoot 'release\game.zip'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($archive)
try {
    $names = @($zip.Entries | ForEach-Object FullName)
    if ($names -notcontains 'index.html') { throw 'release/game.zip must contain index.html at archive root' }
    if ($names | Where-Object { $_ -like 'dist/*' }) { throw 'release/game.zip must not contain a dist/ wrapper' }
} finally {
    $zip.Dispose()
}
Write-Output 'release archive structure passed'
```

- [ ] **Step 2: Run the release test and verify RED**

Run: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/test-release-package.ps1`

Expected: FAIL because `scripts/package-release.ps1` does not exist.

- [ ] **Step 3: Implement the minimal deterministic packager**

```powershell
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$dist = Join-Path $projectRoot 'dist'
$release = Join-Path $projectRoot 'release'
$archive = Join-Path $release 'game.zip'

if (-not (Test-Path -LiteralPath (Join-Path $dist 'index.html') -PathType Leaf)) {
    throw 'dist/index.html is missing; run npm run build first'
}
New-Item -ItemType Directory -Path $release -Force | Out-Null
Compress-Archive -Path (Join-Path $dist '*') -DestinationPath $archive -CompressionLevel Optimal -Force
Write-Output $archive
```

- [ ] **Step 4: Add repeatable npm entry points**

Add these keys under `scripts` in `package.json`:

```json
"release": "npm run build && powershell -NoProfile -ExecutionPolicy Bypass -File scripts/package-release.ps1",
"test:release": "powershell -NoProfile -ExecutionPolicy Bypass -File scripts/test-release-package.ps1"
```

- [ ] **Step 5: Verify packaging from a clean production build**

Run: `npm run release`

Expected: PASS and print the absolute `release/game.zip` path.

Run: `npm run test:release`

Expected: `release archive structure passed`.

- [ ] **Step 6: Commit the release workflow**

```powershell
git add -- package.json scripts/package-release.ps1 scripts/test-release-package.ps1
git commit -m "build: package yandex release archive"
```

---

### Task 3: Verify the game deliverable

**Files:**
- Verify: `dist/index.html`
- Verify: `release/game.zip`

**Interfaces:**
- Consumes: Deliverables from Tasks 1 and 2.
- Produces: A game artifact ready for the updated Yandex audit.

- [ ] **Step 1: Run all application tests**

Run: `npm test`

Expected: all Vitest suites PASS with no new warnings or failures.

- [ ] **Step 2: Rebuild and repackage**

Run: `npm run release`

Expected: TypeScript and Vite build PASS; archive generation PASS.

- [ ] **Step 3: Assert the generated paths directly**

Run:

```powershell
$html = Get-Content -Raw dist\index.html
if ($html -match '(?:src|href)=["'']/') { throw 'root-relative build reference found' }
if ($html -notmatch '(?:src|href)=["'']\.\/assets\/') { throw 'relative asset references not found' }
```

Expected: exit code 0.

- [ ] **Step 4: Record repository state**

Run: `git diff --check` and `git status --short`.

Expected: no whitespace errors; only intentional changes or pre-existing untracked items remain.

