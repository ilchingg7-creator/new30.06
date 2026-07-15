/**
 * Registers a document-level `contextmenu` listener that prevents the
 * browser context menu (right-click) across the entire page.
 *
 * Yandex Games requirement: the browser context menu must not appear.
 * The canvas-specific listener in PixiStationScene only covers the game
 * canvas; this global guard catches right-clicks on panels, buttons,
 * images, and overlay elements.
 *
 * Safe to call multiple times — uses a flag to avoid duplicate listeners.
 */
let installed = false;

export function installContextMenuGuard(): void {
  if (installed || typeof document === 'undefined') {
    return;
  }

  document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });

  installed = true;
}
