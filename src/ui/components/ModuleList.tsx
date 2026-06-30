import { Home } from 'lucide-react';
import { calculateModuleCost, calculateIncomePerSecond } from '../../game/economy';
import { formatCredits, formatRate } from '../../game/format';
import { modules } from '../../game/content/modules';
import type { GameState, ModuleId } from '../../game/types';

interface ModuleListProps {
  gameState: GameState;
  onBuyLevel(moduleId: ModuleId): void;
}

interface Milestone {
  level: number;
  multiplier: number;
}

const MILESTONES: Milestone[] = [
  { level: 10, multiplier: 2 },
  { level: 25, multiplier: 2 },
  { level: 50, multiplier: 3 },
  { level: 100, multiplier: 4 }
];

function getNextMilestone(level: number): Milestone | null {
  return MILESTONES.find((milestone) => level < milestone.level) ?? null;
}

function getPreviousMilestoneLevel(level: number): number {
  const previous = [...MILESTONES].reverse().find((milestone) => level >= milestone.level);
  return previous?.level ?? 0;
}

function buildModuleTooltip(moduleId: ModuleId, state: GameState): string {
  const module = modules.find((item) => item.id === moduleId);
  const level = state.moduleLevels[moduleId];
  const cost = calculateModuleCost(moduleId, state);
  const income = calculateIncomePerSecond(state);
  const milestone = getNextMilestone(level);

  const lines = [
    `Уровень: ${level}`,
    `Цена следующего: ${formatCredits(cost)} кредитов`,
    `Текущий доход станции: ${formatRate(income)}`
  ];

  if (module?.comfortBonus) {
    lines.push(`Комфорт при открытии: +${module.comfortBonus}`);
  }

  if (milestone) {
    lines.push(`Следующий milestone: ур. ${milestone.level} (x${milestone.multiplier})`);
  }

  return lines.join('\n');
}

function MilestoneProgress({ level }: { level: number }) {
  const next = getNextMilestone(level);

  if (!next) {
    return (
      <div className="milestone-progress">
        <div className="milestone-bar">
          <div className="milestone-fill" style={{ width: '100%' }} />
        </div>
        <small className="milestone-label">Все milestones получены</small>
      </div>
    );
  }

  const prevLevel = getPreviousMilestoneLevel(level);
  const range = next.level - prevLevel;
  const progress = Math.min(100, Math.max(0, ((level - prevLevel) / range) * 100));

  return (
    <div className="milestone-progress">
      <div className="milestone-bar">
        <div className="milestone-fill" style={{ width: `${progress}%` }} />
      </div>
      <small className="milestone-label">
        ур. {level} {'->'} {next.level} <span className="milestone-mult">x{next.multiplier}</span>
      </small>
    </div>
  );
}

export function ModuleList({ gameState, onBuyLevel }: ModuleListProps) {
  return (
    <section className="panel module-panel" aria-labelledby="module-panel-title">
      <h2 id="module-panel-title">Комнаты</h2>
      <ul className="component-list">
        {modules.map((module) => {
          const level = gameState.moduleLevels[module.id];
          const cost = calculateModuleCost(module.id, gameState);
          const locked = gameState.totalEarnedCredits < module.unlockAtCredits;
          const canBuy = !locked && gameState.credits >= cost;

          return (
            <li className="component-card" key={module.id} title={buildModuleTooltip(module.id, gameState)}>
              <div className="component-info">
                <h3>{module.name}</h3>
                <p>{module.role}</p>
                <span>Уровень {level}</span>
                {!locked && <MilestoneProgress level={level} />}
              </div>
              <button type="button" disabled={!canBuy} onClick={() => onBuyLevel(module.id)}>
                <Home aria-hidden="true" size={16} />
                {locked ? 'Закрыто' : formatCredits(cost)}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
