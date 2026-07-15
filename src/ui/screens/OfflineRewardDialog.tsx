import { Gift } from 'lucide-react';
import { formatCredits, formatDuration } from '../../game/format';
import type { Translation } from '../../platform/i18n';

interface OfflineRewardDialogProps {
  seconds: number;
  credits: number;
  onCollect(): void;
  onDouble?(): void;
  adsAvailable?: boolean;
  adPending?: boolean;
  t: Translation;
}

export function OfflineRewardDialog({
  seconds,
  credits,
  onCollect,
  onDouble,
  adsAvailable = false,
  adPending = false,
  t
}: OfflineRewardDialogProps) {
  const showDouble = Boolean(onDouble) && adsAvailable;

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="dialog-panel" role="dialog" aria-modal="true" aria-labelledby="offline-reward-title">
        <h2 id="offline-reward-title">{t.offlineTitle}</h2>
        <p>{t.offlineRewardExplanation}</p>
        <dl className="dialog-stats">
          <div>
            <dt>{t.time}</dt>
            <dd>{formatDuration(seconds, {
              hours: t.hoursShort,
              minutes: t.minutesShort,
              seconds: t.secondsShort
            })}</dd>
          </div>
          <div>
            <dt>{t.kopeks}</dt>
            <dd>{formatCredits(credits)}</dd>
          </div>
        </dl>
        {showDouble && (
          <button type="button" className="dialog-double" onClick={onDouble} disabled={adPending}>
            <Gift aria-hidden="true" size={16} />
            {adPending ? t.adPending : t.doubleViaAd}
          </button>
        )}
        <button type="button" onClick={onCollect} disabled={adPending}>
          {t.collect}
        </button>
      </section>
    </div>
  );
}
