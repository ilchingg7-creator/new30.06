import { communalDuties } from './content/communalDuties';
import { modules } from './content/modules';
import { activeStationIncidents } from './content/stationIncidents';
import {
  calculateModuleCost,
  calculatePrestigeReward,
  canPerformPrestige,
  getAvailablePrestigeUpgrades
} from './economy';
import { formatCredits } from './format';
import { hasResidentRole } from './residents';
import type { Translation } from '../platform/i18n';
import type {
  ActionPreview,
  ActionPreviewTag,
  CommunalDutyId,
  CommunalDutyReward,
  GameState,
  LastActionFeedback,
  ModuleId,
  ResidentId,
  StationIncidentEffect,
  StationIncidentId
} from './types';

function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    return key in vars ? String(vars[key]) : `{${key}}`;
  });
}

function formatIncomeRate(value: number, t: Translation): string {
  return `+${value.toFixed(2)}${t.actionPreviews.incomeRateSuffix}`;
}

function formatConditionRepair(
  repair: Partial<Record<ModuleId, number>> | undefined,
  t: Translation
): string | null {
  const total = Object.values(repair ?? {}).reduce((sum, value) => sum + value, 0);

  return total > 0 ? `+${total} ${t.actionPreviews.conditionDelta}` : null;
}

function formatCreditDelta(value: number): string {
  return `${value > 0 ? '+' : ''}${formatCredits(value)}`;
}

function formatRewardParts(reward: CommunalDutyReward | StationIncidentEffect, t: Translation): string[] {
  const parts: string[] = [];
  const dutyReward = reward as CommunalDutyReward;
  const incidentReward = reward as StationIncidentEffect;
  const comfort = dutyReward.comfortGain ?? incidentReward.comfortDelta;
  const condition = formatConditionRepair(reward.conditionRepair, t);

  if (comfort && comfort > 0) {
    parts.push(`+${comfort} ${t.actionPreviews.comfortDelta}`);
  }

  if (condition) {
    parts.push(condition);
  }

  if ('creditsDelta' in reward && reward.creditsDelta) {
    parts.push(formatCreditDelta(reward.creditsDelta));
  }

  if (reward.timedBonus) {
    parts.push(t.actionPreviews.timedBoost);
  }

  const visuals = 'visualPlaceholderIds' in reward ? reward.visualPlaceholderIds : undefined;

  if (visuals?.length) {
    parts.push(t.actionPreviews.visualDetail);
  }

  return parts;
}

function mergeConditionRepair(
  base: Partial<Record<ModuleId, number>>,
  bonus: Partial<Record<ModuleId, number>>
): Partial<Record<ModuleId, number>> {
  const merged = { ...base };

  for (const [roomId, repair] of Object.entries(bonus)) {
    const typedRoomId = roomId as ModuleId;

    merged[typedRoomId] = (merged[typedRoomId] ?? 0) + repair;
  }

  return merged;
}

function mergeDutyRewards(base: CommunalDutyReward, bonus: CommunalDutyReward): CommunalDutyReward {
  return {
    comfortGain: (base.comfortGain ?? 0) + (bonus.comfortGain ?? 0),
    conditionRepair: mergeConditionRepair(base.conditionRepair ?? {}, bonus.conditionRepair ?? {}),
    timedBonus: bonus.timedBonus ?? base.timedBonus
  };
}

function getDutyRewardPreview(
  state: GameState,
  dutyId: CommunalDutyId,
  residentId: ResidentId
): { reward: CommunalDutyReward; roleMatched: boolean; preferredRole?: string } | null {
  const definition = communalDuties.find((duty) => duty.id === dutyId);
  const outcome = definition?.outcomes.find((item) => item.residentId === residentId);

  if (!definition || !outcome) {
    return null;
  }

  const roleMatched = Boolean(
    definition.preferredRole &&
      definition.roleBonus &&
      hasResidentRole({ ...state, unlockedResidents: [residentId] }, definition.preferredRole, 1)
  );

  return {
    reward: roleMatched && definition.roleBonus ? mergeDutyRewards(outcome.reward, definition.roleBonus) : outcome.reward,
    roleMatched,
    preferredRole: definition.preferredRole
  };
}

export function getModulePurchasePreview(state: GameState, moduleId: ModuleId, t: Translation): ActionPreview {
  const definition = modules.find((module) => module.id === moduleId);
  const level = state.moduleLevels[moduleId];
  const cost = calculateModuleCost(moduleId, state);

  if (!definition) {
    return {
      title: t.actionPreviews.unknownRoom,
      result: t.actionPreviews.noPreview,
      tags: [],
      tone: 'warning'
    };
  }

  if (state.totalEarnedCredits < definition.unlockAtCredits) {
    return {
      title: interpolate(t.actionPreviews.roomLocked, { name: definition.name }),
      reason: t.actionPreviews.roomLockedReason,
      result: interpolate(t.actionPreviews.unlocksAt, { amount: formatCredits(definition.unlockAtCredits) }),
      tags: ['cost'],
      tone: 'warning'
    };
  }

  const comfort = level === 0 && definition.comfortBonus > 0
    ? interpolate(t.actionPreviews.roomComfort, { amount: definition.comfortBonus })
    : '';

  return {
    title: interpolate(level === 0 ? t.actionPreviews.openRoom : t.actionPreviews.upgradeRoom, { name: definition.name }),
    reason: level === 0 ? t.actionPreviews.firstRoomReason : t.actionPreviews.upgradeReason,
    result: interpolate(t.actionPreviews.purchaseResult, {
      cost: formatCredits(cost),
      income: formatIncomeRate(definition.baseIncomePerSecond, t),
      comfort
    }),
    tags: ['cost', 'income', ...(comfort ? (['comfort'] as ActionPreviewTag[]) : [])],
    tone: state.credits >= cost ? 'positive' : 'neutral'
  };
}

export function getCommunalDutyAssignmentPreview(
  state: GameState,
  dutyId: CommunalDutyId,
  residentId: ResidentId,
  t: Translation
): ActionPreview {
  const preview = getDutyRewardPreview(state, dutyId, residentId);

  if (!preview) {
    return {
      title: t.actionPreviews.dutyCannot,
      result: t.actionPreviews.chooseResident,
      tags: [],
      tone: 'warning'
    };
  }

  const rewardText = formatRewardParts(preview.reward, t).join(', ') || t.actionPreviews.stationStabilized;
  const roleLabel = preview.preferredRole ?? t.actionPreviews.roleResident;

  return {
    title: t.actionPreviews.expectedDuty,
    reason: preview.roleMatched
      ? interpolate(t.actionPreviews.roleMatches, { role: roleLabel })
      : t.actionPreviews.eligibleResident,
    result: rewardText,
    tags: ['condition', ...(preview.roleMatched ? (['role'] as ActionPreviewTag[]) : [])],
    tone: 'positive'
  };
}

export function getCommunalDutyClaimPreview(state: GameState, t: Translation): ActionPreview | null {
  const active = state.communalDuty;

  if (!active || active.status !== 'ready_to_claim' || !active.assignedResidentId) {
    return null;
  }

  return getCommunalDutyAssignmentPreview(state, active.dutyId, active.assignedResidentId, t);
}

export function getStationIncidentChoicePreview(
  state: GameState,
  incidentId: StationIncidentId,
  choiceId: string,
  t: Translation
): ActionPreview | null {
  const definition = activeStationIncidents.find((incident) => incident.id === incidentId);
  const choice = definition?.choices.find((item) => item.id === choiceId);

  if (!choice) {
    return null;
  }

  const rewardText = formatRewardParts(choice.effects, t).join(', ') || t.actionPreviews.journalMemory;
  const role = choice.requiresRole?.role;

  return {
    title: role ? t.actionPreviews.roleSolution : t.actionPreviews.choiceResult,
    reason: role
      ? interpolate(t.actionPreviews.roleUnlocks, { role })
      : t.actionPreviews.alwaysAvailable,
    result: rewardText,
    tags: [
      ...(choice.effects.comfortDelta ? (['comfort'] as ActionPreviewTag[]) : []),
      ...(choice.effects.conditionRepair ? (['condition'] as ActionPreviewTag[]) : []),
      ...(choice.effects.visualPlaceholderIds?.length ? (['visual'] as ActionPreviewTag[]) : []),
      ...(choice.effects.timedBonus ? (['timed_bonus'] as ActionPreviewTag[]) : []),
      ...(role ? (['role'] as ActionPreviewTag[]) : [])
    ],
    tone: 'positive'
  };
}

export function getRenovationPreview(state: GameState, t: Translation): ActionPreview {
  const reward = calculatePrestigeReward(state);
  const canRenovate = canPerformPrestige(state);
  const upgradeChoices = getAvailablePrestigeUpgrades({
    ...state,
    prestigeCount: (state.prestigeCount ?? 0) + 1
  }).length;

  return {
    title: canRenovate ? t.actionPreviews.renovationReady : t.actionPreviews.prepareRenovation,
    reason: t.actionPreviews.renovationReason,
    result: canRenovate
      ? interpolate(t.actionPreviews.renovationGain, {
          reward,
          choices: Math.min(3, upgradeChoices || 3)
        })
      : interpolate(t.actionPreviews.renovationBuild, { reward: Math.max(1, reward) }),
    tags: ['renovation'],
    tone: canRenovate ? 'positive' : 'neutral'
  };
}

export function getLastActionFeedback(state: GameState, t: Translation): LastActionFeedback | null {
  const duty = state.lastCommunalDutyResult;

  if (!duty) {
    return null;
  }

  const condition = formatConditionRepair(duty.conditionRepair, t);
  const parts = [
    duty.comfortGain > 0 ? `+${duty.comfortGain} ${t.actionPreviews.comfortDelta}` : null,
    condition
  ].filter(Boolean);

  return {
    title: t.actionPreviews.dutyResult,
    detail: parts.join(', ') || t.actionPreviews.dutyCompleted,
    tags: [
      ...(duty.comfortGain > 0 ? (['comfort'] as ActionPreviewTag[]) : []),
      ...(condition ? (['condition'] as ActionPreviewTag[]) : [])
    ]
  };
}
