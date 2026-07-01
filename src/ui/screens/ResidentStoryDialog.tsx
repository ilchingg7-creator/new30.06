'use client';

import { MessageCircle } from 'lucide-react';
import type { ActiveResidentStory } from '../../game/types';
import type { Translation } from '../../platform/i18n';

interface ResidentStoryDialogProps {
  story: ActiveResidentStory;
  t: Translation;
  onGotoRoom?(): void;
  onDismiss(): void;
}

export function ResidentStoryDialog({ story, t, onGotoRoom, onDismiss }: ResidentStoryDialogProps) {
  const storyCopy = t.stories[story.id];

  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        className="dialog-panel help-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="story-title"
      >
        <header className="help-header">
          <h2 id="story-title">
            <MessageCircle aria-hidden="true" size={18} style={{ verticalAlign: 'middle' }} /> {t.storyTitle}
          </h2>
        </header>

        {storyCopy && (
          <>
            <div className="settings-section">
              <strong>{storyCopy.title}</strong>
              <p className="panel-copy">{storyCopy.request}</p>
            </div>

            <dl className="dialog-stats">
              <div>
                <dt>{t.storyProgress}</dt>
                <dd>{story.currentLevel} / {story.requiredLevel}</dd>
              </div>
              <div>
                <dt>{t.storyReward}</dt>
                <dd>+{story.rewardComfort} {t.comfortWord}</dd>
              </div>
            </dl>

            <div className="visitor-actions">
              {onGotoRoom && (
                <button type="button" className="dialog-double" onClick={onGotoRoom}>
                  {t.storyGotoRoom}
                </button>
              )}
              <button type="button" onClick={onDismiss}>
                {t.close}
              </button>
            </div>
          </>
        )}

        {!storyCopy && (
          <button type="button" onClick={onDismiss}>
            {t.close}
          </button>
        )}
      </section>
    </div>
  );
}
