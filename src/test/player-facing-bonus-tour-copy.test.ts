import { describe, expect, it } from 'vitest';
import { translations } from '../platform/i18n';

describe('player-facing bonus tour copy', () => {
  it('describes ad bonuses without platform or developer language', () => {
    const copy = translations.ru.tourStepBonusesBody;

    expect(copy).toBe(
      'Хотите больше дохода? Смотрите рекламу, удваивайте аренду и приглашайте VIP-жильца. А за ежедневный вход вас ждут награды.'
    );
    expect(copy).not.toMatch(/Yandex Games|локальн/i);
  });
});
