'use client';

import { BookOpen, Check, Lock } from 'lucide-react';
import { residents } from '../../game/content/residents';
import type { GameState } from '../../game/types';
import type { Translation } from '../../platform/i18n';

interface ResidentCollectionBookProps {
  gameState: GameState;
  t: Translation;
}

export function ResidentCollectionBook({ gameState, t }: ResidentCollectionBookProps) {
  const unlocked = new Set(gameState.unlockedResidents);
  const unlockedCount = unlocked.size;

  return (
    <section className="panel" aria-labelledby="collection-book-title">
      <div className="panel-heading">
        <h2 id="collection-book-title">
          <BookOpen aria-hidden="true" size={16} style={{ verticalAlign: 'middle' }} /> {t.residents}
        </h2>
        <span className="panel-counter">{unlockedCount}/{residents.length}</span>
      </div>
      <ul className="collection-book-list">
        {residents.map((resident) => {
          const isUnlocked = unlocked.has(resident.id);
          const copy = t.content.residents[resident.id];
          const name = copy?.name ?? resident.name;
          const bonusText = copy?.bonusText ?? resident.bonusText;
          const bio = copy?.bio ?? '';
          const unlockText = copy?.unlockText ?? resident.unlockText;

          return (
            <li
              key={resident.id}
              className={isUnlocked ? 'collection-card' : 'collection-card locked'}
            >
              <div className="collection-card-header">
                {isUnlocked ? (
                  <Check aria-hidden="true" size={14} className="collection-icon-unlocked" />
                ) : (
                  <Lock aria-hidden="true" size={14} className="collection-icon-locked" />
                )}
                <strong>{name}</strong>
              </div>
              {isUnlocked ? (
                <>
                  <p className="collection-bio">{bio}</p>
                  <div className="collection-bonus">{bonusText}</div>
                </>
              ) : (
                <p className="collection-locked-hint">{unlockText}</p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
