import { Target } from 'lucide-react';
import { goals } from '../../game/content/goals';
import type { GameState } from '../../game/types';

interface GoalPanelProps {
  gameState: GameState;
}

export function GoalPanel({ gameState }: GoalPanelProps) {
  const visibleGoals = goals.slice(0, 4);

  return (
    <section className="panel" aria-labelledby="goal-panel-title">
      <h2 id="goal-panel-title">Цели</h2>
      <ul className="compact-list">
        {visibleGoals.map((goal) => {
          const completed = gameState.completedGoals.includes(goal.id);

          return (
            <li className="compact-card" key={goal.id}>
              <Target aria-hidden="true" size={16} />
              <div>
                <strong>{goal.title}</strong>
                <span>{completed ? 'Готово' : `+${goal.rewardCredits} кредитов`}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
