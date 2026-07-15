import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(join(process.cwd(), 'src/styles/global.css'), 'utf8');

function ruleBody(selector: RegExp): string {
  const match = css.match(selector);
  expect(match?.[1]).toBeTruthy();
  return (match?.[1] ?? '').replace(/\s+/g, ' ');
}

describe('visitor and incident responsive layouts', () => {
  it('uses high-contrast ink for incident descriptions', () => {
    const descriptionRule = ruleBody(/\.incident-card \.panel-copy\s*\{([^}]*)\}/s);

    expect(descriptionRule).toContain('color: var(--color-ink)');
  });

  it('makes the decline action noticeably narrower than accept', () => {
    const rule = ruleBody(/\.visitor-actions\s*\{([^}]*)\}/s);

    expect(rule).toContain('grid-template-columns: minmax(0, 2fr) minmax(96px, 1fr)');
  });

  it('gives incident choice copy and reward preview their own rows', () => {
    const buttonRule = ruleBody(/\.incident-choice-button\s*\{([^}]*)\}/s);
    const copyRule = ruleBody(/\.incident-choice-copy > span,\s*\.incident-choice-copy small\s*\{([^}]*)\}/s);
    const previewRule = ruleBody(/\.incident-choice-list \.action-preview\.inline\s*\{([^}]*)\}/s);
    const previewTextRule = ruleBody(
      /\.incident-choice-list \.action-preview\.inline \.action-preview-text small\s*\{([^}]*)\}/s
    );
    const previewTagsRule = ruleBody(
      /\.incident-choice-list \.action-preview\.inline \.action-preview-tags\s*\{([^}]*)\}/s
    );

    expect(buttonRule).toContain('grid-template-columns: minmax(0, 1fr)');
    expect(copyRule).toContain('overflow-wrap: break-word');
    expect(copyRule).not.toContain('overflow-wrap: anywhere');
    expect(previewRule).toContain('grid-template-columns: minmax(0, 1fr)');
    expect(previewTextRule).toContain('overflow-wrap: break-word');
    expect(previewTextRule).toContain('word-break: normal');
    expect(previewTextRule).not.toContain('overflow-wrap: anywhere');
    expect(previewTagsRule).toContain('flex-wrap: wrap');
  });
});
