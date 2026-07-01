import { Home } from 'lucide-react';
import { calculateModuleCost, calculateIncomePerSecond } from '../../game/economy';
import { formatCredits, formatRate } from '../../game/format';
import { modules } from '../../game/content/modules';
import type { GameState, ModuleId } from '../../game/types';
import type { Translation } from '../../platform/i18n';

interface ModuleListProps {
  gameState: GameState;
  onBuyLevel(moduleId: ModuleId): void;
  t: Translation;
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

function buildModuleTooltip(moduleId: ModuleId, state: GameState, t: Translation): string {
  const module = modules.find((item) => item.id === moduleId);
  const level = state.moduleLevels[moduleId];
  const cost = calculateModuleCost(moduleId, state);
  const income = calculateIncomePerSecond(state);
  const milestone = getNextMilestone(level);

  const lines = [
    `${t.level}: ${level}`,
    `${t.nextCost}: ${formatCredits(cost)}`,
    `${t.stationIncome}: ${formatRate(income, t.perSecond)}`
  ];

  if (module?.comfortBonus) {
    lines.push(`${t.comfortOnOpen}: +${module.comfortBonus}`);
  }

  if (milestone) {
    lines.push(`${t.nextMilestone}: ${t.level.toLowerCase()} ${milestone.level} (x${milestone.multiplier})`);
  }

  return lines.join('\n');
}

function MilestoneProgress({ level, t }: { level: number; t: Translation }) {
  const next = getNextMilestone(level);

  if (!next) {
    return (
      <div className="milestone-progress">
        <div className="milestone-bar">
          <div className="milestone-fill" style={{ width: '100%' }} />
        </div>
        <small className="milestone-label">{t.allMilestonesDone}</small>
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
        {t.level.toLowerCase()} {level} {'->'} {next.level} <span className="milestone-mult">x{next.multiplier}</span>
      </small>
    </div>
  );
}

export function ModuleList({ gameState, onBuyLevel, t }: ModuleListProps) {
  return (
    <section className="panel module-panel" aria-labelledby="module-panel-title">
      <h2 id="module-panel-title">{t.rooms}</h2>
      <ul className="component-list">
        {modules.map((module) => {
          const level = gameState.moduleLevels[module.id];
          const cost = calculateModuleCost(module.id, gameState);
          const locked = gameState.totalEarnedCredits < module.unlockAtCredits;
          const canBuy = !locked && gameState.credits >= cost;

          return (
            <li className="component-card" key={module.id} title={buildModuleTooltip(module.id, gameState, t)}>
              <div className="component-info">
                <h3>{t.content.modules[module.id]?.name ?? module.name}</h3>
                <p>{t.content.modules[module.id]?.role ?? module.role}</p>
                <span>{t.level} {level}</span>
                {!locked && <MilestoneProgress level={level} t={t} />}
              </div>
              <button type="button" disabled={!canBuy} onClick={() => onBuyLevel(module.id)}>
                <Home aria-hidden="true" size={16} />
                {locked ? t.closed : formatCredits(cost)}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
