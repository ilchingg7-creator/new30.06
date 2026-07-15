import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(join(process.cwd(), 'src/styles/global.css'), 'utf8');

function ruleBody(selectorPattern: RegExp): string {
  const match = css.match(selectorPattern);
  expect(match?.[1]).toBeTruthy();
  return (match?.[1] ?? '').replace(/\s+/g, ' ');
}

function expectWrapping(rule: string): void {
  expect(rule).toContain('white-space: normal');
  expect(rule).toContain('overflow-wrap: anywhere');
  expect(rule).not.toContain('text-overflow: ellipsis');
  expect(rule).not.toContain('overflow: hidden');
}

describe('UI copy wrapping CSS', () => {
  it('wraps interface copy that must remain fully readable', () => {
    const wrappingRules = [
      ruleBody(/\.income-breakdown-name\s*\{([^}]*)\}/s),
      ruleBody(/\.station-task-help\.compact \.station-task-body p\s*\{([^}]*)\}/s),
      ruleBody(/\.communal-duty-panel\.compact \.panel-copy\s*\{([^}]*)\}/s),
      ruleBody(/\.action-preview\.inline \.action-preview-text small\s*\{([^}]*)\}/s)
    ];

    wrappingRules.forEach(expectWrapping);
  });

  it('wraps incident labels only between words where space allows it', () => {
    const wrappingRules = [
      ruleBody(/\.incident-choice-copy > span,\s*\.incident-choice-copy small\s*\{([^}]*)\}/s),
      ruleBody(
        /\.incident-journal\.compact \.incident-choice-copy > span,\s*\.incident-journal\.compact \.incident-choice-copy small\s*\{([^}]*)\}/s
      )
    ];

    for (const rule of wrappingRules) {
      expect(rule).toContain('white-space: normal');
      expect(rule).toContain('overflow-wrap: break-word');
      expect(rule).not.toContain('overflow-wrap: anywhere');
    }
  });

  it('keeps unbounded player names truncated on one line', () => {
    const playerNameRule = ruleBody(/\.leaderboard-name\s*\{([^}]*)\}/s);

    expect(playerNameRule).toContain('text-overflow: ellipsis');
    expect(playerNameRule).toContain('white-space: nowrap');
  });
});
