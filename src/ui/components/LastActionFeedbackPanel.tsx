import { getLastActionFeedback } from '../../game/actionPreviews';
import type { GameState } from '../../game/types';
import type { Translation } from '../../platform/i18n';
import { ActionPreviewLine } from './ActionPreviewLine';

interface LastActionFeedbackPanelProps {
  gameState: GameState;
  t: Translation;
  variant?: 'default' | 'compact';
}

export function LastActionFeedbackPanel({ gameState, t, variant = 'default' }: LastActionFeedbackPanelProps) {
  const feedback = getLastActionFeedback(gameState);

  if (!feedback) {
    return null;
  }

  return (
    <section
      className={variant === 'compact' ? 'last-action-feedback compact' : 'last-action-feedback'}
      aria-live="polite"
    >
      <ActionPreviewLine preview={feedback} t={t} variant={variant} />
    </section>
  );
}
