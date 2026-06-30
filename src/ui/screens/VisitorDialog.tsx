import { UserRound } from 'lucide-react';
import { formatCredits } from '../../game/format';
import type { VisitorRequest } from '../../game/types';
import type { Translation } from '../../platform/i18n';

interface VisitorDialogProps {
  visitor: VisitorRequest;
  canAfford: boolean;
  onAccept(): void;
  onDecline(): void;
  t: Translation;
}

export function VisitorDialog({ visitor, canAfford, onAccept, onDecline, t }: VisitorDialogProps) {
  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="dialog-panel" role="dialog" aria-modal="true" aria-labelledby="visitor-title">
        <h2 id="visitor-title">
          <UserRound aria-hidden="true" size={18} style={{ verticalAlign: 'middle' }} /> {visitor.name}
        </h2>
        <p className="dialog-stats-copy">{visitor.flavor}</p>
        <dl className="dialog-stats">
          <div>
            <dt>Цена</dt>
            <dd>{formatCredits(visitor.cost)}</dd>
          </div>
          <div>
            <dt>Награда</dt>
            <dd>+{visitor.rewardComfort} комфорт</dd>
          </div>
        </dl>
        <div className="visitor-actions">
          <button type="button" className="dialog-double" onClick={onAccept} disabled={!canAfford}>
            {t.accept}
          </button>
          <button type="button" onClick={onDecline}>
            {t.decline}
          </button>
        </div>
      </section>
    </div>
  );
}
