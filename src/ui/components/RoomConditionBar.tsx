'use client';

import { Wrench } from 'lucide-react';
import { getRoomCondition, getRoomConditionStatus } from '../../game/roomConditions';
import type { GameState, ModuleId } from '../../game/types';
import type { Translation } from '../../platform/i18n';

interface RoomConditionBarProps {
  gameState: GameState;
  roomId: ModuleId;
  t: Translation;
}

export function RoomConditionBar({ gameState, roomId, t }: RoomConditionBarProps) {
  const condition = getRoomCondition(gameState, roomId);
  const status = getRoomConditionStatus(condition);

  // Only show for unlocked rooms.
  if (gameState.moduleLevels[roomId] <= 0) {
    return null;
  }

  const statusLabel = {
    pristine: t.conditionPristine,
    working: t.conditionWorking,
    worn: t.conditionWorn,
    broken: t.conditionBroken
  }[status];

  const barColor = {
    pristine: 'var(--color-enamel-green)',
    working: 'var(--color-lamp-amber)',
    worn: 'var(--color-signal-red)',
    broken: 'var(--color-signal-red)'
  }[status];

  const showHint = status === 'worn' || status === 'broken';

  return (
    <div className="room-condition-bar">
      <div className="room-condition-header">
        <Wrench aria-hidden="true" size={12} />
        <span>{t.conditionTitle}</span>
        <small style={{ color: barColor }}>{statusLabel}</small>
      </div>
      <div className="room-condition-track">
        <div
          className="room-condition-fill"
          style={{ width: `${condition}%`, background: barColor }}
        />
      </div>
      {showHint && <p className="room-condition-hint">{t.conditionHint}</p>}
    </div>
  );
}
