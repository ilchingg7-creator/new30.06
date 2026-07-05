'use client';

import { RotateCcw } from 'lucide-react';
import { getRenovationPreview } from '../../game/actionPreviews';
import { canPerformPrestige, getPrestigeRequirements, type PrestigeRequirement } from '../../game/economy';
import { getGoalRenovationCycle } from '../../game/goals';
import type { GameState } from '../../game/types';
import type { Translation } from '../../platform/i18n';
import { ActionPreviewLine } from './ActionPreviewLine';

interface PrestigePanelProps {
  gameState: GameState;
  onRenovate(): void;
  t: Translation;
}

function getRequirementLabel(requirement: PrestigeRequirement, cycle: number, t: Translation): string {
  if (requirement.id === 'reputation_reward') {
    return t.renovationRequirementReward;
  }

  if (requirement.id === 'cycle_goals') {
    return t.renovationRequirementGoals;
  }

  if (cycle === 0) {
    return t.renovationRequirementStation0;
  }

  if (cycle === 1) {
    return t.renovationRequirementStation1;
  }

  return t.renovationRequirementStation2;
}

export function PrestigePanel({ gameState, onRenovate, t }: PrestigePanelProps) {
  const requirements = getPrestigeRequirements(gameState);
  const canRenovate = canPerformPrestige(gameState);
  const cycle = getGoalRenovationCycle(gameState);
  const preview = getRenovationPreview(gameState, t);

  return (
    <section className="panel" aria-labelledby="prestige-panel-title">
      <h2 id="prestige-panel-title">{t.renovationTitle}</h2>
      <p className="panel-copy">{t.reputationStation}: {gameState.reputation}</p>
      <div className="renovation-requirements">
        <strong>{t.renovationRequirements}</strong>
        <ul>
          {requirements.map((requirement) => (
            <li className={requirement.completed ? 'complete' : 'locked'} key={requirement.id}>
              <span>{getRequirementLabel(requirement, cycle, t)}</span>
              <small>{requirement.current}/{requirement.target}</small>
            </li>
          ))}
        </ul>
      </div>
      <ActionPreviewLine preview={preview} t={t} />
      <button
        type="button"
        disabled={!canRenovate}
        onClick={onRenovate}
        title={t.renovateTooltip}
      >
        <RotateCcw aria-hidden="true" size={16} />
        {t.renovate}
      </button>
    </section>
  );
}
