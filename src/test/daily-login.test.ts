import { describe, expect, it } from 'vitest';
import { checkDailyLogin, createInitialState, getDailyLoginReward, getDayIndex } from '../game/economy';

const DAY_MS = 24 * 60 * 60 * 1_000;

describe('daily login calendar', () => {
  it('grants the first-day reward for a brand new state', () => {
    const now = 5 * DAY_MS + 1_000;
    const state = createInitialState(now);
    // Simulate an old save that has never claimed a daily reward.
    const { lastLoginDay: _drop, dailyStreak: _drop2, ...legacy } = state;
    void _drop;
    void _drop2;

    const result = checkDailyLogin(legacy, now);

    expect(result.reward).toBe(50);
    expect(result.streak).toBe(1);
    expect(result.state.dailyStreak).toBe(1);
    expect(result.state.lastLoginDay).toBe(getDayIndex(now));
  });

  it('does not grant a reward twice on the same day', () => {
    const now = 5 * DAY_MS + 1_000;
    const state = createInitialState(now);
    const first = checkDailyLogin(state, now);

    const second = checkDailyLogin(first.state, now);

    expect(second.reward).toBe(0);
    expect(second.streak).toBe(1);
  });

  it('increments the streak on consecutive days', () => {
    const day1 = 5 * DAY_MS;
    const day2 = 6 * DAY_MS;
    const state = createInitialState(day1);
    const first = checkDailyLogin(state, day1);
    const second = checkDailyLogin(first.state, day2);

    expect(second.streak).toBe(2);
    expect(second.reward).toBe(100);
  });

  it('resets the streak when a day is skipped', () => {
    const day1 = 5 * DAY_MS;
    const day3 = 7 * DAY_MS;
    const state = createInitialState(day1);
    const first = checkDailyLogin(state, day1);
    const third = checkDailyLogin(first.state, day3);

    expect(third.streak).toBe(1);
    expect(third.reward).toBe(50);
  });

  it('cycles the reward back to day 1 after reaching day 7', () => {
    const day7Streak = { ...createInitialState(0), lastLoginDay: 7, dailyStreak: 7 };
    const nextDay = 8 * DAY_MS;
    const result = checkDailyLogin(day7Streak, nextDay);

    // Day 7 reward is 350. Day 8 cycles back to effective day 1 (reward 50, streak 8).
    expect(result.streak).toBe(8);
    expect(result.reward).toBe(50);
  });

  it('getDailyLoginReward scales linearly and cycles at 7', () => {
    expect(getDailyLoginReward(1)).toBe(50);
    expect(getDailyLoginReward(7)).toBe(350);
    expect(getDailyLoginReward(8)).toBe(50);
    expect(getDailyLoginReward(14)).toBe(350);
  });
});
