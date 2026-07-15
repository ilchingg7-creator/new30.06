// @vitest-environment node

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Yandex Games build paths', () => {
  it('uses a relative base so assets stay below the game iframe path', () => {
    const config = readFileSync(new URL('../../vite.config.ts', import.meta.url), 'utf8');

    expect(config).toMatch(/\bbase:\s*['"]\.\/['"]/);
  });
});
