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

    // Day 1: comfort +1
    expect(result.reward.kind).toBe('comfort');
    expect(result.reward.amount).toBe(1);
    expect(result.streak).toBe(1);
    expect(result.state.dailyStreak).toBe(1);
    expect(result.state.lastLoginDay).toBe(getDayIndex(now));
  });

  it('does not grant a reward twice on the same day', () => {
    const now = 5 * DAY_MS + 1_000;
    const state = createInitialState(now);
    const first = checkDailyLogin(state, now);

    const second = checkDailyLogin(first.state, now);

    // Same-day returns kopeks=0 sentinel (no reward).
    expect(second.reward.kind).toBe('kopeks');
    expect(second.reward.amount).toBe(0);
    expect(second.streak).toBe(1);
  });

  it('increments the streak on consecutive days', () => {
    const day1 = 5 * DAY_MS;
    const day2 = 6 * DAY_MS;
    const state = createInitialState(day1);
    const first = checkDailyLogin(state, day1);
    const second = checkDailyLogin(first.state, day2);

    expect(second.streak).toBe(2);
    // Day 2: condition_repair_all +15
    expect(second.reward.kind).toBe('condition_repair_all');
    expect(second.reward.amount).toBe(15);
  });

  it('resets the streak when a day is skipped', () => {
    const day1 = 5 * DAY_MS;
    const day3 = 7 * DAY_MS;
    const state = createInitialState(day1);
    const first = checkDailyLogin(state, day1);
    const third = checkDailyLogin(first.state, day3);

    expect(third.streak).toBe(1);
    // Day 1 (after reset): comfort +1
    expect(third.reward.kind).toBe('comfort');
    expect(third.reward.amount).toBe(1);
  });

  it('cycles the reward back to day 1 after reaching day 7', () => {
    const day7Streak = { ...createInitialState(0), lastLoginDay: 7, dailyStreak: 7 };
    const nextDay = 8 * DAY_MS;
    const result = checkDailyLogin(day7Streak, nextDay);

    // Day 7 reward is comfort +5. Day 8 cycles back to effective day 1 (comfort +1, streak 8).
    expect(result.streak).toBe(8);
    expect(result.reward.kind).toBe('comfort');
    expect(result.reward.amount).toBe(1);
  });

  it('getDailyLoginReward returns DailyRewardInfo with correct kinds across the cycle', () => {
    const day1 = getDailyLoginReward(1);
    expect(day1.kind).toBe('comfort');
    expect(day1.amount).toBe(1);

    const day2 = getDailyLoginReward(2);
    expect(day2.kind).toBe('condition_repair_all');
    expect(day2.amount).toBe(15);

    const day3 = getDailyLoginReward(3);
    expect(day3.kind).toBe('timed_bonus');
    expect(day3.multiplier).toBe(1.3);
    expect(day3.durationMs).toBe(10 * 60 * 1_000);

    const day4 = getDailyLoginReward(4);
    expect(day4.kind).toBe('comfort');
    expect(day4.amount).toBe(2);

    const day5 = getDailyLoginReward(5);
    expect(day5.kind).toBe('condition_repair_all');
    expect(day5.amount).toBe(30);

    const day6 = getDailyLoginReward(6);
    expect(day6.kind).toBe('timed_bonus');
    expect(day6.multiplier).toBe(1.5);
    expect(day6.durationMs).toBe(15 * 60 * 1_000);

    const day7 = getDailyLoginReward(7);
    expect(day7.kind).toBe('comfort');
    expect(day7.amount).toBe(5);

    // Cycles at 7: day 8 == day 1, day 14 == day 7.
    expect(getDailyLoginReward(8).kind).toBe('comfort');
    expect(getDailyLoginReward(8).amount).toBe(1);
    expect(getDailyLoginReward(14).kind).toBe('comfort');
    expect(getDailyLoginReward(14).amount).toBe(5);
  });
});
