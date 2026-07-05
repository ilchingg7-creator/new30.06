'use client';

import { BarChart3, Clock, Home, PieChart, RotateCcw, Trophy } from 'lucide-react';
import { calculateIncomePerSecond } from '../../game/economy';
import { formatCredits, formatDuration, formatRate } from '../../game/format';
import { modules } from '../../game/content/modules';
import { getResidentModuleIncomeMultiplier } from '../../game/residents';
import type { GameState, ModuleId } from '../../game/types';
import type { Translation } from '../../platform/i18n';

interface StatsPanelProps {
  gameState: GameState;
  t: Translation;
}

interface IncomeSource {
  id: ModuleId;
  name: string;
  income: number;
  share: number;
}

function getTopIncomeSources(state: GameState, t: Translation, limit = 4): IncomeSource[] {
  const sources: IncomeSource[] = modules
    .map((module) => {
      const level = state.moduleLevels[module.id];

      if (level === 0) {
        return null;
      }

      const milestoneMultiplier = [10, 25, 50, 100].reduce((mult, ms) => {
        return level >= ms ? mult * (ms === 10 ? 2 : ms === 25 ? 2 : ms === 50 ? 3 : 4) : mult;
      }, 1);
      const income = module.baseIncomePerSecond * level * milestoneMultiplier * getResidentModuleIncomeMultiplier(state, module.id);
      const localized = t.content.modules[module.id];

      return {
        id: module.id,
        name: localized?.name ?? module.name,
        income,
        share: 0
      };
    })
    .filter((item): item is IncomeSource => item !== null && item.income > 0);

  const total = sources.reduce((sum, s) => sum + s.income, 0);

  sources.forEach((s) => {
    s.share = total > 0 ? (s.income / total) * 100 : 0;
  });

  return sources.sort((a, b) => b.income - a.income).slice(0, limit);
}

export function StatsPanel({ gameState, t }: StatsPanelProps) {
  const stats = [
    {
      icon: Clock,
      label: t.playTime,
      value: formatDuration(gameState.totalPlaySeconds ?? 0, {
        hours: t.hoursShort,
        minutes: t.minutesShort,
        seconds: t.secondsShort
      })
    },
    {
      icon: Home,
      label: t.modulesBought,
      value: String(gameState.totalModulesBought ?? 0)
    },
    {
      icon: RotateCcw,
      label: t.renovations,
      value: String(gameState.prestigeCount ?? 0)
    },
    {
      icon: Trophy,
      label: t.totalEarned,
      value: formatCredits(gameState.totalEarnedCredits)
    }
  ];

  const topSources = getTopIncomeSources(gameState, t);
  const totalIncome = calculateIncomePerSecond(gameState);

  return (
    <section className="panel" aria-labelledby="stats-panel-title">
      <h2 id="stats-panel-title">
        <BarChart3 aria-hidden="true" size={16} style={{ verticalAlign: 'middle' }} /> {t.statistics}
      </h2>
      <ul className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <li key={stat.label} className="stat-cell">
              <Icon aria-hidden="true" size={14} />
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </li>
          );
        })}
      </ul>
      {topSources.length > 0 && (
        <div className="income-breakdown">
          <div className="income-breakdown-header">
            <PieChart aria-hidden="true" size={14} />
            <strong>{t.incomeBreakdownTitle}</strong>
            <small>{formatRate(totalIncome, t.perSecond)}</small>
          </div>
          <p className="income-breakdown-hint">{t.incomeBreakdownHint}</p>
          <ul className="income-breakdown-list">
            {topSources.map((source) => (
              <li key={source.id} className="income-breakdown-row">
                <span className="income-breakdown-name">{source.name}</span>
                <div className="income-breakdown-bar" aria-hidden="true">
                  <div
                    className="income-breakdown-fill"
                    style={{ width: `${Math.max(4, source.share)}%` }}
                  />
                </div>
                <span className="income-breakdown-share">{source.share.toFixed(0)}%</span>
                <span className="income-breakdown-value">{formatRate(source.income, t.perSecond)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
