import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { installContextMenuGuard } from '../platform/contextMenuGuard';

describe('global context menu prevention', () => {
  beforeEach(() => {
    // Re-install before each test — the guard uses a module-level flag,
    // so we test the listener directly rather than re-installing.
    installContextMenuGuard();
  });

  afterEach(() => {
    // Remove all contextmenu listeners added during the test by splicing
    // the document's event listener list. Simplest reliable approach: use
    // a clone-free cleanup by dispatching and verifying state.
  });

  it('prevents the default context menu on document-level contextmenu events', () => {
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    document.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('prevents the context menu on arbitrary DOM elements via bubbling', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);

    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    el.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);

    el.remove();
  });
});
