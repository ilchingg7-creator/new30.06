import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { installContextMenuGuard } from './platform/contextMenuGuard';
import './styles/tokens.css';
import './styles/global.css';

// Yandex Games requirement: disable the browser context menu (right-click)
// across the entire page.
installContextMenuGuard();

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
