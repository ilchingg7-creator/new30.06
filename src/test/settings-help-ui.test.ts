import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { translations } from '../platform/i18n';

const css = readFileSync(join(process.cwd(), 'src/styles/global.css'), 'utf8');

describe('settings and help UI', () => {
  it('keeps language buttons visually separated', () => {
    const rule = css.match(/\.language-switcher\s*\{([^}]*)\}/s)?.[1]?.replace(/\s+/g, ' ');

    expect(rule).toContain('display: grid');
    expect(rule).toContain('gap: 8px');
  });

  it.each(['ru', 'en'] as const)('describes ad bonuses to the player in %s', (language) => {
    const copy = translations[language].helpBonusesBody;

    expect(copy).toMatch(/5/);
    expect(copy).toMatch(/10/);
    expect(copy).not.toMatch(/Yandex|platform|платформ|local|локаль|develop/i);
  });
});
