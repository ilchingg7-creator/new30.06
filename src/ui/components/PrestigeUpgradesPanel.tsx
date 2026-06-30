'use client';

import { Check, Lock } from 'lucide-react';
import { prestigeUpgrades } from '../../game/content/prestigeUpgrades';
import type { GameState, PrestigeUpgradeId } from '../../game/types';

interface PrestigeUpgradesPanelProps {
  gameState: GameState;
  onBuyUpgrade(upgradeId: PrestigeUpgradeId): void;
}

export function PrestigeUpgradesPanel({ gameState, onBuyUpgrade }: PrestigeUpgradesPanelProps) {
  const owned = new Set(gameState.purchasedPrestigeUpgrades ?? []);

  return (
    <section className="panel" aria-labelledby="prestige-upgrades-title">
      <h2 id="prestige-upgrades-title">Улучшения реновации</h2>
      <p className="panel-copy">Репутация: {gameState.reputation}</p>
      <ul className="compact-list">
        {prestigeUpgrades.map((upgrade) => {
          const purchased = owned.has(upgrade.id);
          const affordable = gameState.reputation >= upgrade.reputationCost;
          const canBuy = !purchased && affordable;

          return (
            <li className="compact-card" key={upgrade.id}>
              {purchased ? (
                <Check aria-hidden="true" size={16} />
              ) : (
                <Lock aria-hidden="true" size={16} />
              )}
              <div>
                <strong>{upgrade.name}</strong>
                <span>{upgrade.description}</span>
                <small>Стоимость: {upgrade.reputationCost} репутации</small>
              </div>
              <button
                type="button"
                disabled={!canBuy}
                onClick={() => onBuyUpgrade(upgrade.id)}
              >
                {purchased ? 'Куплено' : `Купить (${upgrade.reputationCost})`}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
