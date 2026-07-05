import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(join(process.cwd(), 'src/styles/global.css'), 'utf8');

function ruleBody(selectorPattern: RegExp): string {
  const match = css.match(selectorPattern);
  expect(match?.[1]).toBeTruthy();
  return (match?.[1] ?? '').replace(/\s+/g, ' ');
}

describe('Yandex Games viewport CSS', () => {
  it('locks document scrolling and browser swipe refresh at the root', () => {
    const rootRule = ruleBody(/html,\s*body,\s*#root\s*\{([^}]*)\}/s);

    expect(rootRule).toContain('height: 100%');
    expect(rootRule).toContain('overflow: hidden');
    expect(rootRule).toContain('overscroll-behavior: none');
  });

  it('keeps app shell within the browser viewport', () => {
    const shellRule = ruleBody(/\.app-shell\s*\{([^}]*)\}/s);

    expect(shellRule).toContain('height: 100dvh');
    expect(shellRule).toContain('min-height: 0');
    expect(shellRule).toContain('overflow: hidden');
  });

  it('uses internal scrolling for constrained desktop and mobile panels', () => {
    expect(ruleBody(/\.desktop-layout\s*\{([^}]*)\}/s)).toContain('overflow: hidden');
    expect(ruleBody(/\.side-panel\s*\{([^}]*)\}/s)).toContain('overflow-y: auto');

    expect(ruleBody(/\.mobile-layout\s*\{([^}]*)\}/s)).toContain('overflow: hidden');
    expect(ruleBody(/\.mobile-tab-content\s*\{([^}]*)\}/s)).toContain('overflow-y: auto');
    expect(ruleBody(/\.mobile-tab-content\s*\{([^}]*)\}/s)).toContain(
      'overscroll-behavior: contain'
    );
  });

  it('styles internal scrollbars consistently', () => {
    expect(ruleBody(/\*\s*\{([^}]*)\}/s)).toContain('scrollbar-color');
    expect(css).toContain('::-webkit-scrollbar');
    expect(css).toContain('::-webkit-scrollbar-thumb');
  });
});
