import { HelpCircle, Home, RotateCcw, Sparkles, Target, X } from 'lucide-react';
import type { Translation } from '../../platform/i18n';

interface HelpOverlayProps {
  onClose(): void;
  t: Translation;
}

function buildHelpSections(t: Translation) {
  return [
    {
      icon: Home,
      title: t.helpRooms,
      body: t.helpRoomsBody
    },
    {
      icon: Target,
      title: t.helpGoals,
      body: t.helpGoalsBody
    },
    {
      icon: Sparkles,
      title: t.helpBonuses,
      body: t.helpBonusesBody
    },
    {
      icon: RotateCcw,
      title: t.helpRenovation,
      body: t.helpRenovationBody
    }
  ];
}

export function HelpOverlay({ onClose, t }: HelpOverlayProps) {
  const helpSections = buildHelpSections(t);

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="dialog-panel help-panel" role="dialog" aria-modal="true" aria-labelledby="help-title">
        <header className="help-header">
          <h2 id="help-title">
            <HelpCircle aria-hidden="true" size={18} style={{ verticalAlign: 'middle' }} /> {t.helpTitle}
          </h2>
          <button type="button" className="help-close" onClick={onClose} aria-label={t.close}>
            <X aria-hidden="true" size={18} />
          </button>
        </header>
        <ul className="help-list">
          {helpSections.map((section) => {
            const Icon = section.icon;

            return (
              <li key={section.title} className="help-item">
                <Icon aria-hidden="true" size={20} />
                <div>
                  <strong>{section.title}</strong>
                  <p>{section.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <button type="button" onClick={onClose} className="help-start">
          {t.helpStart}
        </button>
      </section>
    </div>
  );
}
