import type { GoalDefinition } from '../types';

export const goals: GoalDefinition[] = [
  {
    id: 'buy_capsule_10',
    title: 'Поднять капсулу до 10 уровня',
    rewardCredits: 120,
    rewardComfort: 1
  },
  {
    id: 'unlock_kitchen',
    title: 'Открыть общую космо-кухню',
    rewardCredits: 250,
    rewardComfort: 1
  },
  {
    id: 'reach_comfort_25',
    title: 'Довести комфорт до 25',
    rewardCredits: 2500,
    rewardComfort: 3
  },
  {
    id: 'earn_credits_10000',
    title: 'Заработать 10 000 кредитов',
    rewardCredits: 5000,
    rewardComfort: 2
  },
  {
    id: 'unlock_three_residents',
    title: 'Заселить 3 жильцов',
    rewardCredits: 10000,
    rewardComfort: 5
  },
  {
    id: 'unlock_panorama_dome',
    title: 'Открыть панорамный купол',
    rewardCredits: 250000,
    rewardComfort: 8
  },
  {
    id: 'first_renovation',
    title: 'Сделать первую реновацию орбиты',
    rewardCredits: 0,
    rewardComfort: 0
  }
];
