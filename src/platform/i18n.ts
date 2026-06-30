export type Language = 'ru' | 'en';

export interface Translation {
  // Top bar
  kopeks: string;
  income: string;
  comfort: string;
  reputation: string;
  // Nav / panels
  rooms: string;
  goals: string;
  bonuses: string;
  renovation: string;
  residents: string;
  achievements: string;
  statistics: string;
  cosmetics: string;
  prestigeUpgrades: string;
  // Module list
  level: string;
  closed: string;
  nextCost: string;
  stationIncome: string;
  comfortOnOpen: string;
  nextMilestone: string;
  // Goal panel
  allGoalsDone: string;
  allGoalsDoneHint: string;
  // Bonus panel
  adBonusesHint: string;
  boost2x: string;
  vipResident: string;
  adPending: string;
  // Prestige
  renovationTitle: string;
  reputationStation: string;
  renovate: string;
  renovateTooltip: string;
  // Prestige upgrades
  residentsSurvive: string;
  residentsSurviveDesc: string;
  startingComfort: string;
  startingComfortDesc: string;
  higherOfflineCap: string;
  higherOfflineCapDesc: string;
  upgradesTitle: string;
  cost: string;
  bought: string;
  buy: string;
  // Cosmetics
  cosmeticsTitle: string;
  windowLightColor: string;
  amber: string;
  green: string;
  red: string;
  blue: string;
  // Stats
  playTime: string;
  modulesBought: string;
  renovations: string;
  totalEarned: string;
  // Dialogs
  offlineTitle: string;
  time: string;
  collect: string;
  doubleViaAd: string;
  dailyLoginTitle: string;
  day: string;
  of: string;
  dailyRewardText: string;
  visitorTitle: string;
  accept: string;
  decline: string;
  // Help
  helpTitle: string;
  helpRooms: string;
  helpRoomsBody: string;
  helpGoals: string;
  helpGoalsBody: string;
  helpBonuses: string;
  helpBonusesBody: string;
  helpRenovation: string;
  helpRenovationBody: string;
  helpStart: string;
  // Settings
  settingsTitle: string;
  resetSave: string;
  resetSaveDesc: string;
  resetProgress: string;
  confirmReset: string;
  about: string;
  aboutText: string;
  aboutStyle: string;
  aboutPlatform: string;
  aboutVersion: string;
  language: string;
  // Sound
  soundOn: string;
  soundOff: string;
  // App
  eyebrow: string;
  appTitle: string;
  loadingHint: string;
  loadingBody: string;
  howToPlay: string;
  settings: string;
  // Residents panel
  residentsTitle: string;
  residentsSettled: string;
  noResidents: string;
  settled: string;
  notSettled: string;
  // Achievements
  achievementsCount: string;
  // Common
  close: string;
  price: string;
  reward: string;
  comfortWord: string;
  russian: string;
  english: string;
  stationResources: string;
  stationView: string;
  stationSections: string;
  adSuffix: string;
  boostTooltip: string;
  vipTooltip: string;
  allMilestonesDone: string;
  dailyRewardSuffix: string;
  rewardKindComfort: string;
  rewardKindVisual: string;
  rewardKindBoost: string;
  rewardKindPrestige: string;
  rewardType: string;
  // About (replaced)
  aboutHint1: string;
  aboutHint2: string;
}

const ru: Translation = {
  kopeks: 'Копейки',
  income: 'Доход',
  comfort: 'Комфорт',
  reputation: 'Репутация',
  rooms: 'Комнаты',
  goals: 'Цели',
  bonuses: 'Бонусы',
  renovation: 'Реновация',
  residents: 'Жильцы',
  achievements: 'Достижения',
  statistics: 'Статистика',
  cosmetics: 'Косметика станции',
  prestigeUpgrades: 'Улучшения реновации',
  level: 'Уровень',
  closed: 'Закрыто',
  nextCost: 'Цена следующего',
  stationIncome: 'Текущий доход станции',
  comfortOnOpen: 'Комфорт при открытии',
  nextMilestone: 'Следующий milestone',
  allGoalsDone: 'Все ближайшие цели выполнены',
  allGoalsDoneHint: 'Продолжайте улучшать комнаты',
  adBonusesHint: 'Рекламные бонусы доступны на Yandex Games. Локально бонусы включаются сразу.',
  boost2x: 'x2 аренда',
  vipResident: 'VIP-жилец',
  adPending: 'Реклама...',
  renovationTitle: 'Реновация орбиты',
  reputationStation: 'Репутация станции',
  renovate: 'Реновировать',
  renovateTooltip: 'Реновация сбрасывает копейки и модули, но сохраняет репутацию и купленные улучшения. Награда = floor(sqrt(заработано / 100000)).',
  residentsSurvive: 'Соседи остаются',
  residentsSurviveDesc: 'Жильцы не сбрасываются при реновации орбиты.',
  startingComfort: 'Тёплый старт',
  startingComfortDesc: 'Каждый новый цикл начинается с +5 комфорта.',
  higherOfflineCap: 'Запас хода станции',
  higherOfflineCapDesc: 'Лимит офлайн-дохода увеличен с 8 до 12 часов.',
  upgradesTitle: 'Улучшения реновации',
  cost: 'Стоимость',
  bought: 'Куплено',
  buy: 'Купить',
  cosmeticsTitle: 'Косметика станции',
  windowLightColor: 'Цвет света в окнах',
  amber: 'Янтарный',
  green: 'Эмалевый',
  red: 'Сигнальный',
  blue: 'Сервисный',
  playTime: 'Время в игре',
  modulesBought: 'Куплено модулей',
  renovations: 'Реноваций',
  totalEarned: 'Заработано всего',
  offlineTitle: 'Станция поработала без вас',
  time: 'Время',
  collect: 'Забрать',
  doubleViaAd: 'Удвоить за рекламу',
  dailyLoginTitle: 'Ежедневный вход',
  day: 'День',
  of: 'из',
  dailyRewardText: 'Станция благодарит вас за возвращение. Награда:',
  visitorTitle: 'Гость станции',
  accept: 'Принять',
  decline: 'Отказать',
  helpTitle: 'Как играть',
  helpRooms: 'Комнаты',
  helpRoomsBody: 'Покупайте уровни модулей за копейки. Каждый модуль даёт доход в секунду и повышает комфорт станции. На уровнях 10, 25, 50 и 100 модуль получает множитель дохода. Кликайте по комнате — это тоже даёт копейки!',
  helpGoals: 'Цели',
  helpGoalsBody: 'Цели направляют развитие станции. Награды — комфорт, визуальные детали или временные бусты. Завершённые цели исчезают из списка.',
  helpBonuses: 'Бонусы',
  helpBonusesBody: 'На Yandex Games бонусы включаются за просмотр рекламы (x2 аренда на 5 мин, VIP-жилец на 10 мин). Локально — сразу.',
  helpRenovation: 'Реновация орбиты',
  helpRenovationBody: 'Сбрасывает копейки и модули, но сохраняет репутацию. Репутация покупает постоянные улучшения (жильцы выживают, тёплый старт, больше офлайн-лимит).',
  helpStart: 'Понятно, начать играть',
  settingsTitle: 'Настройки',
  resetSave: 'Сбросить сохранение',
  resetSaveDesc: 'Полностью стирает прогресс: копейки, модули, жильцов, достижения и репутацию. Действие необратимо.',
  resetProgress: 'Сбросить прогресс',
  confirmReset: 'Нажмите ещё раз для подтверждения',
  about: 'О игре',
  aboutText: 'Космическая коммуналка — уютная idle-игра про старую орбитальную коммуналку.',
  aboutStyle: 'Стиль: Retro Soviet Space Cozy.',
  aboutPlatform: 'Платформа: Yandex Games.',
  aboutVersion: 'Версия: 0.2.0 · Стек: Vite + React 19 + PixiJS 8 + TypeScript',
  language: 'Язык',
  soundOn: 'Включить звук',
  soundOff: 'Выключить звук',
  eyebrow: 'Retro Soviet Space Cozy',
  appTitle: 'Космическая коммуналка',
  loadingHint: 'Греем шлюзы',
  loadingBody: 'Станция готовит первый жилой модуль.',
  howToPlay: 'Как играть',
  settings: 'Настройки',
  residentsTitle: 'Жильцы',
  achievementsCount: 'Достижения',
  residentsSettled: 'заселено',
  noResidents: 'Пока жильцов нет',
  settled: 'Заселён',
  notSettled: 'Не заселён',
  close: 'Закрыть',
  price: 'Цена',
  reward: 'Награда',
  comfortWord: 'комфорт',
  russian: 'Русский',
  english: 'English',
  stationResources: 'Ресурсы станции',
  stationView: 'Визуальный вид станции',
  stationSections: 'Разделы станции',
  adSuffix: '(реклама)',
  boostTooltip: 'Удваивает доход станции на 5 минут. На Yandex Games требует просмотра рекламы.',
  vipTooltip: 'Заселяет VIP-жильца: x2 доход на 10 минут. На Yandex Games требует просмотра рекламы.',
  allMilestonesDone: 'Все milestones получены',
  dailyRewardSuffix: 'копеек',
  rewardKindComfort: 'Бонус комфорта',
  rewardKindVisual: 'Визуальная деталь',
  rewardKindBoost: 'Временный буст',
  rewardKindPrestige: 'Подсказка к реновации',
  rewardType: 'Тип награды',
  aboutHint1: 'Кликайте по комнате — каждый клик даёт копейки. Развивайте станцию, заселяйте жильцов и делайте реновацию орбиты!',
  aboutHint2: 'Спасибо за игру! Ваша обратная связь помогает делать коммуналку уютнее.'
};

const en: Translation = {
  kopeks: 'Kopeks',
  income: 'Income',
  comfort: 'Comfort',
  reputation: 'Reputation',
  rooms: 'Rooms',
  goals: 'Goals',
  bonuses: 'Bonuses',
  renovation: 'Renovation',
  residents: 'Residents',
  achievements: 'Achievements',
  statistics: 'Statistics',
  cosmetics: 'Station Cosmetics',
  prestigeUpgrades: 'Renovation Upgrades',
  level: 'Level',
  closed: 'Locked',
  nextCost: 'Next cost',
  stationIncome: 'Current station income',
  comfortOnOpen: 'Comfort on unlock',
  nextMilestone: 'Next milestone',
  allGoalsDone: 'All nearby goals completed',
  allGoalsDoneHint: 'Keep upgrading your rooms',
  adBonusesHint: 'Ad bonuses are available on Yandex Games. Locally they activate immediately.',
  boost2x: 'x2 rent',
  vipResident: 'VIP resident',
  adPending: 'Ad...',
  renovationTitle: 'Orbit Renovation',
  reputationStation: 'Station reputation',
  renovate: 'Renovate',
  renovateTooltip: 'Renovation resets kopeks and modules but keeps reputation and purchased upgrades. Reward = floor(sqrt(earned / 100000)).',
  residentsSurvive: 'Neighbors stay',
  residentsSurviveDesc: 'Residents are not reset on renovation.',
  startingComfort: 'Warm start',
  startingComfortDesc: 'Each new cycle starts with +5 comfort.',
  higherOfflineCap: 'Station range',
  higherOfflineCapDesc: 'Offline income cap increased from 8 to 12 hours.',
  upgradesTitle: 'Renovation upgrades',
  cost: 'Cost',
  bought: 'Bought',
  buy: 'Buy',
  cosmeticsTitle: 'Station cosmetics',
  windowLightColor: 'Window light color',
  amber: 'Amber',
  green: 'Enamel',
  red: 'Signal',
  blue: 'Utility',
  playTime: 'Play time',
  modulesBought: 'Modules bought',
  renovations: 'Renovations',
  totalEarned: 'Total earned',
  offlineTitle: 'The station worked without you',
  time: 'Time',
  collect: 'Collect',
  doubleViaAd: 'Double via ad',
  dailyLoginTitle: 'Daily login',
  day: 'Day',
  of: 'of',
  dailyRewardText: 'The station thanks you for returning. Reward:',
  visitorTitle: 'Station visitor',
  accept: 'Accept',
  decline: 'Decline',
  helpTitle: 'How to play',
  helpRooms: 'Rooms',
  helpRoomsBody: 'Buy module levels with kopeks. Each module gives income per second and raises station comfort. At levels 10, 25, 50 and 100 the module gets an income multiplier. Click the room — that also gives kopeks!',
  helpGoals: 'Goals',
  helpGoalsBody: 'Goals guide station development. Rewards are comfort, visual details or temporary boosts. Completed goals disappear from the list.',
  helpBonuses: 'Bonuses',
  helpBonusesBody: 'On Yandex Games bonuses require watching an ad (x2 rent for 5 min, VIP resident for 10 min). Locally they activate immediately.',
  helpRenovation: 'Orbit renovation',
  helpRenovationBody: 'Resets kopeks and modules but keeps reputation. Reputation buys permanent upgrades (residents survive, warm start, higher offline cap).',
  helpStart: 'Got it, start playing',
  settingsTitle: 'Settings',
  resetSave: 'Reset save',
  resetSaveDesc: 'Completely erases progress: kopeks, modules, residents, achievements and reputation. This cannot be undone.',
  resetProgress: 'Reset progress',
  confirmReset: 'Click again to confirm',
  about: 'About',
  aboutText: 'Cosmic Communalka — a cozy idle game about an old orbital communal apartment.',
  aboutStyle: 'Style: Retro Soviet Space Cozy.',
  aboutPlatform: 'Platform: Yandex Games.',
  aboutVersion: 'Version: 0.2.0 · Stack: Vite + React 19 + PixiJS 8 + TypeScript',
  language: 'Language',
  soundOn: 'Enable sound',
  soundOff: 'Disable sound',
  eyebrow: 'Retro Soviet Space Cozy',
  appTitle: 'Cosmic Communalka',
  loadingHint: 'Warming up the airlocks',
  loadingBody: 'The station is preparing the first living module.',
  howToPlay: 'How to play',
  settings: 'Settings',
  residentsTitle: 'Residents',
  achievementsCount: 'Achievements',
  residentsSettled: 'settled',
  noResidents: 'No residents yet',
  settled: 'Settled',
  notSettled: 'Not settled',
  close: 'Close',
  price: 'Price',
  reward: 'Reward',
  comfortWord: 'comfort',
  russian: 'Русский',
  english: 'English',
  stationResources: 'Station resources',
  stationView: 'Station visual view',
  stationSections: 'Station sections',
  adSuffix: '(ad)',
  boostTooltip: 'Doubles station income for 5 minutes. On Yandex Games requires watching an ad.',
  vipTooltip: 'Settles a VIP resident: x2 income for 10 minutes. On Yandex Games requires watching an ad.',
  allMilestonesDone: 'All milestones unlocked',
  dailyRewardSuffix: 'kopeks',
  rewardKindComfort: 'Comfort bonus',
  rewardKindVisual: 'Visual detail',
  rewardKindBoost: 'Temporary boost',
  rewardKindPrestige: 'Renovation hint',
  rewardType: 'Reward type',
  aboutHint1: 'Click the room — every click gives kopeks. Develop the station, settle residents and renovate the orbit!',
  aboutHint2: 'Thanks for playing! Your feedback helps make the communalka cozier.'
};

export const translations: Record<Language, Translation> = { ru, en };

const LANGUAGE_KEY = 'cosmic-communalka-language';

export function getDefaultLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'ru';
  }

  const stored = window.localStorage.getItem(LANGUAGE_KEY);

  if (stored === 'ru' || stored === 'en') {
    return stored;
  }

  return 'ru';
}

export function setStoredLanguage(lang: Language): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LANGUAGE_KEY, lang);
  }
}
