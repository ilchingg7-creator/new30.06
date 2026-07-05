'use client';

import { Clock, Wrench, Check, Gift } from 'lucide-react';
import { formatDuration } from '../../game/format';
import { canClaimWeeklyBonus, claimWeeklyBonus, getWeeklyRepairTimeRemaining } from '../../game/weeklyRepair';
import type { GameState, ModuleId } from '../../game/types';
import type { Translation } from '../../platform/i18n';

interface WeeklyRepairPanelProps {
  gameState: GameState;
  onClaimBonus(): void;
  t: Translation;
  variant?: 'default' | 'compact';
}

function getTaskLabel(task: { kind: string; roomId: ModuleId; target: number }, t: Translation): string {
  const roomName = t.content.modules[task.roomId]?.name ?? task.roomId;

  switch (task.kind) {
    case 'repair_room':
      return t.weeklyRepairRoom.replace('{room}', roomName).replace('{target}', String(task.target));
    case 'buy_levels':
      return t.weeklyRepairLevels.replace('{room}', roomName).replace('{target}', String(task.target));
    case 'reach_condition':
      return t.weeklyRepairCondition.replace('{room}', roomName).replace('{target}', String(task.target));
    default:
      return '';
  }
}

export function WeeklyRepairPanel({ gameState, onClaimBonus, t, variant = 'default' }: WeeklyRepairPanelProps) {
  const weekly = gameState.weeklyRepair;

  if (!weekly) {
    return null;
  }

  const timeLeft = getWeeklyRepairTimeRemaining(gameState);
  const allDone = weekly.tasks.length > 0 && weekly.tasks.every((task) => task.completed);
  const canClaim = canClaimWeeklyBonus(gameState);
  const className = variant === 'compact' ? 'panel weekly-repair-panel compact' : 'panel weekly-repair-panel';

  return (
    <section className={className} aria-labelledby="weekly-repair-title">
      <div className="weekly-repair-header">
        <h2 id="weekly-repair-title">
          <Wrench aria-hidden="true" size={16} style={{ verticalAlign: 'middle' }} /> {t.weeklyRepairTitle}
        </h2>
        <span className="weekly-repair-timer">
          <Clock aria-hidden="true" size={12} />
          {timeLeft.expired
            ? t.weeklyRepairExpired
            : `${timeLeft.days}${t.weeklyRepairDays} ${timeLeft.hours}${t.weeklyRepairHours}`}
        </span>
      </div>

      <ul className="weekly-repair-tasks">
        {weekly.tasks.map((task) => (
          <li key={task.id} className={task.completed ? 'weekly-task completed' : 'weekly-task'}>
            <div className="weekly-task-info">
              {task.completed ? (
                <Check aria-hidden="true" size={14} className="weekly-task-icon" />
              ) : (
                <span className="weekly-task-dot" />
              )}
              <span className="weekly-task-label">{getTaskLabel(task, t)}</span>
            </div>
            <div className="weekly-task-meta">
              <span className="weekly-task-progress">{task.progress}/{task.target}</span>
              <small>+{task.rewardComfort} {t.comfortWord}</small>
            </div>
          </li>
        ))}
      </ul>

      {allDone && !weekly.bonusClaimed && (
        <button
          type="button"
          className="weekly-repair-claim"
          onClick={onClaimBonus}
          disabled={!canClaim}
        >
          <Gift aria-hidden="true" size={14} />
          {t.weeklyRepairClaimBonus} (+10 {t.comfortWord})
        </button>
      )}

      {weekly.bonusClaimed && (
        <p className="weekly-repair-claimed">{t.weeklyRepairBonusClaimed}</p>
      )}
    </section>
  );
}
