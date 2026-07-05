'use client';

import { Check, Lock } from 'lucide-react';
import { getAvailablePrestigeUpgrades } from '../../game/economy';
import type { GameState, PrestigeUpgradeId } from '../../game/types';
import type { Translation } from '../../platform/i18n';

interface PrestigeUpgradesPanelProps {
  gameState: GameState;
  onBuyUpgrade(upgradeId: PrestigeUpgradeId): void;
  t: Translation;
}

export function PrestigeUpgradesPanel({ gameState, onBuyUpgrade, t }: PrestigeUpgradesPanelProps) {
  const owned = new Set(gameState.purchasedPrestigeUpgrades ?? []);
  const remainingChoices = Math.max(0, (gameState.prestigeCount ?? 0) - owned.size);
  const availableUpgrades = getAvailablePrestigeUpgrades(gameState);

  return (
    <section className="panel" aria-labelledby="prestige-upgrades-title">
      <h2 id="prestige-upgrades-title">{t.upgradesTitle}</h2>
      <p className="panel-copy">
        {t.reputationStation}: {gameState.reputation} · {t.renovationChoicesLeft}: {remainingChoices}
      </p>
      <ul className="compact-list">
        {availableUpgrades.map((upgrade) => {
          const purchased = owned.has(upgrade.id);
          const affordable = gameState.reputation >= upgrade.reputationCost;
          const canBuy = !purchased && affordable && remainingChoices > 0;
          const localized = t.content.prestigeUpgrades[upgrade.id];
          const name = localized?.name ?? upgrade.name;
          const description = localized?.description ?? upgrade.description;

          return (
            <li className="compact-card" key={upgrade.id}>
              {purchased ? (
                <Check aria-hidden="true" size={16} />
              ) : (
                <Lock aria-hidden="true" size={16} />
              )}
              <div>
                <strong>{name}</strong>
                <span>{description}</span>
                <small>{t.cost}: {upgrade.reputationCost} {t.reputation.toLowerCase()}</small>
              </div>
              <button
                type="button"
                disabled={!canBuy}
                onClick={() => onBuyUpgrade(upgrade.id)}
              >
                {purchased ? t.bought : `${t.buy} (${upgrade.reputationCost})`}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
