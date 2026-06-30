import type { ModuleDefinition } from '../types';

export const modules: ModuleDefinition[] = [
  {
    id: 'tenant_capsule',
    name: 'Капсула арендатора',
    role: 'Первый генератор',
    baseCost: 15,
    baseIncomePerSecond: 1,
    comfortBonus: 0,
    unlockAtCredits: 0,
    visualKey: 'capsule-room'
  },
  {
    id: 'cosmo_kitchen',
    name: 'Общая космо-кухня',
    role: 'Ранний сервис',
    baseCost: 100,
    baseIncomePerSecond: 6,
    comfortBonus: 1,
    unlockAtCredits: 60,
    visualKey: 'warm-kitchen'
  },
  {
    id: 'oxygen_garden',
    name: 'Кислородный сад',
    role: 'Комфорт и доход',
    baseCost: 650,
    baseIncomePerSecond: 30,
    comfortBonus: 5,
    unlockAtCredits: 400,
    visualKey: 'green-dome'
  },
  {
    id: 'zero_g_laundry',
    name: 'Прачечная невесомости',
    role: 'Средний доход',
    baseCost: 4000,
    baseIncomePerSecond: 140,
    comfortBonus: 2,
    unlockAtCredits: 2500,
    visualKey: 'laundry-porthole'
  },
  {
    id: 'teleport_entry',
    name: 'Телепорт-прихожая',
    role: 'Поток жильцов',
    baseCost: 25000,
    baseIncomePerSecond: 650,
    comfortBonus: 4,
    unlockAtCredits: 16000,
    visualKey: 'blue-teleport'
  },
  {
    id: 'antigrav_gym',
    name: 'Антиграв-спортзал',
    role: 'Дорогой сервис',
    baseCost: 150000,
    baseIncomePerSecond: 3000,
    comfortBonus: 6,
    unlockAtCredits: 95000,
    visualKey: 'gym-ring'
  },
  {
    id: 'panorama_dome',
    name: 'Панорамный купол',
    role: 'Премиум зона',
    baseCost: 1000000,
    baseIncomePerSecond: 14000,
    comfortBonus: 10,
    unlockAtCredits: 650000,
    visualKey: 'amber-dome'
  },
  {
    id: 'saucer_dock',
    name: 'Док для мини-тарелок',
    role: 'Поздний MVP',
    baseCost: 7500000,
    baseIncomePerSecond: 70000,
    comfortBonus: 12,
    unlockAtCredits: 5000000,
    visualKey: 'saucer-dock'
  }
];
