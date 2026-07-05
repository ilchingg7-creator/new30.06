'use client';

import { ClipboardCheck, UserCheck } from 'lucide-react';
import { getCommunalDutyAssignmentPreview, getCommunalDutyClaimPreview } from '../../game/actionPreviews';
import { communalDuties } from '../../game/content/communalDuties';
import type { GameState, ResidentId } from '../../game/types';
import type { Translation } from '../../platform/i18n';
import { ActionPreviewLine } from './ActionPreviewLine';

interface CommunalDutyPanelProps {
  gameState: GameState;
  onAssign(residentId: ResidentId): void;
  onClaim(): void;
  variant?: 'default' | 'compact';
  t: Translation;
}

function getResidentName(residentId: ResidentId, t: Translation): string {
  return t.content.residents[residentId]?.name ?? residentId;
}

export function CommunalDutyPanel({ gameState, onAssign, onClaim, variant = 'default', t }: CommunalDutyPanelProps) {
  const active = gameState.communalDuty;

  if (!active) {
    return null;
  }

  const definition = communalDuties.find((duty) => duty.id === active.dutyId);

  if (!definition) {
    return null;
  }

  const copy = t.communalDuties[definition.id];
  const eligibleResidents = definition.eligibleResidentIds.filter((residentId) => gameState.unlockedResidents.includes(residentId));
  const className = variant === 'compact' ? 'panel communal-duty-panel compact' : 'panel communal-duty-panel';
  const claimPreview = getCommunalDutyClaimPreview(gameState);

  return (
    <section className={className} aria-labelledby="communal-duty-title">
      <div className="communal-duty-heading">
        <ClipboardCheck aria-hidden="true" size={17} />
        <h2 id="communal-duty-title">{t.communalDutyTitle}</h2>
      </div>
      <strong>{copy?.title ?? definition.id}</strong>
      {active.status === 'available' && (
        <>
          <p className="panel-copy">{copy?.request ?? definition.id}</p>
          <div className="communal-duty-actions">
            {eligibleResidents.length === 0 && <span>{t.communalDutyNoResidents}</span>}
            {eligibleResidents.map((residentId) => {
              const preview = getCommunalDutyAssignmentPreview(gameState, definition.id, residentId);

              return (
                <div className="communal-duty-choice" key={residentId}>
                  <button type="button" onClick={() => onAssign(residentId)}>
                    <UserCheck aria-hidden="true" size={15} />
                    {getResidentName(residentId, t)}
                    {residentId === definition.bestResidentId ? ` · ${t.communalDutyBestMatch}` : ''}
                  </button>
                  <ActionPreviewLine preview={preview} t={t} variant={variant} />
                </div>
              );
            })}
          </div>
        </>
      )}
      {active.status === 'in_progress' && (
        <p className="panel-copy">
          {t.communalDutyInProgress}: {active.assignedResidentId ? getResidentName(active.assignedResidentId, t) : ''}
        </p>
      )}
      {active.status === 'ready_to_claim' && (
        <div className="communal-duty-actions">
          <p className="panel-copy">{t.communalDutyReady}</p>
          {claimPreview ? <ActionPreviewLine preview={claimPreview} t={t} variant={variant} /> : null}
          <button type="button" onClick={onClaim}>
            <ClipboardCheck aria-hidden="true" size={15} />
            {t.communalDutyClaim}
          </button>
        </div>
      )}
    </section>
  );
}
