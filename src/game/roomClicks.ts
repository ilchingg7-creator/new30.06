import { calculateIncomePerSecond } from './economy';
import type { GameState } from './types';

const MANUAL_CLICK_INCOME_SECONDS = 0.1;

export function applyRoomClickReward(state: GameState): GameState {
  const bonus = 1 + Math.floor(calculateIncomePerSecond(state) * MANUAL_CLICK_INCOME_SECONDS);

  return {
    ...state,
    credits: state.credits + bonus,
    totalEarnedCredits: state.totalEarnedCredits + bonus
  };
}
