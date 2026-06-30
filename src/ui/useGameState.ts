import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  advanceGame,
  buyModuleLevel,
  calculateIncomePerSecond,
  calculateOfflineReward,
  performPrestige,
  createInitialState
} from '../game/economy';
import { parseGameState, SAVE_KEY, serializeGameState } from '../game/save';
import type { GameState, ModuleId } from '../game/types';
import { createLocalStoragePort, type StoragePort } from '../platform/storage';
import { resolveSelectedRoomId } from '../station/roomScenes';

export interface OfflineReward {
  seconds: number;
  credits: number;
}

export interface UseGameStateResult {
  gameState: GameState;
  incomePerSecond: number;
  offlineReward: OfflineReward | null;
  ready: boolean;
  selectedRoomId: ModuleId;
  buyLevel(moduleId: ModuleId): void;
  selectRoom(moduleId: ModuleId): void;
  renovateOrbit(): void;
  dismissOfflineReward(): void;
  activateIncomeBoost(): void;
  activateVipResident(): void;
}

export function useGameState(storagePort?: StoragePort): UseGameStateResult {
  const storage = useMemo(() => storagePort ?? createLocalStoragePort(), [storagePort]);
  const [gameState, setGameState] = useState(() => createInitialState());
  const [selectedRoomId, setSelectedRoomId] = useState<ModuleId>('tenant_capsule');
  const [ready, setReady] = useState(false);
  const [offlineReward, setOfflineReward] = useState<OfflineReward | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSavedState() {
      const savedState = parseGameState(await storage.load(SAVE_KEY));

      if (cancelled) {
        return;
      }

      if (savedState) {
        const reward = calculateOfflineReward(savedState);
        setGameState(advanceGame(savedState, reward.seconds));
        setOfflineReward(reward.credits > 0 ? reward : null);
      }

      setReady(true);
    }

    void loadSavedState();

    return () => {
      cancelled = true;
    };
  }, [storage]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    void storage.save(SAVE_KEY, serializeGameState(gameState));
  }, [gameState, ready, storage]);

  useEffect(() => {
    if (!ready) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setGameState((current) => advanceGame(current, 1));
    }, 1_000);

    return () => window.clearInterval(intervalId);
  }, [ready]);

  useEffect(() => {
    setSelectedRoomId((current) => resolveSelectedRoomId(gameState, current));
  }, [gameState]);

  const buyLevel = useCallback((moduleId: ModuleId) => {
    setGameState((current) => {
      const next = buyModuleLevel(current, moduleId);

      if (next !== current) {
        setSelectedRoomId(moduleId);
      }

      return next;
    });
  }, []);

  const selectRoom = useCallback(
    (moduleId: ModuleId) => {
      setSelectedRoomId(resolveSelectedRoomId(gameState, moduleId));
    },
    [gameState]
  );

  const renovateOrbit = useCallback(() => {
    setGameState((current) => performPrestige(current));
  }, []);

  const dismissOfflineReward = useCallback(() => {
    setOfflineReward(null);
  }, []);

  const activateIncomeBoost = useCallback(() => {
    setGameState((current) => ({
      ...current,
      timedBonuses: [
        ...current.timedBonuses,
        {
          id: 'rent_x2',
          incomeMultiplier: 2,
          expiresAt: Date.now() + 5 * 60 * 1_000
        }
      ]
    }));
  }, []);

  const activateVipResident = useCallback(() => {
    setGameState((current) => ({
      ...current,
      timedBonuses: [
        ...current.timedBonuses,
        {
          id: 'vip_resident',
          incomeMultiplier: 2,
          expiresAt: Date.now() + 10 * 60 * 1_000
        }
      ]
    }));
  }, []);

  return {
    gameState,
    incomePerSecond: calculateIncomePerSecond(gameState),
    offlineReward,
    ready,
    selectedRoomId,
    buyLevel,
    selectRoom,
    renovateOrbit,
    dismissOfflineReward,
    activateIncomeBoost,
    activateVipResident
  };
}
