import { Gift } from 'lucide-react';
import { formatCredits, formatDuration } from '../../game/format';

interface OfflineRewardDialogProps {
  seconds: number;
  credits: number;
  onCollect(): void;
  onDouble?(): void;
  adsAvailable?: boolean;
  adPending?: boolean;
}

export function OfflineRewardDialog({
  seconds,
  credits,
  onCollect,
  onDouble,
  adsAvailable = false,
  adPending = false
}: OfflineRewardDialogProps) {
  const showDouble = Boolean(onDouble) && adsAvailable;

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="dialog-panel" role="dialog" aria-modal="true" aria-labelledby="offline-reward-title">
        <h2 id="offline-reward-title">Станция поработала без вас</h2>
        <dl className="dialog-stats">
          <div>
            <dt>Время</dt>
            <dd>{formatDuration(seconds)}</dd>
          </div>
          <div>
            <dt>Кредиты</dt>
            <dd>{formatCredits(credits)}</dd>
          </div>
        </dl>
        {showDouble && (
          <button type="button" className="dialog-double" onClick={onDouble} disabled={adPending}>
            <Gift aria-hidden="true" size={16} />
            {adPending ? 'Реклама...' : 'Удвоить за рекламу'}
          </button>
        )}
        <button type="button" onClick={onCollect} disabled={adPending}>
          Забрать
        </button>
      </section>
    </div>
  );
}
