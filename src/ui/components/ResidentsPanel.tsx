'use client';

import { Users } from 'lucide-react';
import { residents } from '../../game/content/residents';
import type { GameState } from '../../game/types';
import type { Translation } from '../../platform/i18n';

interface ResidentsPanelProps {
  gameState: GameState;
  t: Translation;
}

export function ResidentsPanel({ gameState, t }: ResidentsPanelProps) {
  const unlocked = new Set(gameState.unlockedResidents);
  const unlockedCount = gameState.unlockedResidents.length;

  return (
    <section className="panel" aria-labelledby="residents-panel-title">
      <div className="panel-heading">
        <h2 id="residents-panel-title">{t.residents}</h2>
        <span className="panel-counter">{unlockedCount}/{residents.length} {t.residentsSettled}</span>
      </div>
      {unlockedCount === 0 && <p className="panel-empty">{t.noResidents}</p>}
      <ul className="compact-list">
        {residents.map((resident) => {
          const isUnlocked = unlocked.has(resident.id);

          return (
            <li className={isUnlocked ? 'compact-card resident-settled' : 'compact-card resident-locked'} key={resident.id}>
              <Users aria-hidden="true" size={16} />
              <div>
                <div className="resident-card-title">
                  <strong>{resident.name}</strong>
                  <span className={isUnlocked ? 'resident-status settled' : 'resident-status locked'}>
                    {isUnlocked ? t.settled : t.notSettled}
                  </span>
                </div>
                <span>{isUnlocked ? resident.bonusText : resident.unlockText}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
