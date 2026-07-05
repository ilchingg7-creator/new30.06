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

function formatIncomeRate(value: number): string {
  return `+${value.toFixed(2)}/sec`;
}

function formatConditionRepair(repair: Partial<Record<ModuleId, number>> | undefined): string | null {
  const total = Object.values(repair ?? {}).reduce((sum, value) => sum + value, 0);

  return total > 0 ? `+${total} condition` : null;
}

function formatCreditDelta(value: number): string {
  return `${value > 0 ? '+' : ''}${formatCredits(value)}`;
}

function formatRewardParts(reward: CommunalDutyReward | StationIncidentEffect): string[] {
  const parts: string[] = [];
  const dutyReward = reward as CommunalDutyReward;
  const incidentReward = reward as StationIncidentEffect;
  const comfort = dutyReward.comfortGain ?? incidentReward.comfortDelta;
  const condition = formatConditionRepair(reward.conditionRepair);

  if (comfort && comfort > 0) {
    parts.push(`+${comfort} comfort`);
  }

  if (condition) {
    parts.push(condition);
  }

  if ('creditsDelta' in reward && reward.creditsDelta) {
    parts.push(formatCreditDelta(reward.creditsDelta));
  }

  if (reward.timedBonus) {
    parts.push('temporary income boost');
  }

  const visuals = 'visualPlaceholderIds' in reward ? reward.visualPlaceholderIds : undefined;

  if (visuals?.length) {
    parts.push('visual detail');
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

export function getModulePurchasePreview(state: GameState, moduleId: ModuleId): ActionPreview {
  const definition = modules.find((module) => module.id === moduleId);
  const level = state.moduleLevels[moduleId];
  const cost = calculateModuleCost(moduleId, state);

  if (!definition) {
    return {
      title: 'Unknown room',
      result: 'No preview available',
      tags: [],
      tone: 'warning'
    };
  }

  if (state.totalEarnedCredits < definition.unlockAtCredits) {
    return {
      title: `${definition.name} locked`,
      reason: 'Earn more kopeks to unlock this room.',
      result: `Unlocks at ${formatCredits(definition.unlockAtCredits)} total earned`,
      tags: ['cost'],
      tone: 'warning'
    };
  }

  const comfort = level === 0 && definition.comfortBonus > 0 ? `, +${definition.comfortBonus} comfort` : '';

  return {
    title: level === 0 ? `Open ${definition.name}` : `Upgrade ${definition.name}`,
    reason: level === 0
      ? 'Creates the first working room in this station area.'
      : 'Raises room level and moves toward the next milestone.',
    result: `Costs ${formatCredits(cost)}, adds ${formatIncomeRate(definition.baseIncomePerSecond)}${comfort}`,
    tags: ['cost', 'income', ...(comfort ? (['comfort'] as ActionPreviewTag[]) : [])],
    tone: state.credits >= cost ? 'positive' : 'neutral'
  };
}

export function getCommunalDutyAssignmentPreview(
  state: GameState,
  dutyId: CommunalDutyId,
  residentId: ResidentId
): ActionPreview {
  const preview = getDutyRewardPreview(state, dutyId, residentId);

  if (!preview) {
    return {
      title: 'Resident cannot take this duty',
      result: 'Choose an eligible resident.',
      tags: [],
      tone: 'warning'
    };
  }

  const rewardText = formatRewardParts(preview.reward).join(', ') || 'station stabilized';

  return {
    title: 'Expected duty result',
    reason: preview.roleMatched
      ? `${preview.preferredRole ?? 'Resident'} role matches this duty.`
      : 'Eligible resident can complete this duty.',
    result: rewardText,
    tags: ['condition', ...(preview.roleMatched ? (['role'] as ActionPreviewTag[]) : [])],
    tone: 'positive'
  };
}

export function getCommunalDutyClaimPreview(state: GameState): ActionPreview | null {
  const active = state.communalDuty;

  if (!active || active.status !== 'ready_to_claim' || !active.assignedResidentId) {
    return null;
  }

  return getCommunalDutyAssignmentPreview(state, active.dutyId, active.assignedResidentId);
}

export function getStationIncidentChoicePreview(
  state: GameState,
  incidentId: StationIncidentId,
  choiceId: string
): ActionPreview | null {
  const definition = activeStationIncidents.find((incident) => incident.id === incidentId);
  const choice = definition?.choices.find((item) => item.id === choiceId);

  if (!choice) {
    return null;
  }

  const rewardText = formatRewardParts(choice.effects).join(', ') || 'journal memory';
  const role = choice.requiresRole?.role;

  return {
    title: role ? 'Role solution' : 'Choice result',
    reason: role ? `${role} role unlocks this option.` : 'Always available incident response.',
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

export function getRenovationPreview(state: GameState): ActionPreview {
  const reward = calculatePrestigeReward(state);
  const canRenovate = canPerformPrestige(state);
  const upgradeChoices = getAvailablePrestigeUpgrades({
    ...state,
    prestigeCount: (state.prestigeCount ?? 0) + 1
  }).length;

  return {
    title: canRenovate ? 'Renovation ready' : 'Prepare renovation',
    reason: 'Renovation resets rooms and kopeks, but reputation and purchased permanent upgrades stay.',
    result: canRenovate
      ? `Gain +${reward} reputation and unlock ${Math.min(3, upgradeChoices || 3)} upgrade choices`
      : `Build toward +${Math.max(1, reward)} reputation`,
    tags: ['renovation'],
    tone: canRenovate ? 'positive' : 'neutral'
  };
}

export function getLastActionFeedback(state: GameState): LastActionFeedback | null {
  const duty = state.lastCommunalDutyResult;

  if (!duty) {
    return null;
  }

  const condition = formatConditionRepair(duty.conditionRepair);
  const parts = [duty.comfortGain > 0 ? `+${duty.comfortGain} comfort` : null, condition].filter(Boolean);

  return {
    title: 'Duty result',
    detail: parts.join(', ') || 'Station duty completed',
    tags: [
      ...(duty.comfortGain > 0 ? (['comfort'] as ActionPreviewTag[]) : []),
      ...(condition ? (['condition'] as ActionPreviewTag[]) : [])
    ]
  };
}
