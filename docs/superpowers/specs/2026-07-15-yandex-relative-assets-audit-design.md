# Relative Asset Paths for Yandex Games

## Problem

The production build contains the JavaScript and CSS chunks referenced by `dist/index.html`, but the HTML uses root-relative URLs such as `/assets/index-*.js`. Yandex Games serves an uploaded game below a platform-controlled path, so those URLs resolve against the platform origin instead of the game directory and return HTTP 404.

The current Yandex Games audit does not report this packaging defect before browser execution. It can also stop on a missing configured archive without explaining that the already-built HTML contains unsafe resource paths.

## Scope

This change has two deliverables:

1. Make the game build portable to a non-root hosting path and produce the archive declared in `yandex-games-audit.yaml`.
2. Extend the installed `auditing-yandex-games` skill so future audits detect unsafe or unresolved local resource references deterministically.

Warnings emitted by the Yandex platform shell, including its deprecated Apple meta tag and banner lifecycle messages, are outside this change unless the completed runtime audit attributes them to the game build.

## Game Build Design

Vite will use a relative production base so generated module, preload, stylesheet, favicon, and dynamically imported chunk URLs remain inside the uploaded game directory. A regression test will build the real application and inspect the resulting HTML. It will fail when a local executable or stylesheet reference starts with `/` or when a referenced local file cannot be resolved beneath `dist`.

The release workflow will create `release/game.zip` with `index.html` at the archive root and the complete `assets` directory beside it. The archive must not contain an extra enclosing `dist` directory.

## Auditor Design

The deterministic audit will inspect local resource references in the effective build artifact before browser scenarios. For HTML attributes that load game resources, including `script[src]`, `link[href]`, media sources, and other supported local URLs, it will:

- ignore fragment-only, data, blob, mail, telephone, and external HTTP(S) references;
- reject root-relative local paths because they escape the game directory on subpath hosting;
- resolve relative paths from the containing HTML file;
- reject references that escape the build/archive root;
- report references whose target is missing;
- preserve query strings and fragments for reporting while excluding them during filesystem resolution.

The check will be stack-independent. It will inspect built output rather than requiring a particular Vite setting. A Vite-specific configuration check is deliberately excluded because it would miss other build tools and handwritten HTML.

Each finding will use a catalog-backed rule ID, source, and recommendation. If no suitable active rule exists, the audit's process-level finding catalog will be extended consistently rather than inventing a Yandex rule citation. Deterministic status remains authoritative.

## Test Strategy

The game regression test will first demonstrate that the current build emits unsafe root-relative references, then pass after the minimal Vite base change.

The auditor will gain fixtures for:

- a valid relative asset reference;
- a root-relative asset reference;
- a missing relative asset;
- a traversal outside the artifact root;
- an external or inline URL that must be ignored;
- an archive whose `index.html` and assets are correctly rooted.

After both changes, verification will run the game tests, production build, archive inspection, auditor tests, and the complete build/server/browser audit for all desktop/mobile orientations declared by the manifest.

## Success Criteria

- Generated game HTML contains no root-relative local resource references.
- Every generated local resource reference resolves within `dist`.
- `release/game.zip` exists with root-level `index.html` and all referenced assets.
- The updated auditor fails its bad-path fixtures and passes its valid fixtures.
- The full Yandex Games audit no longer reports the archive blocker or asset 404s.
- Any remaining platform warnings are recorded separately and are not misattributed to the game.

## Non-Goals

- Changing gameplay, visuals, monetization, saves, or SDK behavior.
- Suppressing unrelated console output from the Yandex Games host.
- Updating the pinned Yandex rules snapshot unless an exact source entry required by the new check is absent and the user separately requests a rules refresh.
