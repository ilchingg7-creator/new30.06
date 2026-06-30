'use client';

import { Users } from 'lucide-react';
import { residents } from '../../game/content/residents';
import type { GameState } from '../../game/types';

interface ResidentsPanelProps {
  gameState: GameState;
}

export function ResidentsPanel({ gameState }: ResidentsPanelProps) {
  const unlocked = new Set(gameState.unlockedResidents);

  return (
    <section className="panel" aria-labelledby="residents-panel-title">
      <h2 id="residents-panel-title">Жильцы</h2>
      <ul className="compact-list">
        {residents.map((resident) => {
          const isUnlocked = unlocked.has(resident.id);

          return (
            <li className="compact-card" key={resident.id}>
              <Users aria-hidden="true" size={16} />
              <div>
                <strong>{resident.name}</strong>
                <span>{isUnlocked ? resident.bonusText : resident.unlockText}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
