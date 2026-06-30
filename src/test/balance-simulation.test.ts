import { describe, expect, it } from 'vitest';
import { modules } from '../game/content/modules';
import { advanceGame, buyModuleLevel, calculateIncomePerSecond, calculateModuleCost, createInitialState } from '../game/economy';
import type { GameState, ModuleId } from '../game/types';

const unlockTargets: Record<ModuleId, { minSeconds: number; maxSeconds: number }> = {
  tenant_capsule: { minSeconds: 0, maxSeconds: 0 },
  cosmo_kitchen: { minSeconds: 45, maxSeconds: 90 },
  oxygen_garden: { minSeconds: 4 * 60, maxSeconds: 7 * 60 },
  zero_g_laundry: { minSeconds: 9 * 60, maxSeconds: 14 * 60 },
  teleport_entry: { minSeconds: 18 * 60, maxSeconds: 28 * 60 },
  antigrav_gym: { minSeconds: 30 * 60, maxSeconds: 45 * 60 },
  panorama_dome: { minSeconds: 45 * 60, maxSeconds: 65 * 60 },
  saucer_dock: { minSeconds: 60 * 60, maxSeconds: 90 * 60 }
};

function getUnlockedModuleIds(state: GameState): ModuleId[] {
  return modules.filter((module) => state.credits >= module.unlockAtCredits).map((module) => module.id);
}

function chooseAffordablePurchase(state: GameState): ModuleId | null {
  const nextLocked = modules.find((module) => state.credits < module.unlockAtCredits);
  const reserveCredits = nextLocked ? nextLocked.unlockAtCredits * 0.6 : 0;
  const currentIncome = calculateIncomePerSecond(state);
  let best: { moduleId: ModuleId; score: number; cost: number } | null = null;

  for (const module of modules) {
    if (state.credits < module.unlockAtCredits) {
      continue;
    }

    const cost = calculateModuleCost(module.id, state);

    if (state.credits < cost) {
      continue;
    }

    if (nextLocked && currentIncome > 0 && state.credits - cost < reserveCredits) {
      continue;
    }

    const nextState = buyModuleLevel(state, module.id);
    const incomeGain = calculateIncomePerSecond(nextState) - currentIncome;
    const score = incomeGain / cost;

    if (!best || score > best.score || (score === best.score && cost < best.cost)) {
      best = { moduleId: module.id, score, cost };
    }
  }

  return best?.moduleId ?? null;
}

function simulateUnlocks(maxSeconds: number): Partial<Record<ModuleId, number>> {
  let state = createInitialState(1_000);
  const unlockTimes: Partial<Record<ModuleId, number>> = {};

  for (let second = 0; second <= maxSeconds; second += 1) {
    for (const moduleId of getUnlockedModuleIds(state)) {
      unlockTimes[moduleId] ??= second;
    }

    let purchase = chooseAffordablePurchase(state);

    while (purchase) {
      state = buyModuleLevel(state, purchase);
      purchase = chooseAffordablePurchase(state);
    }

    state = advanceGame(state, 1, 1_000 + second * 1_000);
  }

  return unlockTimes;
}

describe('MVP room unlock pacing', () => {
  it('does not unlock late rooms during the first short session', () => {
    const unlockTimes = simulateUnlocks(3 * 60);

    expect(unlockTimes.teleport_entry).toBeUndefined();
    expect(unlockTimes.antigrav_gym).toBeUndefined();
    expect(unlockTimes.panorama_dome).toBeUndefined();
    expect(unlockTimes.saucer_dock).toBeUndefined();
  });

  it('keeps room unlocks inside target windows', () => {
    const unlockTimes = simulateUnlocks(90 * 60);

    for (const module of modules) {
      const target = unlockTargets[module.id];
      const actual = unlockTimes[module.id];

      expect(actual, `${module.id} should unlock`).toBeDefined();
      expect(actual!, `${module.id} min`).toBeGreaterThanOrEqual(target.minSeconds);
      expect(actual!, `${module.id} max`).toBeLessThanOrEqual(target.maxSeconds);
    }
  });
});
