# Yandex Asset Path Auditor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the installed Yandex Games audit so root-relative, escaping, and missing local HTML resources are deterministic failures before browser review.

**Architecture:** Add one stack-independent HTML-reference inspector to the existing static audit library. Feed it either the build inventory or decoded files from the submitted ZIP, preserve archive precedence, and join failures to active catalog Rule 1.22 without changing the pinned rule snapshot.

**Tech Stack:** Node.js 20+ ESM, built-in `node:test`-style assertions used by the custom test runner, ZIP inspection already implemented in `scripts/lib/audit.mjs`.

## Global Constraints

- Modify the existing installed skill at `C:\Users\Пользователь\.codex\skills\auditing-yandex-games`; do not create a second skill.
- Request filesystem approval before writing outside the game workspace.
- Do not run `update-rules`; the user requested audit behavior, not a pinned rules refresh.
- Every publication verdict must retain the exact ID, source, and recommendation from active `references/rules.json`.
- Rule 1.22 remains the catalog-backed verdict for archive-root and portable-resource structure.
- External HTTP(S), protocol-relative, data, blob, mailto, tel, and fragment-only URLs are not local archive targets.
- The submitted ZIP remains authoritative when `paths.archive` is configured and structurally readable.

---

### Task 1: Detect unsafe local resource references

**Files:**
- Modify: `C:\Users\Пользователь\.codex\skills\auditing-yandex-games\tests\audit.test.mjs:1-25,306-318`
- Modify: `C:\Users\Пользователь\.codex\skills\auditing-yandex-games\scripts\lib\audit.mjs:1-56`

**Interfaces:**
- Produces: `inspectLocalResourceReferences(files: Array<{ relative: string, text: string }>): Array<{ html: string, url: string, reason: 'root-relative' | 'outside-root' | 'missing' }>`.
- Consumes: normalized forward-slash artifact paths and HTML text from a build inventory or decoded ZIP.

- [ ] **Step 1: Add the failing unit scenario**

Import `inspectLocalResourceReferences` from `../scripts/lib/audit.mjs`, then add:

```js
function testLocalResourceReferences() {
  const files = [
    {
      relative: 'index.html',
      text: '<script src="./assets/game.js"></script><link href="/assets/root.css"><img src="./missing.png"><object data="../escape.bin"></object><script src="https://yandex.ru/games/sdk/v2"></script><img src="data:image/png;base64,AA==">',
    },
    { relative: 'assets/game.js', text: '' },
  ];
  assert.deepEqual(inspectLocalResourceReferences(files), [
    { html: 'index.html', url: '/assets/root.css', reason: 'root-relative' },
    { html: 'index.html', url: './missing.png', reason: 'missing' },
    { html: 'index.html', url: '../escape.bin', reason: 'outside-root' },
  ]);
  assert.deepEqual(inspectLocalResourceReferences([
    { relative: 'nested/index.html', text: '<script src="../assets/game.js?v=1#boot"></script>' },
    { relative: 'assets/game.js', text: '' },
  ]), []);
}
```

Call `testLocalResourceReferences()` from `runTests()` and update its result to `10 test groups passed`.

- [ ] **Step 2: Run the unit scenario and verify RED**

Run: `node tests/audit.test.mjs`

Expected: FAIL because `inspectLocalResourceReferences` is not exported.

- [ ] **Step 3: Implement the minimal inspector**

Add focused helpers near `inventory`:

```js
const LOCAL_RESOURCE_ATTRIBUTE = /\b(?:src|href|poster|data)\s*=\s*(["'])(.*?)\1/gi;
const IGNORED_RESOURCE_URL = /^(?:#|\/\/|[a-z][a-z0-9+.-]*:)/i;

export function inspectLocalResourceReferences(files) {
  const names = new Set(files.map((file) => file.relative.replaceAll('\\', '/')));
  const issues = [];
  for (const file of files.filter((item) => /\.html?$/i.test(item.relative))) {
    for (const match of file.text.matchAll(LOCAL_RESOURCE_ATTRIBUTE)) {
      const url = match[2].trim();
      if (!url || IGNORED_RESOURCE_URL.test(url)) continue;
      if (url.startsWith('/')) {
        issues.push({ html: file.relative, url, reason: 'root-relative' });
        continue;
      }
      const pathname = url.split(/[?#]/, 1)[0];
      const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file.relative), pathname));
      if (resolved === '..' || resolved.startsWith('../')) issues.push({ html: file.relative, url, reason: 'outside-root' });
      else if (!names.has(resolved)) issues.push({ html: file.relative, url, reason: 'missing' });
    }
  }
  return issues.sort((left, right) => `${left.html}\0${left.url}`.localeCompare(`${right.html}\0${right.url}`, 'en'));
}
```

- [ ] **Step 4: Verify GREEN**

Run: `node tests/audit.test.mjs`

Expected: `10 test groups passed`.

- [ ] **Step 5: Keep the edit available for integration**

Do not install or publish yet. The installed skill is not a Git repository; retain the tested files in place and continue immediately to Task 2.

---

### Task 2: Apply the check to builds and submitted ZIPs

**Files:**
- Modify: `C:\Users\Пользователь\.codex\skills\auditing-yandex-games\scripts\lib\audit.mjs:57-222,225-309`
- Modify: `C:\Users\Пользователь\.codex\skills\auditing-yandex-games\tests\audit.test.mjs:95-130,217-304`
- Modify: `C:\Users\Пользователь\.codex\skills\auditing-yandex-games\tests\fixtures\passing-game\dist\index.html`

**Interfaces:**
- Extends: `inspectZipBuffer(bytes, options)` valid results with `files`, using the same `{ relative, text }` shape as build inventory.
- Consumes: `inspectLocalResourceReferences(files)` from Task 1.
- Produces: Rule 1.22 `BLOCKER` evidence for root-relative, outside-root, or missing resource targets.

- [ ] **Step 1: Add failing build and archive integration assertions**

Add a temporary-project scenario that writes `dist/index.html` with `/assets/game.js`, runs `auditProject`, and asserts:

```js
assert.equal(byRule.get('1.22').status, 'BLOCKER');
assert.match(byRule.get('1.22').evidence, /root-relative.*\/assets\/game\.js/i);
```

Extend `testZipInspectionAndArchivePrecedence()` with a ZIP containing root `index.html` whose contents reference `/assets/game.js`, plus a present `assets/game.js`, and assert Rule 1.22 is `BLOCKER`. Then write a ZIP using `./assets/game.js` and assert Rule 1.22 is `PASS`.

- [ ] **Step 2: Run the integration tests and verify RED**

Run: `node tests/audit.test.mjs`

Expected: FAIL because Rule 1.22 still passes portable entry names without inspecting HTML references.

- [ ] **Step 3: Preserve decoded artifact files for valid ZIPs**

Within `inspectZipBuffer`, collect each decoded non-directory entry:

```js
const files = [];
// after successful decode and CRC verification
files.push({
  relative: name,
  text: TEXT_EXTENSIONS.has(path.extname(name).toLowerCase()) ? decoded.toString('utf8') : '',
});
```

Return `files` on valid and fully decoded oversize-safe results; return an empty array on invalid or unsupported results so no unverified path verdict becomes PASS.

- [ ] **Step 4: Join reference portability to Rule 1.22**

Create a formatter:

```js
function referenceEvidence(issues) {
  return issues.map((issue) => `${issue.reason}: ${issue.html} -> ${issue.url}`).join('; ');
}
```

For builds without an archive, inspect `files`. For a valid submitted ZIP, inspect `zip.files` and make Rule 1.22 `BLOCKER` when any issue exists; otherwise preserve the existing root-index and portable-name result. Do not change Rule 1.22's catalog source or recommendation.

- [ ] **Step 5: Make the passing fixture genuinely portable**

Change its SDK tag from `src="/sdk.js"` to the external platform SDK:

```html
<script src="https://yandex.ru/games/sdk/v2"></script>
```

Keep `src="game.js"`; `game.js` already contains `YaGames.init()` and `LoadingAPI.ready()` evidence.

- [ ] **Step 6: Verify all auditor code tests**

Run: `npm test`

Expected: `10 audit / 21 workflow / skill tests passed` after Task 3 updates the validation text expectation.

---

### Task 3: Teach and validate the updated skill behavior

**Files:**
- Modify: `C:\Users\Пользователь\.codex\skills\auditing-yandex-games\tests\skill.test.mjs:12-45`
- Modify: `C:\Users\Пользователь\.codex\skills\auditing-yandex-games\SKILL.md:11-30`
- Modify: `C:\Users\Пользователь\.codex\skills\auditing-yandex-games\references\validation-report.md`

**Interfaces:**
- Consumes: Deterministic Rule 1.22 behavior from Task 2.
- Produces: Discoverable instructions telling future audit runs that local resource paths are checked in the effective artifact.

- [ ] **Step 1: Add failing skill-text assertions**

```js
assert.match(skill, /root-relative.*local resource/i);
assert.match(skill, /submitted archive.*takes precedence/i);
assert.match(skill, /Rule 1\.22.*resource path/i);
```

Update the validation-report assertion from `9 audit` to `10 audit`.

- [ ] **Step 2: Run skill tests and verify RED**

Run: `node tests/skill.test.mjs`

Expected: FAIL because the current skill does not describe the new deterministic check.

- [ ] **Step 3: Add the minimal guidance**

In Workflow step 2, state that the static phase validates root `index.html`, portable entry names, and root-relative/missing/escaping local resource paths in the submitted archive, which takes precedence over the build directory. In Common Mistakes, add:

```markdown
- Treating present chunk files as sufficient when `index.html` uses root-relative local resource paths; preserve deterministic Rule 1.22 evidence.
```

- [ ] **Step 4: Record RED/GREEN evidence from the real game**

Append a concise section to `references/validation-report.md`:

```markdown
## Asset-path regression

- RED: the production HTML referenced existing chunks through `/assets/...`; the audit did not report them before browser 404s.
- GREEN: the same fixture is a Rule 1.22 `BLOCKER`, while relative existing references pass.
```

Update the automated validation count to `10 audit / 21 workflow / skill tests passed`.

- [ ] **Step 5: Validate the complete skill**

Run: `npm test`

Expected: `10 audit / 21 workflow / skill tests passed`.

Run: `node scripts/validate-skill.mjs`

Expected: `Valid skill: auditing-yandex-games` with the indexed documentation URL count.

---

### Task 4: Forward-test the installed auditor against the game

**Files:**
- Verify: `C:\Users\Пользователь\Documents\ЯИ\new30.06\dist\index.html`
- Verify: `C:\Users\Пользователь\Documents\ЯИ\new30.06\release\game.zip`
- Verify: `C:\Users\Пользователь\Documents\ЯИ\new30.06\yandex-games-audit.yaml`

**Interfaces:**
- Consumes: Portable game archive from the game plan and updated installed audit CLI.
- Produces: JSON evidence from static and desktop/mobile runtime checks.

- [ ] **Step 1: Run the deterministic build/server/browser audit**

Run from the skill directory:

```powershell
node scripts/audit.mjs 'C:\Users\Пользователь\Documents\ЯИ\new30.06' --run-build --run-serve --format json
```

Expected: no `AUDIT-ARCHIVE` blocker; Rule 1.22 does not report root-relative, missing, or escaping local resources; runtime reports no game-owned asset 404s.

- [ ] **Step 2: Inspect any remaining console/network findings**

Compare each remaining item with its request URL and frame origin. Classify Yandex host-shell messages separately from game artifact failures. Do not turn `MANUAL` into `PASS` and do not claim publication acceptance is guaranteed.

- [ ] **Step 3: Re-run both verification suites**

Run game `npm test`, game `npm run release`, auditor `npm test`, and auditor `node scripts/validate-skill.mjs`.

Expected: every command exits 0 with the same counts and archive structure as the earlier focused runs.

- [ ] **Step 4: Report the exact deliverables**

Report the game commits, `release/game.zip`, changed installed-skill files, Rule 1.22 result, and any remaining `MANUAL`/platform-owned observations. Do not claim a commit for the installed skill because its directory is not a Git repository.

