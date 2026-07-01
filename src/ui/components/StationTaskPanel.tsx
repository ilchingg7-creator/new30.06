'use client';

import { ClipboardList, DoorOpen, RotateCcw } from 'lucide-react';
import { formatCredits, formatDuration } from '../../game/format';
import type { StationGuidance, StationGuidanceCopyKey } from '../../game/stationDirector';
import type { ModuleId } from '../../game/types';
import type { Translation } from '../../platform/i18n';

interface StationTaskPanelProps {
  guidance: StationGuidance;
  onSelectRoom?(moduleId: ModuleId): void;
  onRenovate?(): void;
  variant?: 'default' | 'compact';
  t: Translation;
}

function getTitle(copyKey: StationGuidanceCopyKey, t: Translation): string {
  switch (copyKey) {
    case 'visitor':
      return t.taskVisitorTitle;
    case 'daily':
      return t.taskDailyTitle;
    case 'communal_duty_claim':
      return t.taskCommunalDutyClaimTitle;
    case 'communal_duty_assign':
      return t.taskCommunalDutyAssignTitle;
    case 'goal':
      return t.taskGoalTitle;
    case 'module_buy':
      return t.taskModuleBuyTitle;
    case 'module_wait':
      return t.taskModuleWaitTitle;
    case 'module_unlock':
      return t.taskModuleUnlockTitle;
    case 'prestige':
      return t.taskPrestigeTitle;
  }
}

function getBody(copyKey: StationGuidanceCopyKey, t: Translation): string {
  switch (copyKey) {
    case 'visitor':
      return t.taskVisitorBody;
    case 'daily':
      return t.taskDailyBody;
    case 'communal_duty_claim':
      return t.taskCommunalDutyClaimBody;
    case 'communal_duty_assign':
      return t.taskCommunalDutyAssignBody;
    case 'goal':
      return t.taskGoalBody;
    case 'module_buy':
      return t.taskModuleBuyBody;
    case 'module_wait':
      return t.taskModuleWaitBody;
    case 'module_unlock':
      return t.taskModuleUnlockBody;
    case 'prestige':
      return t.taskPrestigeBody;
  }
}

function GuidanceMeta({ guidance, t }: { guidance: StationGuidance; t: Translation }) {
  if (guidance.kind === 'module') {
    return (
      <dl className="station-task-meta">
        <div>
          <dt>{t.taskCost}</dt>
          <dd>{formatCredits(guidance.cost)}</dd>
        </div>
        <div>
          <dt>{t.taskWait}</dt>
          <dd>{guidance.waitSeconds === null ? '-' : formatDuration(guidance.waitSeconds)}</dd>
        </div>
      </dl>
    );
  }

  if (guidance.kind === 'goal') {
    return (
      <dl className="station-task-meta">
        <div>
          <dt>{t.taskProgress}</dt>
          <dd>{guidance.progressCurrent}/{guidance.progressTarget}</dd>
        </div>
      </dl>
    );
  }

  if (guidance.kind === 'prestige') {
    return (
      <dl className="station-task-meta">
        <div>
          <dt>{t.reputation}</dt>
          <dd>+{guidance.expectedReputation}</dd>
        </div>
      </dl>
    );
  }

  if (guidance.kind === 'visitor') {
    return (
      <dl className="station-task-meta">
        <div>
          <dt>{t.taskCost}</dt>
          <dd>{formatCredits(guidance.visitorCost)}</dd>
        </div>
        <div>
          <dt>{t.reward}</dt>
          <dd>+{guidance.visitorRewardComfort} {t.comfortWord}</dd>
        </div>
      </dl>
    );
  }

  return null;
}

export function StationTaskPanel({ guidance, onSelectRoom, onRenovate, variant = 'default', t }: StationTaskPanelProps) {
  const title = getTitle(guidance.copyKey, t);
  const body = getBody(guidance.copyKey, t);
  const canSelectRoom = Boolean(guidance.targetRoomId && onSelectRoom);
  const canRenovate = guidance.kind === 'prestige' && guidance.canRenovate && onRenovate;
  const className = variant === 'compact' ? 'panel station-task-panel compact' : 'panel station-task-panel';

  return (
    <section className={className} aria-labelledby="station-task-title">
      <div className="station-task-heading">
        <ClipboardList aria-hidden="true" size={17} />
        <h2 id="station-task-title">{t.currentTask}</h2>
      </div>
      <div className="station-task-body">
        <div>
          <strong>{title}</strong>
          <p>{body}</p>
          <GuidanceMeta guidance={guidance} t={t} />
        </div>
        <div className="station-task-actions">
          {canSelectRoom && (
            <button type="button" onClick={() => onSelectRoom?.(guidance.targetRoomId!)}>
              <DoorOpen aria-hidden="true" size={16} />
              {t.taskSelectRoom}
            </button>
          )}
          {canRenovate && (
            <button type="button" onClick={onRenovate}>
              <RotateCcw aria-hidden="true" size={16} />
              {t.taskRenovate}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
