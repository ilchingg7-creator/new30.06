'use client';

import { BarChart3, Clock, Home, RotateCcw, Trophy } from 'lucide-react';
import { formatCredits, formatDuration } from '../../game/format';
import type { GameState } from '../../game/types';

interface StatsPanelProps {
  gameState: GameState;
}

export function StatsPanel({ gameState }: StatsPanelProps) {
  const stats = [
    {
      icon: Clock,
      label: 'Время в игре',
      value: formatDuration(gameState.totalPlaySeconds ?? 0)
    },
    {
      icon: Home,
      label: 'Куплено модулей',
      value: String(gameState.totalModulesBought ?? 0)
    },
    {
      icon: RotateCcw,
      label: 'Реноваций',
      value: String(gameState.prestigeCount ?? 0)
    },
    {
      icon: Trophy,
      label: 'Заработано всего',
      value: formatCredits(gameState.totalEarnedCredits)
    }
  ];

  return (
    <section className="panel" aria-labelledby="stats-panel-title">
      <h2 id="stats-panel-title">
        <BarChart3 aria-hidden="true" size={16} style={{ verticalAlign: 'middle' }} /> Статистика
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
    </section>
  );
}
