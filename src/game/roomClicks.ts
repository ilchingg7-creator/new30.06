import { calculateIncomePerSecond } from './economy';
import type { GameState } from './types';

export function applyRoomClickReward(state: GameState): GameState {
  const bonus = 1 + Math.floor(calculateIncomePerSecond(state) * 0.5);

  return {
    ...state,
    credits: state.credits + bonus,
    totalEarnedCredits: state.totalEarnedCredits + bonus
  };
}
