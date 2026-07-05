import { BookOpen, Sparkles } from 'lucide-react';
import { activeStationIncidents } from '../../game/content/stationIncidents';
import { getAvailableStationIncidentChoices } from '../../game/stationIncidents';
import type { GameState, StationIncidentId } from '../../game/types';
import type { Translation } from '../../platform/i18n';

interface StationIncidentJournalProps {
  gameState: GameState;
  newIncidentCount: number;
  onResolve(incidentId: StationIncidentId, choiceId: string): void;
  onMarkSeen(): void;
  t: Translation;
  variant?: 'default' | 'compact';
}

export function StationIncidentJournal({
  gameState,
  newIncidentCount,
  onResolve,
  onMarkSeen,
  t,
  variant = 'default'
}: StationIncidentJournalProps) {
  const active = gameState.activeIncidents ?? [];

  return (
    <section className={variant === 'compact' ? 'panel incident-journal compact' : 'panel incident-journal'}>
      <header className="panel-header">
        <h2>
          <BookOpen aria-hidden="true" size={18} /> {t.incidentJournalTitle}
        </h2>
        {newIncidentCount > 0 ? (
          <button type="button" className="pill-button" onClick={onMarkSeen}>
            <Sparkles aria-hidden="true" size={14} /> {t.incidentJournalNew}: {newIncidentCount}
          </button>
        ) : null}
      </header>

      {active.length === 0 ? <p className="panel-copy">{t.incidentJournalEmpty}</p> : null}

      <div className="incident-list">
        {active.map((incident) => {
          const definition = activeStationIncidents.find((item) => item.id === incident.id);
          const copy = t.incidents[incident.id];

          if (!definition || !copy) {
            return null;
          }

          const choices = getAvailableStationIncidentChoices(gameState, incident.id);

          return (
            <article className="incident-card" key={incident.id}>
              <strong>{copy.title}</strong>
              <p className="panel-copy">{copy.body}</p>
              <div className="incident-choice-list">
                {choices.map((choice) => {
                  const choiceCopy = copy.choices[choice.id];

                  return (
                    <button
                      type="button"
                      key={choice.id}
                      className="dialog-double"
                      aria-label={choiceCopy?.label ?? choice.id}
                      onClick={() => onResolve(incident.id, choice.id)}
                    >
                      <span>{choiceCopy?.label ?? choice.id}</span>
                      <small>{choiceCopy?.description ?? t.reward}</small>
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
