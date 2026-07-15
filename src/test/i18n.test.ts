import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getDefaultLanguage, setStoredLanguage } from '../platform/i18n';

const LANGUAGE_KEY = 'cosmic-communalka-language';

beforeEach(() => {
  window.history.replaceState({}, '', '/');
  window.localStorage.clear();
  delete window.__cosmicCommunalkaSessionLanguage;
  delete window.__yaSdkLang;
});

afterEach(() => {
  window.history.replaceState({}, '', '/');
  delete window.__cosmicCommunalkaSessionLanguage;
  delete window.__yaSdkLang;
});

describe('language detection', () => {
  it('uses ?lang=en before Russian browser language', () => {
    window.history.replaceState({}, '', '/?debug-mode=16&lang=en');
    Object.defineProperty(navigator, 'language', { configurable: true, value: 'ru-RU' });

    expect(getDefaultLanguage()).toBe('en');
  });

  it('uses ?lang=ru before English browser language', () => {
    window.history.replaceState({}, '', '/?lang=ru');
    Object.defineProperty(navigator, 'language', { configurable: true, value: 'en-US' });

    expect(getDefaultLanguage()).toBe('ru');
  });

  it('keeps a manual page choice above the URL without localStorage persistence', () => {
    window.history.replaceState({}, '', '/?lang=en');

    setStoredLanguage('ru');

    expect(getDefaultLanguage()).toBe('ru');
    expect(window.localStorage.getItem(LANGUAGE_KEY)).toBeNull();
  });

  it('falls back to the SDK language for an invalid URL language', () => {
    window.history.replaceState({}, '', '/?lang=not-a-language');
    window.__yaSdkLang = 'en';
    Object.defineProperty(navigator, 'language', { configurable: true, value: 'ru-RU' });

    expect(getDefaultLanguage()).toBe('en');
  });

  it.each(['ru', 'be', 'uk', 'kk', 'uz'])('maps URL language %s to Russian', (lang) => {
    window.history.replaceState({}, '', `/?lang=${lang}`);
    Object.defineProperty(navigator, 'language', { configurable: true, value: 'en-US' });

    expect(getDefaultLanguage()).toBe('ru');
  });

  it('maps other valid language codes to English', () => {
    window.history.replaceState({}, '', '/?lang=de');
    Object.defineProperty(navigator, 'language', { configurable: true, value: 'ru-RU' });

    expect(getDefaultLanguage()).toBe('en');
  });
});
