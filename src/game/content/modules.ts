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
    baseCost: 130,
    baseIncomePerSecond: 5,
    comfortBonus: 1,
    unlockAtCredits: 75,
    visualKey: 'warm-kitchen'
  },
  {
    id: 'oxygen_garden',
    name: 'Кислородный сад',
    role: 'Комфорт и доход',
    baseCost: 1600,
    baseIncomePerSecond: 22,
    comfortBonus: 5,
    unlockAtCredits: 1100,
    visualKey: 'green-dome'
  },
  {
    id: 'zero_g_laundry',
    name: 'Прачечная невесомости',
    role: 'Средний доход',
    baseCost: 12000,
    baseIncomePerSecond: 120,
    comfortBonus: 2,
    unlockAtCredits: 9000,
    visualKey: 'laundry-porthole'
  },
  {
    id: 'teleport_entry',
    name: 'Телепорт-прихожая',
    role: 'Поток жильцов',
    baseCost: 90000,
    baseIncomePerSecond: 650,
    comfortBonus: 4,
    unlockAtCredits: 88000,
    visualKey: 'blue-teleport'
  },
  {
    id: 'antigrav_gym',
    name: 'Антиграв-спортзал',
    role: 'Дорогой сервис',
    baseCost: 450000,
    baseIncomePerSecond: 2600,
    comfortBonus: 6,
    unlockAtCredits: 710000,
    visualKey: 'gym-ring'
  },
  {
    id: 'panorama_dome',
    name: 'Панорамный купол',
    role: 'Премиум зона',
    baseCost: 1600000,
    baseIncomePerSecond: 9000,
    comfortBonus: 10,
    unlockAtCredits: 4200000,
    visualKey: 'amber-dome'
  },
  {
    id: 'saucer_dock',
    name: 'Док для мини-тарелок',
    role: 'Транспортный узел',
    baseCost: 6000000,
    baseIncomePerSecond: 23000,
    comfortBonus: 12,
    unlockAtCredits: 25000000,
    visualKey: 'saucer-dock'
  },
  {
    id: 'radiator_balcony',
    name: 'Радиаторный балкон',
    role: 'Тепло и комфорт',
    baseCost: 18000000,
    baseIncomePerSecond: 60000,
    comfortBonus: 15,
    unlockAtCredits: 200000000,
    visualKey: 'radiator-balcony'
  },
  {
    id: 'mail_tube_office',
    name: 'Почтовая труба-контора',
    role: 'Пневмопочта станции',
    baseCost: 50000000,
    baseIncomePerSecond: 150000,
    comfortBonus: 8,
    unlockAtCredits: 350000000,
    visualKey: 'mail-tube'
  },
  {
    id: 'meteorite_pantry',
    name: 'Метеоритная кладовая',
    role: 'Запасы и офлайн-доход',
    baseCost: 150000000,
    baseIncomePerSecond: 400000,
    comfortBonus: 10,
    unlockAtCredits: 900000000,
    visualKey: 'meteorite-pantry'
  },
  {
    id: 'shared_observatory',
    name: 'Общая обсерватория',
    role: 'Репутация и звёзды',
    baseCost: 400000000,
    baseIncomePerSecond: 1000000,
    comfortBonus: 12,
    unlockAtCredits: 1600000000,
    visualKey: 'observatory-dome'
  },
  {
    id: 'comet_water_tank',
    name: 'Кометный водяной бак',
    role: 'Комфорт и сервис',
    baseCost: 1000000000,
    baseIncomePerSecond: 3000000,
    comfortBonus: 15,
    unlockAtCredits: 3000000000,
    visualKey: 'comet-tank'
  },
  {
    id: 'orbital_library',
    name: 'Орбитальная библиотека',
    role: 'Престиж и тишина',
    baseCost: 2500000000,
    baseIncomePerSecond: 8000000,
    comfortBonus: 20,
    unlockAtCredits: 7500000000,
    visualKey: 'orbital-library'
  }
];
