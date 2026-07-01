import type { GoalDefinition } from '../types';

export const goals: GoalDefinition[] = [
  {
    id: 'buy_capsule_10',
    title: 'Поднять капсулу до 10 уровня',
    rewardComfort: 1,
    rewardKind: 'visual_detail',
    rewardLabel: '+1 комфорт, новые детали капсулы'
  },
  {
    id: 'unlock_kitchen',
    title: 'Открыть общую космо-кухню',
    rewardComfort: 1,
    rewardKind: 'visual_detail',
    rewardLabel: '+1 комфорт, кухонные детали'
  },
  {
    id: 'reach_comfort_25',
    title: 'Довести комфорт до 25',
    rewardComfort: 3,
    rewardKind: 'temporary_boost',
    rewardLabel: '+3 комфорт, теплый режим станции'
  },
  {
    id: 'earn_credits_10000',
    title: 'Заработать 10 000 копеек',
    rewardComfort: 2,
    rewardKind: 'prestige_hint',
    rewardLabel: '+2 комфорт, подсказка к реновации'
  },
  {
    id: 'unlock_three_residents',
    title: 'Заселить 3 жильцов',
    rewardComfort: 5,
    rewardKind: 'visual_detail',
    rewardLabel: '+5 комфорт, жильцы в комнатах'
  },
  {
    id: 'unlock_panorama_dome',
    title: 'Открыть панорамный купол',
    rewardComfort: 8,
    rewardKind: 'visual_detail',
    rewardLabel: '+8 комфорт, детали купола'
  },
  {
    id: 'first_renovation',
    title: 'Сделать первую реновацию орбиты',
    rewardComfort: 0,
    rewardKind: 'prestige_hint',
    rewardLabel: 'Реновация отмечена'
  }
];
