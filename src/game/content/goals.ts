import type { GoalDefinition } from '../types';

export const goals: GoalDefinition[] = [
  {
    id: 'buy_capsule_10',
    title: 'Поднять капсулу до 10 уровня',
    renovationCycle: 0,
    rewardComfort: 1,
    rewardKind: 'comfort',
    rewardLabel: '+1 комфорт'
  },
  {
    id: 'unlock_kitchen',
    title: 'Открыть общую космо-кухню',
    renovationCycle: 0,
    rewardComfort: 1,
    rewardKind: 'comfort',
    rewardLabel: '+1 комфорт'
  },
  {
    id: 'reach_comfort_25',
    title: 'Довести комфорт до 25',
    renovationCycle: 0,
    rewardComfort: 3,
    rewardKind: 'comfort',
    rewardLabel: '+3 комфорт'
  },
  {
    id: 'earn_credits_10000',
    title: 'Заработать 10 000 копеек',
    renovationCycle: 0,
    rewardComfort: 2,
    rewardKind: 'comfort',
    rewardLabel: '+2 комфорт'
  },
  {
    id: 'unlock_three_residents',
    title: 'Заселить 3 жильцов',
    renovationCycle: 0,
    rewardComfort: 5,
    rewardKind: 'comfort',
    rewardLabel: '+5 комфорт'
  },
  {
    id: 'unlock_panorama_dome',
    title: 'Открыть панорамный купол',
    renovationCycle: 0,
    rewardComfort: 8,
    rewardKind: 'comfort',
    rewardLabel: '+8 комфорт'
  },
  {
    id: 'first_renovation',
    title: 'Сделать первую реновацию орбиты',
    renovationCycle: 0,
    rewardComfort: 0,
    rewardKind: 'prestige_hint',
    rewardLabel: 'Новый список целей'
  },
  {
    id: 'rebuild_capsule_10',
    title: 'Восстановить капсулу до 10 уровня',
    renovationCycle: 1,
    rewardComfort: 2,
    rewardKind: 'comfort',
    rewardLabel: '+2 комфорт'
  },
  {
    id: 'reopen_kitchen',
    title: 'Снова открыть космо-кухню',
    renovationCycle: 1,
    rewardComfort: 2,
    rewardKind: 'comfort',
    rewardLabel: '+2 комфорт'
  },
  {
    id: 'unlock_laundry_after_renovation',
    title: 'Открыть прачечную невесомости',
    renovationCycle: 1,
    rewardComfort: 3,
    rewardKind: 'comfort',
    rewardLabel: '+3 комфорт'
  },
  {
    id: 'reach_comfort_40',
    title: 'Довести комфорт до 40',
    renovationCycle: 1,
    rewardComfort: 4,
    rewardKind: 'comfort',
    rewardLabel: '+4 комфорт'
  },
  {
    id: 'earn_credits_50000',
    title: 'Заработать 50 000 копеек в цикле',
    renovationCycle: 1,
    rewardComfort: 4,
    rewardKind: 'comfort',
    rewardLabel: '+4 комфорт'
  },
  {
    id: 'second_renovation',
    title: 'Сделать вторую реновацию',
    renovationCycle: 1,
    rewardComfort: 0,
    rewardKind: 'prestige_hint',
    rewardLabel: 'Новый список целей'
  },
  {
    id: 'rebuild_capsule_25',
    title: 'Развить капсулу до 25 уровня',
    renovationCycle: 2,
    rewardComfort: 4,
    rewardKind: 'comfort',
    rewardLabel: '+4 комфорт'
  },
  {
    id: 'unlock_teleport_entry',
    title: 'Открыть телепорт-прихожую',
    renovationCycle: 2,
    rewardComfort: 5,
    rewardKind: 'comfort',
    rewardLabel: '+5 комфорт'
  },
  {
    id: 'unlock_five_residents',
    title: 'Заселить 5 жильцов',
    renovationCycle: 2,
    rewardComfort: 6,
    rewardKind: 'comfort',
    rewardLabel: '+6 комфорт'
  },
  {
    id: 'reach_comfort_60',
    title: 'Довести комфорт до 60',
    renovationCycle: 2,
    rewardComfort: 6,
    rewardKind: 'comfort',
    rewardLabel: '+6 комфорт'
  },
  {
    id: 'earn_credits_100000',
    title: 'Заработать 100 000 копеек в цикле',
    renovationCycle: 2,
    rewardComfort: 6,
    rewardKind: 'comfort',
    rewardLabel: '+6 комфорт'
  },
  {
    id: 'repeat_renovation',
    title: 'Провести еще одну реновацию',
    renovationCycle: 2,
    rewardComfort: 0,
    rewardKind: 'prestige_hint',
    rewardLabel: 'Новый цикл станции'
  }
];

Object.assign(goals.find((goal) => goal.id === 'earn_credits_10000')!, {
  rewardComfort: 0,
  rewardKind: 'temporary_boost',
  rewardLabel: 'x1.15 income for 5 min',
  rewardTimedBonus: {
    id: 'goal_earn_credits_10000',
    incomeMultiplier: 1.15,
    durationMs: 5 * 60 * 1_000
  }
} satisfies Partial<GoalDefinition>);

Object.assign(goals.find((goal) => goal.id === 'unlock_three_residents')!, {
  rewardComfort: 0,
  rewardKind: 'visual_detail',
  rewardLabel: 'Visual detail: resident schedule',
  rewardVisualPlaceholderIds: ['table_schedule_01']
} satisfies Partial<GoalDefinition>);
