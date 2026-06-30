'use client';

import { Award } from 'lucide-react';
import { achievements } from '../../game/content/achievements';
import type { GameState } from '../../game/types';
import type { Translation } from '../../platform/i18n';

interface AchievementsPanelProps {
  gameState: GameState;
  t: Translation;
}

export function AchievementsPanel({ gameState, t }: AchievementsPanelProps) {
  const unlocked = new Set(gameState.unlockedAchievements ?? []);
  const unlockedCount = unlocked.size;

  return (
    <section className="panel" aria-labelledby="achievements-panel-title">
      <h2 id="achievements-panel-title">
        {t.achievements} <small className="panel-counter">{unlockedCount}/{achievements.length}</small>
      </h2>
      <ul className="compact-list">
        {achievements.map((achievement) => {
          const isUnlocked = unlocked.has(achievement.id);

          return (
            <li
              className={isUnlocked ? 'compact-card achievement-unlocked' : 'compact-card achievement-locked'}
              key={achievement.id}
            >
              <Award aria-hidden="true" size={16} />
              <div>
                <strong>{achievement.title}</strong>
                <span>{achievement.description}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
