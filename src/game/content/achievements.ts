import type { AchievementDefinition } from '../types';

export const achievements: AchievementDefinition[] = [
  {
    id: 'first_purchase',
    title: 'Первый жилец',
    description: 'Купить первый уровень любого модуля.'
  },
  {
    id: 'ten_module_levels',
    title: 'Маленькая станция',
    description: 'Суммарно 10 уровней модулей.'
  },
  {
    id: 'fifty_module_levels',
    title: 'Растущая коммуналка',
    description: 'Суммарно 50 уровней модулей.'
  },
  {
    id: 'first_prestige',
    title: 'Первая реновация',
    description: 'Сделать первую реновацию орбиты.'
  },
  {
    id: 'comfort_50',
    title: 'Уютно как дома',
    description: 'Достичь 50 комфорта.'
  },
  {
    id: 'credits_million',
    title: 'Миллионер орбиты',
    description: 'Заработать 1 000 000 кредитов суммарно.'
  },
  {
    id: 'all_rooms_unlocked',
    title: 'Вся коммуналка',
    description: 'Открыть все модули станции.'
  },
  {
    id: 'daily_streak_7',
    title: 'Неделя подряд',
    description: 'Заходить 7 дней подряд.'
  }
];
