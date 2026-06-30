'use client';

import { Award } from 'lucide-react';
import { achievements } from '../../game/content/achievements';
import type { GameState } from '../../game/types';

interface AchievementsPanelProps {
  gameState: GameState;
}

export function AchievementsPanel({ gameState }: AchievementsPanelProps) {
  const unlocked = new Set(gameState.unlockedAchievements ?? []);
  const unlockedCount = unlocked.size;

  return (
    <section className="panel" aria-labelledby="achievements-panel-title">
      <h2 id="achievements-panel-title">
        Достижения <small className="panel-counter">{unlockedCount}/{achievements.length}</small>
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
