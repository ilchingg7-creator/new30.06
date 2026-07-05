import {
  getCommunalDutyAssignmentPreview,
  getCommunalDutyClaimPreview,
  getRenovationPreview
} from './actionPreviews';
import { communalDuties } from './content/communalDuties';
import { calculatePrestigeReward, canPerformPrestige } from './economy';
import type { ActionPreview, CommunalDutyId, GameState, ModuleId } from './types';

export type StationGuidanceCopyKey =
  | 'visitor'
  | 'daily'
  | 'communal_duty_claim'
  | 'communal_duty_assign'
  | 'prestige';

interface StationGuidanceBase {
  kind: 'visitor' | 'daily' | 'communal_duty' | 'prestige';
  priority: number;
  copyKey: StationGuidanceCopyKey;
  targetRoomId?: ModuleId;
  canActNow: boolean;
  preview?: ActionPreview;
}

export interface VisitorGuidance extends StationGuidanceBase {
  kind: 'visitor';
  visitorCost: number;
  visitorRewardComfort: number;
}

export interface DailyGuidance extends StationGuidanceBase {
  kind: 'daily';
}

export interface CommunalDutyGuidance extends StationGuidanceBase {
  kind: 'communal_duty';
  dutyId: CommunalDutyId;
}

export interface PrestigeGuidance extends StationGuidanceBase {
  kind: 'prestige';
  canRenovate: boolean;
  expectedReputation: number;
}

export type StationGuidance =
  | VisitorGuidance
  | DailyGuidance
  | CommunalDutyGuidance
  | PrestigeGuidance;

export interface StationGuidanceInput {
  state: GameState;
  incomePerSecond: number;
  hasPendingDailyReward?: boolean;
}

export function getStationGuidance({
  state,
  incomePerSecond: _incomePerSecond,
  hasPendingDailyReward = false
}: StationGuidanceInput): StationGuidance | null {
  if (state.activeVisitor && state.credits >= state.activeVisitor.cost) {
    return {
      kind: 'visitor',
      priority: 100,
      copyKey: 'visitor',
      canActNow: true,
      visitorCost: state.activeVisitor.cost,
      visitorRewardComfort: state.activeVisitor.rewardComfort
    };
  }

  if (hasPendingDailyReward) {
    return {
      kind: 'daily',
      priority: 90,
      copyKey: 'daily',
      canActNow: true
    };
  }

  if (state.communalDuty?.status === 'ready_to_claim') {
    return {
      kind: 'communal_duty',
      priority: 95,
      copyKey: 'communal_duty_claim',
      canActNow: true,
      dutyId: state.communalDuty.dutyId,
      targetRoomId: state.communalDuty.roomId,
      preview: getCommunalDutyClaimPreview(state) ?? undefined
    };
  }

  if (state.communalDuty?.status === 'available') {
    const activeDuty = state.communalDuty;
    const definition = communalDuties.find((duty) => duty.id === activeDuty.dutyId);
    const residentId = definition?.eligibleResidentIds.find((id) => state.unlockedResidents.includes(id));

    return {
      kind: 'communal_duty',
      priority: 85,
      copyKey: 'communal_duty_assign',
      canActNow: true,
      dutyId: activeDuty.dutyId,
      targetRoomId: activeDuty.roomId,
      preview: residentId ? getCommunalDutyAssignmentPreview(state, activeDuty.dutyId, residentId) : undefined
    };
  }

  const prestigeReward = calculatePrestigeReward(state);

  if (prestigeReward > 0 && canPerformPrestige(state)) {
    return {
      kind: 'prestige',
      priority: 75,
      copyKey: 'prestige',
      canActNow: true,
      canRenovate: true,
      expectedReputation: prestigeReward,
      preview: getRenovationPreview(state)
    };
  }

  return null;
}
