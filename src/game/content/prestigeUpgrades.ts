import type { PrestigeUpgradeDefinition } from '../types';

export const prestigeUpgrades: PrestigeUpgradeDefinition[] = [
  {
    id: 'residents_survive',
    name: 'Соседи остаются',
    description: 'Жильцы не сбрасываются при реновации орбиты.',
    reputationCost: 2
  },
  {
    id: 'starting_comfort',
    name: 'Тёплый старт',
    description: 'Каждый новый цикл начинается с +5 комфорта.',
    reputationCost: 3
  },
  {
    id: 'higher_offline_cap',
    name: 'Запас хода станции',
    description: 'Лимит офлайн-дохода увеличен с 8 до 12 часов.',
    reputationCost: 4
  }
];
