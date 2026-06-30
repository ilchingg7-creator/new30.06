'use client';

import { Target } from 'lucide-react';
import { getVisibleGoals } from '../../game/goals';
import type { GameState } from '../../game/types';
import type { Translation } from '../../platform/i18n';

const rewardKindLabels: Record<string, string> = {
  comfort: 'Бонус комфорта',
  visual_detail: 'Визуальная деталь',
  temporary_boost: 'Временный буст',
  prestige_hint: 'Подсказка к реновации'
};

interface GoalPanelProps {
  gameState: GameState;
  t: Translation;
}

export function GoalPanel({ gameState, t }: GoalPanelProps) {
  const visibleGoals = getVisibleGoals(gameState, 4);

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
        {visibleGoals.map((goal) => (
          <li
            className="compact-card"
            key={goal.id}
            title={`Тип награды: ${rewardKindLabels[goal.rewardKind] ?? goal.rewardKind}\n${goal.rewardLabel}`}
          >
            <Target aria-hidden="true" size={16} />
            <div>
              <strong>{goal.title}</strong>
              <span>{goal.rewardLabel}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
