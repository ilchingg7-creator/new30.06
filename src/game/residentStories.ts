import type {
  ActiveResidentStory,
  GameState,
  ModuleId,
  ResidentId,
  ResidentStoryDefinition,
  ResidentStoryId
} from './types';

/**
 * Resident story definitions. Each story is tied to a resident and a room.
 * The story triggers when the room reaches `triggerLevel` (the resident
 * notices a problem) and completes when the room reaches `requiredLevel`
 * (the problem is fixed). The reward is comfort.
 *
 * Stories fire once per save (tracked in `completedStories`).
 */
export const residentStories: ResidentStoryDefinition[] = [
  {
    id: 'engineer_quiet_capsule',
    residentId: 'sleepy_engineer',
    roomId: 'tenant_capsule',
    triggerLevel: 10,
    requiredLevel: 15,
    rewardComfort: 2
  },
  {
    id: 'cook_working_kitchen',
    residentId: 'mist_cook',
    roomId: 'cosmo_kitchen',
    triggerLevel: 10,
    requiredLevel: 20,
    rewardComfort: 3
  },
  {
    id: 'gardener_first_plant',
    residentId: 'vacuum_gardener',
    roomId: 'oxygen_garden',
    triggerLevel: 1,
    requiredLevel: 10,
    rewardComfort: 3
  },
  {
    id: 'sock_master_laundry_upgrade',
    residentId: 'sock_master',
    roomId: 'zero_g_laundry',
    triggerLevel: 10,
    requiredLevel: 25,
    rewardComfort: 5
  },
  {
    id: 'courier_teleport_traffic',
    residentId: 'teleport_courier',
    roomId: 'teleport_entry',
    triggerLevel: 1,
    requiredLevel: 15,
    rewardComfort: 4
  },
  {
    id: 'cosmonaut_warm_start',
    residentId: 'retired_cosmonaut',
    roomId: 'tenant_capsule',
    triggerLevel: 1,
    requiredLevel: 10,
    rewardComfort: 3
  }
];

/**
 * Returns the first active (incomplete, triggered) resident story, or null.
 * A story is active when:
 * 1. Its resident is unlocked.
 * 2. It hasn't been completed yet.
 * 3. The room level >= triggerLevel but < requiredLevel.
 *
 * Only one story is shown at a time (the first matching one in definition
 * order) to avoid overwhelming the player.
 */
export function getActiveResidentStory(state: GameState): ActiveResidentStory | null {
  const unlocked = new Set(state.unlockedResidents);
  const completed = new Set(state.completedStories ?? []);

  for (const story of residentStories) {
    if (!unlocked.has(story.residentId) || completed.has(story.id)) {
      continue;
    }

    const level = state.moduleLevels[story.roomId];

    if (level >= story.triggerLevel && level < story.requiredLevel) {
      return {
        id: story.id,
        residentId: story.residentId,
        roomId: story.roomId,
        currentLevel: level,
        requiredLevel: story.requiredLevel,
        rewardComfort: story.rewardComfort
      };
    }
  }

  return null;
}

/**
 * Check all resident stories for completion. Returns a new GameState with
 * any newly-completed stories marked, their comfort rewards applied, and
 * their IDs added to `completedStories`.
 *
 * Called from economy mutators (buyModuleLevel, advanceGame, etc.) so
 * stories auto-complete as soon as the requirement is met.
 */
export function checkResidentStories(state: GameState): GameState {
  const unlocked = new Set(state.unlockedResidents);
  const completed = new Set(state.completedStories ?? []);
  let comfortGain = 0;
  let changed = false;

  for (const story of residentStories) {
    if (!unlocked.has(story.residentId) || completed.has(story.id)) {
      continue;
    }

    const level = state.moduleLevels[story.roomId];

    if (level >= story.requiredLevel) {
      completed.add(story.id);
      comfortGain += story.rewardComfort;
      changed = true;
    }
  }

  if (!changed) {
    return state;
  }

  return {
    ...state,
    comfort: state.comfort + comfortGain,
    completedStories: Array.from(completed)
  };
}

/**
 * Returns whether a given story has been completed.
 */
export function isStoryCompleted(state: GameState, storyId: ResidentStoryId): boolean {
  return (state.completedStories ?? []).includes(storyId);
}
