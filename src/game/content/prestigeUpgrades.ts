import type { PrestigeUpgradeDefinition } from '../types';

export const prestigeUpgrades: PrestigeUpgradeDefinition[] = [
  {
    id: 'warm_start_credits',
    name: 'Аварийная касса',
    description: 'Каждый новый цикл начинается со 100 копеек вместо базового старта.',
    reputationCost: 1,
    renovationTier: 1
  },
  {
    id: 'first_room_discount',
    name: 'Склад старых деталей',
    description: 'Первая покупка каждой комнаты стоит на 10% меньше.',
    reputationCost: 2,
    renovationTier: 1
  },
  {
    id: 'starting_comfort',
    name: 'Тёплый старт',
    description: 'Каждый новый цикл начинается с +5 комфорта.',
    reputationCost: 3,
    renovationTier: 1
  },
  {
    id: 'residents_survive',
    name: 'Соседи остаются',
    description: 'Жильцы не сбрасываются при реновации орбиты.',
    reputationCost: 4,
    renovationTier: 2
  },
  {
    id: 'capsule_head_start',
    name: 'Готовая капсула',
    description: 'После реновации капсула арендатора сразу получает 5 уровней.',
    reputationCost: 5,
    renovationTier: 2
  },
  {
    id: 'visitor_comfort_bonus',
    name: 'Книга отзывов',
    description: 'Принятые гости дают на 1 комфорт больше.',
    reputationCost: 5,
    renovationTier: 2
  },
  {
    id: 'reputation_income',
    name: 'Добрая слава',
    description: 'Каждая единица репутации сильнее повышает доход станции.',
    reputationCost: 8,
    renovationTier: 3
  },
  {
    id: 'offline_cap_16h',
    name: 'Дежурная автоматика',
    description: 'Лимит офлайн-дохода увеличен до 16 часов.',
    reputationCost: 10,
    renovationTier: 3
  },
  {
    id: 'maintenance_drones',
    name: 'Дворницкие дроны',
    description: 'Новые комнаты начинают цикл в лучшем состоянии.',
    reputationCost: 7,
    renovationTier: 3
  }
];
