import { formatCredits, formatDuration } from '../../game/format';

interface OfflineRewardDialogProps {
  seconds: number;
  credits: number;
  onCollect(): void;
}

export function OfflineRewardDialog({ seconds, credits, onCollect }: OfflineRewardDialogProps) {
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
        <button type="button" onClick={onCollect}>
          Забрать
        </button>
      </section>
    </div>
  );
}
