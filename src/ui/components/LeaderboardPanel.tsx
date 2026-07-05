'use client';

import { Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { YandexLeaderboardEntry } from '../../platform/yandex';
import type { Translation } from '../../platform/i18n';

interface LeaderboardPanelProps {
  score: number;
  onRefresh(): void;
  onLoadEntries(): Promise<YandexLeaderboardEntry[]>;
  t: Translation;
  variant?: 'default' | 'compact';
}

export function LeaderboardPanel({ score, onRefresh, onLoadEntries, t, variant = 'default' }: LeaderboardPanelProps) {
  const [entries, setEntries] = useState<YandexLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const result = await onLoadEntries();
      if (!cancelled) {
        setEntries(result);
        setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [onLoadEntries]);

  const className = variant === 'compact' ? 'panel leaderboard-panel compact' : 'panel leaderboard-panel';

  return (
    <section className={className} aria-labelledby="leaderboard-title">
      <div className="leaderboard-header">
        <h2 id="leaderboard-title">
          <Trophy aria-hidden="true" size={16} style={{ verticalAlign: 'middle' }} /> {t.leaderboardTitle}
        </h2>
        <button type="button" className="leaderboard-refresh" onClick={onRefresh} disabled={loading}>
          {loading ? '...' : '↻'}
        </button>
      </div>

      <div className="leaderboard-score">
        <span>{t.leaderboardYourScore}</span>
        <strong>{score.toLocaleString()}</strong>
      </div>

      {entries.length > 0 ? (
        <ul className="leaderboard-list">
          {entries.map((entry, index) => (
            <li key={entry.player.uniqueID} className={entry.rank <= 3 ? 'leaderboard-entry top' : 'leaderboard-entry'}>
              <span className="leaderboard-rank">#{entry.rank}</span>
              <span className="leaderboard-name">{entry.player.publicName || t.leaderboardAnonymous}</span>
              <span className="leaderboard-entry-score">{entry.score.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="leaderboard-empty">{t.leaderboardEmpty}</p>
      )}
    </section>
  );
}
