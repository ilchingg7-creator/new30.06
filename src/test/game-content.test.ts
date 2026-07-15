import { describe, expect, it } from 'vitest';
import { goals } from '../game/content/goals';
import { modules } from '../game/content/modules';
import { prestigeUpgrades } from '../game/content/prestigeUpgrades';
import { residents } from '../game/content/residents';
import { translations } from '../platform/i18n';

describe('game content', () => {
  it('defines 10 modules with increasing base prices', () => {
    expect(modules).toHaveLength(14);

    const prices = modules.map((module) => module.baseCost);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('uses unique ids for modules, residents and goals', () => {
    const ids = [...modules, ...residents, ...goals].map((item) => item.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps every module visually mapped for station rendering', () => {
    expect(modules.every((module) => module.visualKey.length > 0)).toBe(true);
  });

  it('describes offline cap upgrades and the plumber bonus with current values', () => {
    expect(translations.ru.higherOfflineCapDesc).toBe('Лимит офлайн-дохода увеличен с 3 до 4,5 часа.');
    expect(translations.en.higherOfflineCapDesc).toBe('Offline income cap increased from 3 to 4.5 hours.');
    expect(translations.ru.content.prestigeUpgrades.higher_offline_cap.description).toBe(
      'Лимит офлайн-дохода увеличен с 3 до 4,5 часа.'
    );
    expect(translations.en.content.prestigeUpgrades.higher_offline_cap.description).toBe(
      'Offline income cap increased from 3 to 4.5 hours.'
    );
    expect(translations.ru.content.prestigeUpgrades.offline_cap_16h.description).toBe(
      'Лимит офлайн-дохода увеличен до 6 часов.'
    );
    expect(translations.en.content.prestigeUpgrades.offline_cap_16h.description).toBe(
      'Offline income cap increased to 6 hours.'
    );
    expect(translations.ru.content.residents.comet_plumber.bonusText).toBe('+1 час к лимиту офлайн-дохода');
    expect(translations.en.content.residents.comet_plumber.bonusText).toBe('+1 hour to offline income cap');

    expect(prestigeUpgrades.find(({ id }) => id === 'offline_cap_16h')?.description).toBe(
      'Лимит офлайн-дохода увеличен до 6 часов.'
    );
    expect(residents.find(({ id }) => id === 'comet_plumber')?.bonusText).toBe(
      '+1 час к лимиту офлайн-дохода'
    );
  });
});
