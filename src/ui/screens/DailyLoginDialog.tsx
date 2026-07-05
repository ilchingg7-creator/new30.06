import { CalendarHeart, Coins, Heart, Wrench, Zap } from 'lucide-react';
import { formatCredits } from '../../game/format';
import type { DailyRewardInfo } from '../../game/economy';
import type { Translation } from '../../platform/i18n';

interface DailyLoginDialogProps {
  streak: number;
  reward: DailyRewardInfo;
  onCollect(): void;
  t: Translation;
}

const MAX_STREAK = 7;

function getRewardIcon(reward: DailyRewardInfo) {
  switch (reward.kind) {
    case 'kopeks':
      return Coins;
    case 'comfort':
      return Heart;
    case 'condition_repair_all':
      return Wrench;
    case 'timed_bonus':
      return Zap;
    default:
      return CalendarHeart;
  }
}

function getRewardText(reward: DailyRewardInfo, t: Translation): string {
  switch (reward.kind) {
    case 'kopeks':
      return `${formatCredits(reward.amount)} ${t.dailyRewardSuffix}`;
    case 'comfort':
      return `+${reward.amount} ${t.comfortWord}`;
    case 'condition_repair_all':
      return `+${reward.amount} ${t.dailyConditionRepair}`;
    case 'timed_bonus':
      return `x${reward.multiplier} ${t.dailyTimedBonus} (10 ${t.weeklyRepairDays === 'д' ? 'мин' : 'min'})`;
    default:
      return t.dailyRewardText;
  }
}

export function DailyLoginDialog({ streak, reward, onCollect, t }: DailyLoginDialogProps) {
  const effectiveStreak = ((streak - 1) % MAX_STREAK) + 1;
  const Icon = getRewardIcon(reward);

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="dialog-panel" role="dialog" aria-modal="true" aria-labelledby="daily-login-title">
        <h2 id="daily-login-title">{t.dailyLoginTitle}</h2>
        <p className="panel-copy">
          <CalendarHeart aria-hidden="true" size={16} style={{ verticalAlign: 'middle' }} /> {t.day} {effectiveStreak} {t.of}{' '}
          {MAX_STREAK}
        </p>
        <div className="daily-reward-display">
          <Icon aria-hidden="true" size={28} />
          <strong>{getRewardText(reward, t)}</strong>
        </div>
        <div className="daily-streak-dots" aria-hidden="true">
          {Array.from({ length: MAX_STREAK }, (_, index) => (
            <span key={index} className={index < effectiveStreak ? 'daily-dot active' : 'daily-dot'} />
          ))}
        </div>
        <button type="button" onClick={onCollect}>
          {t.collect}
        </button>
      </section>
    </div>
  );
}
