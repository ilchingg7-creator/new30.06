'use client';

import { Target } from 'lucide-react';
import { getVisibleGoals } from '../../game/goals';
import type { GameState } from '../../game/types';
import type { Translation } from '../../platform/i18n';

interface GoalPanelProps {
  gameState: GameState;
  t: Translation;
}

export function GoalPanel({ gameState, t }: GoalPanelProps) {
  const visibleGoals = getVisibleGoals(gameState, 4);

  const rewardKindLabel = (kind: string): string => {
    switch (kind) {
      case 'comfort':
        return t.rewardKindComfort;
      case 'visual_detail':
        return t.rewardKindVisual;
      case 'temporary_boost':
        return t.rewardKindBoost;
      case 'prestige_hint':
        return t.rewardKindPrestige;
      default:
        return kind;
    }
  };

  return (
    <section className="panel" aria-labelledby="goal-panel-title">
      <h2 id="goal-panel-title">{t.goals}</h2>
      <ul className="compact-list">
        {visibleGoals.length === 0 && (
          <li className="compact-card">
            <Target aria-hidden="true" size={16} />
            <div>
              <strong>{t.allGoalsDone}</strong>
              <span>{t.allGoalsDoneHint}</span>
            </div>
          </li>
        )}
        {visibleGoals.map((goal) => {
          const localized = t.content.goals[goal.id];
          const title = localized?.title ?? goal.title;
          const rewardLabel = goal.rewardLabel;

          return (
          <li
            className="compact-card"
            key={goal.id}
            title={`${t.rewardType}: ${rewardKindLabel(goal.rewardKind)}\n${rewardLabel}`}
          >
            <Target aria-hidden="true" size={16} />
            <div>
              <strong>{title}</strong>
              <span>{t.reward}: {rewardLabel}</span>
            </div>
          </li>
          );
        })}
      </ul>
    </section>
  );
}
