'use client';

import { BookOpen, Check, ChevronDown, Lock } from 'lucide-react';
import { useState } from 'react';
import { residents } from '../../game/content/residents';
import type { GameState } from '../../game/types';
import type { Translation } from '../../platform/i18n';
import { ResidentRoleTags } from './ResidentRoleTags';

interface ResidentCollectionBookProps {
  gameState: GameState;
  t: Translation;
}

export function ResidentCollectionBook({ gameState, t }: ResidentCollectionBookProps) {
  const unlocked = new Set(gameState.unlockedResidents);
  const unlockedCount = unlocked.size;
  const [expanded, setExpanded] = useState<string | null>(null);

  function toggle(id: string) {
    setExpanded((current) => (current === id ? null : id));
  }

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
          const isOpen = expanded === resident.id;

          return (
            <li
              key={resident.id}
              className={isUnlocked ? 'collection-card' : 'collection-card locked'}
            >
              <button
                type="button"
                className="collection-card-header"
                onClick={() => toggle(resident.id)}
                aria-expanded={isOpen}
              >
                {isUnlocked ? (
                  <Check aria-hidden="true" size={14} className="collection-icon-unlocked" />
                ) : (
                  <Lock aria-hidden="true" size={14} className="collection-icon-locked" />
                )}
                <strong>{name}</strong>
                {isUnlocked && (
                  <ChevronDown
                    aria-hidden="true"
                    size={14}
                    className="collection-chevron"
                    style={{
                      marginLeft: 'auto',
                      transition: 'transform 0.2s',
                      transform: isOpen ? 'rotate(180deg)' : 'none'
                    }}
                  />
                )}
              </button>
              {isUnlocked && isOpen && (
                <>
                  <p className="collection-bio">{bio}</p>
                  <ResidentRoleTags residentId={resident.id} t={t} />
                  <div className="collection-bonus">{bonusText}</div>
                </>
              )}
              {!isUnlocked && (
                <p className="collection-locked-hint">{unlockText}</p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
