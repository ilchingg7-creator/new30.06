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
  // Station Director
  currentTask: string;
  taskVisitorTitle: string;
  taskVisitorBody: string;
  taskDailyTitle: string;
  taskDailyBody: string;
  taskCommunalDutyClaimTitle: string;
  taskCommunalDutyClaimBody: string;
  taskCommunalDutyAssignTitle: string;
  taskCommunalDutyAssignBody: string;
  taskGoalTitle: string;
  taskGoalBody: string;
  taskModuleBuyTitle: string;
  taskModuleBuyBody: string;
  taskModuleWaitTitle: string;
  taskModuleWaitBody: string;
  taskModuleUnlockTitle: string;
  taskModuleUnlockBody: string;
  taskPrestigeTitle: string;
  taskPrestigeBody: string;
  taskSelectRoom: string;
  taskRenovate: string;
  taskCost: string;
  taskWait: string;
  taskProgress: string;
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
  strangeCatOfferTitle: string;
  strangeCatOfferBody: string;
  buyStrangeCat: string;
  strangeCatPurchasing: string;
  strangeCatOwned: string;
  strangeCatUnavailable: string;
  strangeCatPurchaseError: string;
  portalCurrency: string;
  vipCooldown: string;
  adPending: string;
  // Prestige
  renovationTitle: string;
  reputationStation: string;
  renovationRequirements: string;
  renovationRequirementReward: string;
  renovationRequirementStation0: string;
  renovationRequirementStation1: string;
  renovationRequirementStation2: string;
  renovationRequirementStation3: string;
  renovationCycleLabel: string;
  celebrationTitle: string;
  celebrationCycle: string;
  celebrationReputation: string;
  celebrationDismiss: string;
  saveSaving: string;
  saveSaved: string;
  errorBoundaryTitle: string;
  errorBoundaryBody: string;
  errorBoundaryReload: string;
  renovationRequirementGoals: string;
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
  renovationChoicesLeft: string;
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
  incomeBreakdownTitle: string;
  incomeBreakdownHint: string;
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
  // Onboarding tour
  tourTitle: string;
  tourStepStation: string;
  tourStepStationBody: string;
  tourStepModules: string;
  tourStepModulesBody: string;
  tourStepGoals: string;
  tourStepGoalsBody: string;
  tourStepBonuses: string;
  tourStepBonusesBody: string;
  tourStepStats: string;
  tourStepStatsBody: string;
  tourNext: string;
  tourPrev: string;
  tourSkip: string;
  tourDone: string;
  tourStep: string;
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
  residentRoleIncome: string;
  residentRoleComfort: string;
  residentRoleMaintenance: string;
  residentRoleVisitor: string;
  residentRoleRenovation: string;
  previewTags: string;
  previewTagIncome: string;
  previewTagComfort: string;
  previewTagCondition: string;
  previewTagResident: string;
  previewTagRole: string;
  previewTagVisual: string;
  previewTagRenovation: string;
  previewTagTimedBonus: string;
  previewTagCost: string;
  // Action previews (titles, reasons, results rendered in ActionPreviewLine)
  actionPreviews: {
    incomeRateSuffix: string;
    comfortDelta: string;
    conditionDelta: string;
    timedBoost: string;
    visualDetail: string;
    stationStabilized: string;
    journalMemory: string;
    unknownRoom: string;
    noPreview: string;
    roomLocked: string;
    roomLockedReason: string;
    unlocksAt: string;
    roomComfort: string;
    openRoom: string;
    upgradeRoom: string;
    firstRoomReason: string;
    upgradeReason: string;
    purchaseResult: string;
    dutyCannot: string;
    chooseResident: string;
    expectedDuty: string;
    roleMatches: string;
    roleResident: string;
    eligibleResident: string;
    roleSolution: string;
    choiceResult: string;
    roleUnlocks: string;
    alwaysAvailable: string;
    renovationReady: string;
    prepareRenovation: string;
    renovationReason: string;
    renovationGain: string;
    renovationBuild: string;
    dutyResult: string;
    dutyCompleted: string;
  };
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
  feedbackEmail: string;
  // Station incidents
  incidentJournalTitle: string;
  incidentJournalNew: string;
  incidentJournalEmpty: string;
  incidentJournalCompleted: string;
  incidentVisualReward: string;
  incidents: Record<string, {
    title: string;
    body: string;
    choices: Record<string, { label: string; description: string }>;
  }>;
  // Resident stories
  storyTitle: string;
  storyProgress: string;
  storyReward: string;
  storyComplete: string;
  storyGotoRoom: string;
  stories: Record<string, { title: string; request: string; complete: string }>;
  // Room condition
  conditionTitle: string;
  conditionPristine: string;
  conditionWorking: string;
  conditionWorn: string;
  conditionBroken: string;
  conditionHint: string;
  // Weekly repair event
  weeklyRepairTitle: string;
  weeklyRepairDays: string;
  weeklyRepairHours: string;
  weeklyRepairExpired: string;
  weeklyRepairRoom: string;
  weeklyRepairLevels: string;
  weeklyRepairCondition: string;
  weeklyRepairClaimBonus: string;
  weeklyRepairBonusClaimed: string;
  // Leaderboard
  leaderboardTitle: string;
  leaderboardYourScore: string;
  leaderboardAnonymous: string;
  leaderboardEmpty: string;
  // Daily reward labels
  dailyConditionRepair: string;
  dailyTimedBonus: string;
  // Communal duties
  communalDutyTitle: string;
  communalDutyAssign: string;
  communalDutyInProgress: string;
  communalDutyReady: string;
  communalDutyClaim: string;
  communalDutyBestMatch: string;
  communalDutyNoResidents: string;
  communalDuties: Record<string, {
    title: string;
    request: string;
    resultBest: string;
    resultAlternate: string;
  }>;
  // Format helpers
  perSecond: string;
  // Short unit suffixes for duration/rate formatting (i18n-driven).
  hoursShort: string;
  minutesShort: string;
  secondsShort: string;
  // Game content (modules, residents, goals, achievements, prestige
  // upgrades, visitors). Keys are the id fields from src/game/content/*;
  // visitor keys are the `template` field set in src/game/visitors.ts.
  content: {
    modules: Record<string, { name: string; role: string }>;
    residents: Record<string, { name: string; unlockText: string; bonusText: string; bio: string }>;
    goals: Record<string, { title: string; rewardLabel: string }>;
    achievements: Record<string, { title: string; description: string }>;
    prestigeUpgrades: Record<string, { name: string; description: string }>;
    visitors: Record<string, { name: string; flavor: string }>;
  };
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
  currentTask: 'Текущая задача',
  taskVisitorTitle: 'Принять гостя станции',
  taskVisitorBody: 'Гость даст комфорт, если сейчас его принять.',
  taskDailyTitle: 'Забрать ежедневную награду',
  taskDailyBody: 'Это быстрый старт для следующей покупки.',
  taskCommunalDutyClaimTitle: 'Забрать результат дежурства',
  taskCommunalDutyClaimBody: 'Жилец уже помог станции. Заберите итог и ремонт комнаты.',
  taskCommunalDutyAssignTitle: 'Назначить дежурство',
  taskCommunalDutyAssignBody: 'Комнате нужна маленькая услуга. Выберите жильца, который справится.',
  taskGoalTitle: 'Дожать близкую цель',
  taskGoalBody: 'Цель уже почти готова, и она поможет станции расти.',
  taskModuleBuyTitle: 'Купить улучшение комнаты',
  taskModuleBuyBody: 'Это самый полезный шаг для роста дохода.',
  taskModuleWaitTitle: 'Накопить на следующее улучшение',
  taskModuleWaitBody: 'Доход уже идет, осталось дождаться покупки.',
  taskModuleUnlockTitle: 'Открыть следующую комнату',
  taskModuleUnlockBody: 'Комната станет доступна после достаточного общего заработка.',
  taskPrestigeTitle: 'Подготовить реновацию',
  taskPrestigeBody: 'Реновация даст репутацию и усилит следующий цикл.',
  taskSelectRoom: 'Показать комнату',
  taskRenovate: 'К реновации',
  taskCost: 'Цена',
  taskWait: 'Ждать',
  taskProgress: 'Прогресс',
  level: 'Уровень',
  closed: 'Закрыто',
  nextCost: 'Цена следующего',
  stationIncome: 'Текущий доход станции',
  comfortOnOpen: 'Комфорт при открытии',
  nextMilestone: 'Следующий рубеж',
  allGoalsDone: 'Все ближайшие цели выполнены',
  allGoalsDoneHint: 'Продолжайте улучшать комнаты',
  adBonusesHint: 'Рекламные бонусы доступны на Yandex Games. Локально бонусы включаются сразу.',
  boost2x: 'x2 аренда',
  vipResident: 'VIP-жилец',
  strangeCatOfferTitle: 'Поселить странного кота',
  strangeCatOfferBody: 'Постоянная покупка: кот навсегда поселится в жилой капсуле.',
  buyStrangeCat: 'Купить странного кота',
  strangeCatPurchasing: 'Покупка обрабатывается…',
  strangeCatOwned: 'Кот поселён',
  strangeCatUnavailable: 'Покупка временно недоступна',
  strangeCatPurchaseError: 'Покупка не завершена. Можно попробовать снова.',
  portalCurrency: 'Валюта портала',
  vipCooldown: 'VIP завтра',
  adPending: 'Реклама...',
  renovationTitle: 'Реновация орбиты',
  reputationStation: 'Репутация станции',
  renovationRequirements: 'Условия реновации',
  renovationRequirementReward: 'Накопить награду реновации +1 репутация',
  renovationRequirementStation0: 'Капсула 10+ и открытая кухня',
  renovationRequirementStation1: 'Капсула 25+ и открытая прачечная',
  renovationRequirementStation2: 'Открыть телепорт и заселить 5 жильцов',
  renovationRequirementStation3: 'Открыть библиотеку и достичь 70 комфорта',
  renovationCycleLabel: 'Цикл реновации',
  celebrationTitle: 'Реновация завершена!',
  celebrationCycle: 'Цикл {cycle}',
  celebrationReputation: '+{amount} репутации',
  celebrationDismiss: 'Продолжить',
  saveSaving: 'Сохранение…',
  saveSaved: 'Сохранено',
  errorBoundaryTitle: 'Станция дала сбой',
  errorBoundaryBody: 'Что-то пошло не так. Сохранение не пострадало — перезагрузите страницу, чтобы продолжить.',
  errorBoundaryReload: 'Перезагрузить',
  renovationRequirementGoals: 'Выполнить цели цикла',
  renovate: 'Реновировать',
  renovateTooltip: 'Реновация сбрасывает копейки и модули, но сохраняет репутацию и купленные улучшения. Награда = floor(sqrt(заработано / 100000)).',
  residentsSurvive: 'Соседи остаются',
  residentsSurviveDesc: 'Жильцы не сбрасываются при реновации орбиты.',
  startingComfort: 'Тёплый старт',
  startingComfortDesc: 'Каждый новый цикл начинается с +5 комфорта.',
  higherOfflineCap: 'Запас хода станции',
  higherOfflineCapDesc: 'Лимит офлайн-дохода увеличен с 8 до 12 часов.',
  upgradesTitle: 'Улучшения реновации',
  renovationChoicesLeft: 'Выборов реновации осталось',
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
  incomeBreakdownTitle: 'Источники дохода',
  incomeBreakdownHint: 'Топ комнат по вкладу в доход станции',
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
  tourTitle: 'Экскурсия по станции',
  tourStepStation: 'Ваша станция',
  tourStepStationBody: 'Это вид станции. Кликайте по комнате, чтобы получить немного копеек. Странного кота можно навсегда поселить через раздел «Бонусы».',
  tourStepModules: 'Комнаты станции',
  tourStepModulesBody: 'Покупайте уровни модулей за копейки. Каждый модуль даёт доход в секунду. На уровнях 10, 25, 50 и 100 модуль получает множитель дохода.',
  tourStepGoals: 'Цели',
  tourStepGoalsBody: 'Цели направляют развитие. За выполнение дают комфорт, визуальные детали или временные бусты. Завершённые цели исчезают из списка.',
  tourStepBonuses: 'Бонусы',
  tourStepBonusesBody: 'На Yandex Games бонусы включаются за рекламу (x2 аренда, VIP-жилец). Локально — сразу. Есть и ежедневные награды за заход.',
  tourStepStats: 'Ресурсы станции',
  tourStepStatsBody: 'Копейки, комфорт, репутация и доход в секунду — ваши главные показатели. Комфорт умножает доход, репутация усиливает его после реновации.',
  tourNext: 'Дальше',
  tourPrev: 'Назад',
  tourSkip: 'Пропустить',
  tourDone: 'Поехали!',
  tourStep: 'Шаг',
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
  residentRoleIncome: 'доход',
  residentRoleComfort: 'комфорт',
  residentRoleMaintenance: 'ремонт',
  residentRoleVisitor: 'гость',
  residentRoleRenovation: 'реновация',
  previewTags: 'Теги результата',
  previewTagIncome: 'доход',
  previewTagComfort: 'комфорт',
  previewTagCondition: 'состояние',
  previewTagResident: 'жилец',
  previewTagRole: 'роль',
  previewTagVisual: 'деталь',
  previewTagRenovation: 'реновация',
  previewTagTimedBonus: 'буст',
  previewTagCost: 'цена',
  actionPreviews: {
    incomeRateSuffix: '/сек',
    comfortDelta: 'комфорт',
    conditionDelta: 'состояние',
    timedBoost: 'временный буст дохода',
    visualDetail: 'визуальная деталь',
    stationStabilized: 'станция стабилизирована',
    journalMemory: 'запись в журнале',
    unknownRoom: 'Неизвестная комната',
    noPreview: 'Предпросмотр недоступен',
    roomLocked: '{name} — закрыто',
    roomLockedReason: 'Заработайте больше копеек, чтобы открыть эту комнату.',
    unlocksAt: 'Откроется при {amount} суммарно заработанных',
    roomComfort: ', +{amount} комфорт',
    openRoom: 'Открыть {name}',
    upgradeRoom: 'Улучшить {name}',
    firstRoomReason: 'Создаёт первую рабочую комнату в этой зоне станции.',
    upgradeReason: 'Повышает уровень комнаты и приближает к следующему рубежу.',
    purchaseResult: 'Стоит {cost}, даёт {income}{comfort}',
    dutyCannot: 'Жилец не может взять это дежурство',
    chooseResident: 'Выберите подходящего жильца.',
    expectedDuty: 'Ожидаемый результат дежурства',
    roleMatches: 'Роль «{role}» подходит для этого дежурства.',
    roleResident: 'Жилец',
    eligibleResident: 'Подходящий жилец может выполнить это дежурство.',
    roleSolution: 'Ролевое решение',
    choiceResult: 'Результат выбора',
    roleUnlocks: 'Роль «{role}» открывает этот вариант.',
    alwaysAvailable: 'Всегда доступный ответ на инцидент.',
    renovationReady: 'Реновация готова',
    prepareRenovation: 'Готовьте реновацию',
    renovationReason: 'Реновация сбрасывает комнаты и копейки, но репутация и купленные улучшения остаются.',
    renovationGain: '+{reward} репутации и {choices} вариантов улучшений',
    renovationBuild: 'Прокачивайте станцию к +{reward} репутации',
    dutyResult: 'Результат дежурства',
    dutyCompleted: 'Дежурство на станции завершено'
  },
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
  allMilestonesDone: 'Все рубежи получены',
  dailyRewardSuffix: 'копеек',
  rewardKindComfort: 'Бонус комфорта',
  rewardKindVisual: 'Визуальная деталь',
  rewardKindBoost: 'Временный буст',
  rewardKindPrestige: 'Подсказка к реновации',
  rewardType: 'Тип награды',
  aboutHint1: 'Кликайте по комнате — каждый клик даёт копейки. Развивайте станцию, заселяйте жильцов и делайте реновацию орбиты!',
  aboutHint2: 'Спасибо за игру! Ваша обратная связь помогает делать коммуналку уютнее.',
  feedbackEmail: 'seme4kak@yandex.ru',
  incidentJournalTitle: 'Журнал происшествий',
  incidentJournalNew: 'Новые',
  incidentJournalEmpty: 'На станции тихо. Подозрительно тихо.',
  incidentJournalCompleted: 'Решено',
  incidentVisualReward: 'Визуальная деталь',
  incidents: {
    kitchen_borscht_fog: {
      title: 'В кухне завёлся борщевой туман',
      body: 'Туман пахнет обедом и слегка спорит с вентиляцией.',
      choices: {
        make_borscht_tradition: { label: 'Борщевая традиция', description: '+комфорт, визуальная деталь' },
        vent_fog: { label: 'Проветрить через шлюз', description: '+состояние кухни, деталь тумана' },
        keep_aroma: { label: 'Оставить для аромата', description: '+комфорт' }
      }
    },
    capsule_snore_echo: {
      title: 'Капсула поймала храп эхом',
      body: 'Сонный инженер уверяет, что это не он, а акустика.',
      choices: {
        install_padding: { label: 'Поставить мягкие панели', description: '-копейки, +состояние капсулы, деталь' },
        quiet_hours: { label: 'Объявить тихий час', description: '+комфорт' }
      }
    },
    laundry_sock_orbit: {
      title: 'Носки вышли на орбиту',
      body: 'Прачечная выглядит как маленькая планетная система.',
      choices: {
        catch_socks: { label: 'Поймать носки сачком', description: '+комфорт, деталь' },
        ask_sock_master: { label: 'Позвать мастера носков', description: '+состояние прачечной' }
      }
    },
    garden_first_sprout_vote: {
      title: 'Первый росток требует имени',
      body: 'Жильцы спорят, можно ли назвать растение Борисом.',
      choices: {
        name_sprout: { label: 'Устроить голосование', description: '+комфорт' },
        build_lamp: { label: 'Поставить лампу роста', description: '+состояние сада, деталь' }
      }
    },
    teleport_wrong_parcel: {
      title: 'Телепорт принёс чужую посылку',
      body: 'На коробке написано: "Если это не вам, значит почти вам".',
      choices: {
        courier_protocol: { label: 'Курьерский протокол', description: '+комфорт, визуальная деталь' },
        return_parcel: { label: 'Вернуть отправителю', description: '+комфорт, деталь' },
        open_parcel: { label: 'Открыть осторожно', description: '+копейки' }
      }
    },
    renovation_cold_floor: {
      title: 'После реновации пол снова холодный',
      body: 'Станция новая, а тапочки опять улетели.',
      choices: {
        insulate_floor: { label: 'Утеплить капсулу', description: '+комфорт, деталь' },
        save_materials: { label: 'Сохранить материалы', description: '+копейки' }
      }
    },
    condition_warning_light: {
      title: 'Лампочка тревоги моргает слишком уверенно',
      body: 'Никто не помнит, что она означает, но все ходят тише.',
      choices: {
        maintenance_shortcut: { label: 'Ремонтный лайфхак', description: '+состояние, визуальная деталь' },
        repair_now: { label: 'Починить сейчас', description: '-копейки, +состояние, деталь' },
        label_switch: { label: 'Подписать выключатель', description: '+комфорт' }
      }
    },
    cat_found_warm_pipe: {
      title: 'Странный кот нашёл тёплую трубу',
      body: 'Кот делает вид, что это его инженерное решение.',
      choices: {
        cozy_cat_corner: { label: 'Уютный кошачий угол', description: '+комфорт, визуальная деталь' },
        leave_saucer: { label: 'Оставить блюдце', description: '+комфорт, деталь' },
        mark_pipe: { label: 'Пометить трубу как важную', description: '+состояние капсулы' }
      }
    },
    kitchen_garden_soup: {
      title: 'Кухня и сад изобрели суп',
      body: 'Никто не уверен, кто начал, но пахнет убедительно.',
      choices: {
        communal_soup: { label: 'Сварить общий суп', description: '+комфорт, деталь' },
        sell_recipe: { label: 'Продать рецепт соседям', description: '+копейки' }
      }
    },
    high_income_low_comfort_meeting: {
      title: 'Доход растёт, а чайник грустит',
      body: 'Жильцы намекают, что станция стала эффективной, но не уютной.',
      choices: {
        tea_council: { label: 'Чайный совет', description: '+комфорт' },
        fund_tea_break: { label: 'Профинансировать чай', description: '-копейки, +комфорт' },
        take_minutes: { label: 'Записать протокол', description: 'память журнала' }
      }
    },
    capsule_window_frost: {
      title: 'На окне капсулы появился иней',
      body: 'Узор красивый, но жильцы начинают видеть своё дыхание во сне.',
      choices: {
        wipe_window: { label: 'Протереть окно тряпкой', description: '+комфорт, деталь' },
        seal_frame: { label: 'Заделать раму уплотнителем', description: '+состояние капсулы' }
      }
    },
    kitchen_spoon_union: {
      title: 'На кухне организовался союз ложек',
      body: 'Ложки объединились с половниками и требуют отдельной полки.',
      choices: {
        approve_union: { label: 'Признать союз ложек', description: '+комфорт, деталь' },
        organize_drawer: { label: 'Разложить по ящикам', description: '+состояние кухни' }
      }
    },
    garden_plant_listens_radio: {
      title: 'Растение в саду слушает радио',
      body: 'Кто-то оставил приёмник у горшка, и росток явно качается в такт.',
      choices: {
        keep_radio: { label: 'Оставить радио у растения', description: '+комфорт, деталь' },
        tune_signal: { label: 'Настроить сигнал тише', description: '+состояние сада' }
      }
    },
    laundry_static_storm: {
      title: 'В прачечной началась статическая буря',
      body: 'Носки потрескивают и притягивают мелкие предметы.',
      choices: {
        ground_socks: { label: 'Заземлить носки', description: '+состояние прачечной' },
        name_constellation: { label: 'Назвать созвездие носков', description: '+комфорт, деталь' }
      }
    },
    teleport_neighbor_duplicate: {
      title: 'Телепорт дублировал кружку соседа',
      body: 'Теперь у вас две одинаковые кружки, и сосед об этом ещё не знает.',
      choices: {
        return_mug: { label: 'Вернуть лишнюю кружку', description: '+состояние телепорта' },
        display_mug: { label: 'Поставить кружку на полку', description: '+комфорт, деталь' }
      }
    },
    panorama_star_argument: {
      title: 'Жильцы спорят о названиях звёзд',
      body: 'У купола собралась толпа — каждый уверен, что знает «правильное» имя для каждой звезды.',
      choices: {
        vote_names: { label: 'Устроить голосование за имена', description: '+комфорт, деталь' },
        use_catalogue: { label: 'Открыть звёздный каталог', description: '+состояние купола' }
      }
    },
    maintenance_drones_form_committee: {
      title: 'Дроны-дворники создали комитет',
      body: 'Дроны перестали убирать и начали обсуждать график смен. Доход падает, а комфорт просит внимания.',
      choices: {
        ratify_committee: { label: 'Утвердить комитет дронов', description: '+комфорт, деталь' },
        assign_shifts: { label: 'Назначить смены вручную', description: '+состояние капсулы и кухни' }
      }
    },
    cat_sleeps_on_button: {
      title: 'Кот уснул на важной кнопке',
      body: 'Странная кошка нашла единственную тёплую кнопку на панели и отказывается уходить. Капсула страдает.',
      choices: {
        relocate_cat: { label: 'Перенести кота на диван', description: '+комфорт, деталь' },
        label_button: { label: 'Подписать кнопку «не спать»', description: '+состояние капсулы' }
      }
    },
    retired_cosmonaut_mug_missing: {
      title: 'Эмалированная кружка космонавта пропала',
      body: 'Сосед-отставной космонавт обыскал всю капсулу — кружки нигде нет. Говорит, что без неё «не та станция».',
      choices: {
        search_capsule: { label: 'Обыскать капсулу вместе', description: '+комфорт, деталь' },
        buy_new_mug: { label: 'Купить новую кружку', description: '-копейки, +комфорт' }
      }
    },
    mist_cook_recipe_too_large: {
      title: 'Рецепт повара не помещается на кухне',
      body: 'Суп из туманных водорослей требует 47 шагов. Повар с туманной планеты утверждает, что короче никак.',
      choices: {
        copy_recipe: { label: 'Переписать рецепт на пергамент', description: '+комфорт, деталь' },
        simplify_recipe: { label: 'Упростить до 12 шагов', description: '+состояние кухни' }
      }
    },
    vacuum_gardener_seed_escape: {
      title: 'Семена садовника вырвались на свободу',
      body: 'Коллекция семян с разных планет вылетела в коридор. Садовник вакуума в панике ловит их в невесомости.',
      choices: {
        catch_seeds: { label: 'Помочь поймать семена', description: '+комфорт, деталь' },
        let_them_grow: { label: 'Дать им прорасти в коридоре', description: '+состояние сада' }
      }
    }
  },
  storyTitle: 'Просьба жильца',
  storyProgress: 'Прогресс',
  storyReward: 'Награда',
  storyComplete: 'История завершена!',
  storyGotoRoom: 'Перейти к комнате',
  stories: {
    engineer_quiet_capsule: {
      title: 'Сонный инженер просит тишины',
      request: '«Соседи слишком шумят. Поднимите капсулу до 15 уровня — поставлю звукоизоляцию.»',
      complete: 'Сонный инженер доволен тишиной. +2 комфорта!'
    },
    cook_working_kitchen: {
      title: 'Повару нужна рабочая кухня',
      request: '«Плита еле греет. Космо-кухня 20 уровня — и я накормлю всю станцию.»',
      complete: 'Повар с туманной планеты счастлив. +3 комфорта!'
    },
    gardener_first_plant: {
      title: 'Садовник ждёт первого ростка',
      request: '«Мои семена не прорастут без хорошего сада. Кислородный сад до 10 уровня, пожалуйста.»',
      complete: 'Первый росток выжил! Садовник вакуума улыбается. +3 комфорта!'
    },
    sock_master_laundry_upgrade: {
      title: 'Мастер носков требует порядок',
      request: '«Носки летают повсюду! Прачечная 25 уровня — и я наведу порядок.»',
      complete: 'Все носки пойманы. Мастер носков гордится. +5 комфорта!'
    },
    courier_teleport_traffic: {
      title: 'Курьеру нужен поток',
      request: '«Телеппорт еле работает. 15 уровень — и посылки полетят сами!»',
      complete: 'Телепорт гудит от потока. Курьер доволен. +4 комфорта!'
    },
    cosmonaut_warm_start: {
      title: 'Сосед-космонавт просит тепла',
      request: '«После реновации тут холодно. Поднимите капсулу до 10 уровня — и я согреюсь.»',
      complete: 'Сосед-отставной космонавт отогрелся. +3 комфорта!'
    }
  },
  conditionTitle: 'Состояние комнаты',
  conditionPristine: 'Идеальное',
  conditionWorking: 'Рабочее',
  conditionWorn: 'Изношенное',
  conditionBroken: 'Сломано',
  conditionHint: 'Назначьте дежурство жильцу, чтобы починить комнату.',
  weeklyRepairTitle: 'Еженедельный ремонт',
  weeklyRepairDays: 'д',
  weeklyRepairHours: 'ч',
  weeklyRepairExpired: 'Истекло',
  weeklyRepairRoom: 'Починить {room} до {target} состояния',
  weeklyRepairLevels: 'Купить {target} уровней для {room}',
  weeklyRepairCondition: 'Довести {room} до {target} состояния',
  weeklyRepairClaimBonus: 'Забрать бонус',
  weeklyRepairBonusClaimed: 'Бонус получен!',
  leaderboardTitle: 'Таблица лидеров',
  leaderboardYourScore: 'Ваш счёт',
  leaderboardAnonymous: 'Аноним',
  leaderboardEmpty: 'Пока нет записей. Играйте, чтобы попасть в таблицу!',
  dailyConditionRepair: 'состояние всем комнатам',
  dailyTimedBonus: 'доход',
  communalDutyTitle: 'Дежурство',
  communalDutyAssign: 'Назначить',
  communalDutyInProgress: 'Жилец на дежурстве',
  communalDutyReady: 'Дежурство завершено',
  communalDutyClaim: 'Забрать результат',
  communalDutyBestMatch: 'Лучший выбор',
  communalDutyNoResidents: 'Пока нет подходящих жильцов',
  communalDuties: {
    capsule_quiet_hours: {
      title: 'Тихий час в капсуле',
      request: 'Лампа в капсуле гудит как старый радиоприемник. Кто-то должен ее успокоить.',
      resultBest: 'В капсуле снова тихо и тепло.',
      resultAlternate: 'Капсула стала спокойнее, хотя все еще имеет мнение.'
    },
    kitchen_soup_escape: {
      title: 'Суп ушел в невесомость',
      request: 'Кухонный суп кружит под потолком и явно гордится собой.',
      resultBest: 'Суп вернулся в кастрюлю с достоинством.',
      resultAlternate: 'С супом договорились, и он приблизился к столу.'
    },
    garden_vacuum_sprout: {
      title: 'Проверка вакуумного ростка',
      request: 'Маленький росток требует орбитального уважения.',
      resultBest: 'Росток официально принят в состав станции.',
      resultAlternate: 'Росток согласился на компромисс.'
    },
    laundry_sock_orbit: {
      title: 'Уборка носочной орбиты',
      request: 'Носки из прачечной образовали маленькую независимую орбиту.',
      resultBest: 'Носки вернулись к коммунальному порядку.',
      resultAlternate: 'Большинство носков вернулось. Остальные под наблюдением.'
    }
  },
  perSecond: '/сек',
  hoursShort: 'ч',
  minutesShort: 'м',
  secondsShort: 'с',
  content: {
    modules: {
      tenant_capsule: { name: 'Капсула арендатора', role: 'Первый генератор' },
      cosmo_kitchen: { name: 'Общая космо-кухня', role: 'Ранний сервис' },
      oxygen_garden: { name: 'Кислородный сад', role: 'Комфорт и доход' },
      zero_g_laundry: { name: 'Прачечная невесомости', role: 'Средний доход' },
      teleport_entry: { name: 'Телепорт-прихожая', role: 'Поток жильцов' },
      antigrav_gym: { name: 'Антиграв-спортзал', role: 'Дорогой сервис' },
      panorama_dome: { name: 'Панорамный купол', role: 'Премиум зона' },
      saucer_dock: { name: 'Док для мини-тарелок', role: 'Поздний MVP' },
      radiator_balcony: { name: 'Радиаторный балкон', role: 'Тепло и комфорт' },
      mail_tube_office: { name: 'Почтовая труба-контора', role: 'Пневмопочта станции' },
      meteorite_pantry: { name: 'Метеоритная кладовая', role: 'Запасы и офлайн-доход' },
      shared_observatory: { name: 'Общая обсерватория', role: 'Репутация и звёзды' },
      comet_water_tank: { name: 'Кометный водяной бак', role: 'Комфорт и сервис' },
      orbital_library: { name: 'Орбитальная библиотека', role: 'Престиж и тишина' }
    },
    residents: {
      sleepy_engineer: {
        name: 'Сонный инженер',
        unlockText: 'Капсула арендатора достигла 10 уровня.',
        bonusText: '+5% к доходу капсул',
        bio: 'Бывший инженер орбитальной станции «Восход-7». После выхода на пенсию не нашёл себе места на Земле и вернулся в космос. Спит по 14 часов в сутки, но чинит всё, что ломается, даже во сне. Любит растворимый кофе и старые технические журналы.'
      },
      mist_cook: {
        name: 'Повар с туманной планеты',
        unlockText: 'Космо-кухня достигла 10 уровня.',
        bonusText: '+10% к доходу кухни',
        bio: 'Прилетел с планеты, покрытой вечным туманом. Готовит супы из космических водорослей, которые никто кроме него не умеет варить. Утверждает, что его бабушка готовила лучше, но рецепта не оставила. Разговаривает с кастрюлями.'
      },
      vacuum_gardener: {
        name: 'Садовник вакуума',
        unlockText: 'Открыт кислородный сад.',
        bonusText: '+5 комфорта',
        bio: 'Единственный человек на станции, который умеет выращивать помидоры в открытом космосе. Тихий, дружелюбный, всегда предлагает свежий укроп. Коллекционирует семена с разных планет и ведёт дневник наблюдений за каждым ростком.'
      },
      sock_master: {
        name: 'Мастер носков в невесомости',
        unlockText: 'Прачечная невесомости достигла 10 уровня.',
        bonusText: '+10% к сервисному доходу',
        bio: 'Легенда станции. Может поймать летящий носок на лету с закрытыми глазами. Превратил стирку в искусство — его носки развешаны по всей станции как декор. Никто не знает, откуда у него 247 пар одинаковых носков.'
      },
      teleport_courier: {
        name: 'Курьер через телепорт',
        unlockText: 'Открыта телепорт-прихожая.',
        bonusText: '+5% к общему доходу',
        bio: 'Самый быстрый курьер в галактике. Доставляет посылки через телепорт за 0.3 секунды. Постоянно путает адреса, но всегда приходит извиняться. Коллекционирует марки с разных планет, хотя они давно вышли из обращения.'
      },
      vip_astroteenant: {
        name: 'VIP-астроарендатор',
        unlockText: 'Добровольный рекламный бонус или редкое событие.',
        bonusText: 'x2 доход на 10 минут',
        bio: 'Таинственный жилец, который появляется только когда станции нужна помощь. Никто не знает его настоящего имени. Платит вдвое за аренду, но требует лучших условий. Говорит, что был на каждой станции в галактике.'
      },
      retired_cosmonaut: {
        name: 'Сосед-отставной космонавт',
        unlockText: 'Первая реновация орбиты.',
        bonusText: '+10% к стартовому доходу после реновации',
        bio: 'Ветеран трёх орбитальных программ. Прошёл 12 реноваций и каждый раз возвращался. Знает каждый закоулок станции и каждую трещину в обшивке. Сидит у иллюминатора и рассказывает истории молодым жильцам. Его эмалированная кружка — предмет зависти.'
      },
      three_eyed_housekeeper: {
        name: 'Трёхглазая комендантша',
        unlockText: 'Комфорт станции достиг 40.',
        bonusText: '-8% к цене первых модулей',
        bio: 'Третий глаз видит все неполадки на станции одновременно. Строгая, но справедливая. Ведёт журнал проверок и знает, кто не убрал за собой на кухне. Договаривается с поставщиками о скидках на модули. Любит кактусы и порядок.'
      },
      comet_plumber: {
        name: 'Кометный водопроводчик',
        unlockText: 'Открыт кометный водяной бак.',
        bonusText: '+2 часа к лимиту офлайн-дохода',
        bio: 'Прилетел на хвосте кометы и остался. Чинит трубы из ледяной кометной воды. Носит шарф даже в вакууме. Утверждает, что кометная вода вкуснее земной. Всегда готов помочь с сантехникой.'
      },
      signal_radio_host: {
        name: 'Радиоведущий сигналов',
        unlockText: 'Открыта общая обсерватория.',
        bonusText: '+20% к длительности временных бонусов',
        bio: 'Ведёт ночное радио из обсерватории. Ловит сигналы из дальнего космоса и превращает их в музыку. Спит днём, работает ночью. Его передачи продлевают любые бонусы — говорит, что это «резонанс волн».'
      },
      floating_librarian: {
        name: 'Парящий библиотекарь',
        unlockText: 'Открыта орбитальная библиотека.',
        bonusText: '+10% к доходу при комфорте ≥ 50',
        bio: 'Единственный человек, который читает в невесомости. Книги парят вокруг него живым коконом. Знает историю каждой планеты и каждого жильца. Тишина библиотеки — его главный ресурс. Когда на станции уютно, работает вдвое быстрее.'
      },
      tiny_saucer_family: {
        name: 'Семейство мини-тарелок',
        unlockText: 'Док для мини-тарелок достиг 10 уровня.',
        bonusText: '+3% к доходу за каждого жильца',
        bio: 'Семья из пяти маленьких летающих тарелок. Прибыли на станцию и решили остаться. Каждая тарелка — отдельная личность со своим характером. Чем больше жильцов на станции, тем активнее они помогают с доставкой.'
      },
      orbital_beekeeper: {
        name: 'Орбитальный пчеловод',
        unlockText: 'Кислородный сад достиг 15 уровня.',
        bonusText: '+1 комфорт за каждые 5 уровней сада при разблокировке',
        bio: 'Привёз на станцию колонию космических пчёл, которые не боятся невесомости. Пчёлы опыляют сад и гонят мёд с привкусом звёздной пыли. Чем глубже сад к моменту его прихода, тем больше пчёл он приводит — и тем больше комфорта от их гудения в куполе.'
      }
    },
    goals: {
      buy_capsule_10: {
        title: 'Поднять капсулу до 10 уровня',
        rewardLabel: '+1 комфорт, новые детали капсулы'
      },
      unlock_kitchen: {
        title: 'Открыть общую космо-кухню',
        rewardLabel: '+1 комфорт, кухонные детали'
      },
      reach_comfort_25: {
        title: 'Довести комфорт до 25',
        rewardLabel: '+3 комфорт, теплый режим станции'
      },
      earn_credits_10000: {
        title: 'Заработать 10 000 копеек',
        rewardLabel: 'x1.15 дохода на 5 мин'
      },
      unlock_three_residents: {
        title: 'Заселить 3 жильцов',
        rewardLabel: 'Визуальная деталь: расписание жильцов'
      },
      unlock_panorama_dome: {
        title: 'Открыть панорамный купол',
        rewardLabel: '+8 комфорт, детали купола'
      },
      first_renovation: {
        title: 'Сделать первую реновацию орбиты',
        rewardLabel: 'Реновация отмечена'
      },
      rebuild_capsule_10: {
        title: 'Восстановить капсулу до 10 уровня',
        rewardLabel: '+2 комфорт, восстановленные детали капсулы'
      },
      reopen_kitchen: {
        title: 'Снова открыть космо-кухню',
        rewardLabel: '+2 комфорт, кухонные детали'
      },
      unlock_laundry_after_renovation: {
        title: 'Открыть прачечную невесомости',
        rewardLabel: '+3 комфорт, детали прачечной'
      },
      reach_comfort_40: {
        title: 'Довести комфорт до 40',
        rewardLabel: '+4 комфорт, тёплый режим станции'
      },
      earn_credits_50000: {
        title: 'Заработать 50 000 копеек в цикле',
        rewardLabel: '+4 комфорт, запас копеек'
      },
      second_renovation: {
        title: 'Сделать вторую реновацию',
        rewardLabel: 'Новый список целей'
      },
      rebuild_capsule_25: {
        title: 'Развить капсулу до 25 уровня',
        rewardLabel: '+4 комфорт, продвинутые детали капсулы'
      },
      unlock_teleport_entry: {
        title: 'Открыть телепорт-прихожую',
        rewardLabel: '+5 комфорт, детали телепорта'
      },
      unlock_five_residents: {
        title: 'Заселить 5 жильцов',
        rewardLabel: '+6 комфорт, соседи на своих местах'
      },
      reach_comfort_60: {
        title: 'Довести комфорт до 60',
        rewardLabel: '+6 комфорт, обжитой режим станции'
      },
      earn_credits_100000: {
        title: 'Заработать 100 000 копеек в цикле',
        rewardLabel: '+6 комфорт, солидный запас копеек'
      },
      repeat_renovation: {
        title: 'Провести ещё одну реновацию',
        rewardLabel: 'Новый цикл станции'
      },
      reach_comfort_80: {
        title: 'Довести комфорт до 80',
        rewardLabel: '+7 комфорт, тёплый режим станции'
      },
      unlock_seven_residents: {
        title: 'Заселить 7 жильцов',
        rewardLabel: '+8 комфорт, большая коммуналка'
      },
      earn_credits_500000: {
        title: 'Заработать 500 000 копеек в цикле',
        rewardLabel: '+8 комфорт, серьёзный запас копеек'
      },
      unlock_orbital_library: {
        title: 'Открыть орбитальную библиотеку',
        rewardLabel: '+9 комфорт, детали библиотеки'
      },
      reach_capsule_50: {
        title: 'Развить капсулу до 50 уровня',
        rewardLabel: '+10 комфорт, продвинутая капсула'
      },
      third_renovation: {
        title: 'Сделать третью реновацию',
        rewardLabel: 'Поздний цикл станции'
      }
    },
    achievements: {
      first_purchase: {
        title: 'Первый жилец',
        description: 'Купить первый уровень любого модуля.'
      },
      ten_module_levels: {
        title: 'Маленькая станция',
        description: 'Суммарно 10 уровней модулей.'
      },
      fifty_module_levels: {
        title: 'Растущая коммуналка',
        description: 'Суммарно 50 уровней модулей.'
      },
      hundred_module_levels: {
        title: 'Большая орбита',
        description: 'Суммарно 100 уровней модулей.'
      },
      first_prestige: {
        title: 'Первая реновация',
        description: 'Сделать первую реновацию орбиты.'
      },
      renovation_master: {
        title: 'Мастер реновации',
        description: 'Сделать 3 реновации орбиты.'
      },
      comfort_50: {
        title: 'Уютно как дома',
        description: 'Достичь 50 комфорта.'
      },
      comfort_100: {
        title: 'Обжитой космос',
        description: 'Достичь 100 комфорта.'
      },
      credits_million: {
        title: 'Миллионер орбиты',
        description: 'Заработать 1 000 000 копеек суммарно.'
      },
      all_rooms_unlocked: {
        title: 'Вся коммуналка',
        description: 'Открыть все модули станции.'
      },
      daily_streak_7: {
        title: 'Неделя подряд',
        description: 'Заходить 7 дней подряд.'
      }
    },
    prestigeUpgrades: {
      warm_start_credits: {
        name: 'Аварийная касса',
        description: 'Каждый новый цикл начинается со 100 копеек вместо базового старта.'
      },
      residents_survive: {
        name: 'Соседи остаются',
        description: 'Жильцы не сбрасываются при реновации орбиты.'
      },
      first_room_discount: {
        name: 'Склад старых деталей',
        description: 'Первая покупка каждой комнаты стоит на 10% меньше.'
      },
      starting_comfort: {
        name: 'Тёплый старт',
        description: 'Каждый новый цикл начинается с +5 комфорта.'
      },
      capsule_head_start: {
        name: 'Готовая капсула',
        description: 'После реновации капсула арендатора сразу получает 5 уровней.'
      },
      visitor_comfort_bonus: {
        name: 'Книга отзывов',
        description: 'Принятые гости дают на 1 комфорт больше.'
      },
      higher_offline_cap: {
        name: 'Запас хода станции',
        description: 'Лимит офлайн-дохода увеличен с 8 до 12 часов.'
      },
      reputation_income: {
        name: 'Добрая слава',
        description: 'Каждая единица репутации сильнее повышает доход станции.'
      },
      starting_comfort_plus: {
        name: 'Обжитой старт',
        description: 'Каждый новый цикл начинается с +10 комфорта.'
      },
      offline_cap_16h: {
        name: 'Дежурная автоматика',
        description: 'Лимит офлайн-дохода увеличен до 16 часов.'
      },
      maintenance_drones: {
        name: 'Дворницкие дроны',
        description: 'Новые комнаты начинают цикл в лучшем состоянии.'
      }
    },
    visitors: {
      courier: {
        name: 'Космический курьер',
        flavor: 'Мне нужен сухой док на 10 минут. Заплатите, и я оставлю станции хороший отзыв.'
      },
      trader: {
        name: 'Туманный торговец',
        flavor: 'Обменяю редкие семена на копейки. Комфорт вашего сада вырастет.'
      },
      mechanic: {
        name: 'Бродячий механик',
        flavor: 'Подправлю вашу вентиляцию за пару копеек. Станция станет уютнее.'
      },
      tourist: {
        name: 'Заблудившийся турист',
        flavor: 'Я просто хотел посмотреть на звезды. Дайте мне кров, и я расскажу всем о вашей коммуналке.'
      }
    }
  }
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
  currentTask: 'Current task',
  taskVisitorTitle: 'Welcome a station visitor',
  taskVisitorBody: 'The visitor adds comfort if you accept the request now.',
  taskDailyTitle: 'Collect the daily reward',
  taskDailyBody: 'This gives a quick start toward the next purchase.',
  taskCommunalDutyClaimTitle: 'Claim a communal duty',
  taskCommunalDutyClaimBody: 'A resident finished helping the station. Claim the result now.',
  taskCommunalDutyAssignTitle: 'Assign a communal duty',
  taskCommunalDutyAssignBody: 'A room needs a small favor. Pick a resident and let them handle it.',
  taskGoalTitle: 'Finish a close goal',
  taskGoalBody: 'This goal is almost done and will help the station grow.',
  taskModuleBuyTitle: 'Buy a room upgrade',
  taskModuleBuyBody: 'This is the most useful next step for income growth.',
  taskModuleWaitTitle: 'Save for the next upgrade',
  taskModuleWaitBody: 'Income is already running; wait until the room can be upgraded.',
  taskModuleUnlockTitle: 'Unlock the next room',
  taskModuleUnlockBody: 'The room opens after enough lifetime earnings.',
  taskPrestigeTitle: 'Prepare an orbit renovation',
  taskPrestigeBody: 'Renovation grants reputation and strengthens the next cycle.',
  taskSelectRoom: 'Show room',
  taskRenovate: 'Go to renovation',
  taskCost: 'Cost',
  taskWait: 'Wait',
  taskProgress: 'Progress',
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
  strangeCatOfferTitle: 'Settle the strange cat',
  strangeCatOfferBody: 'Permanent purchase: the cat will live in the tenant capsule forever.',
  buyStrangeCat: 'Buy the strange cat',
  strangeCatPurchasing: 'Processing purchase…',
  strangeCatOwned: 'Cat settled',
  strangeCatUnavailable: 'Purchase temporarily unavailable',
  strangeCatPurchaseError: 'Purchase not completed. You can try again.',
  portalCurrency: 'Portal currency',
  vipCooldown: 'VIP tomorrow',
  adPending: 'Ad...',
  renovationTitle: 'Orbit Renovation',
  reputationStation: 'Station reputation',
  renovationRequirements: 'Renovation requirements',
  renovationRequirementReward: 'Build up a +1 renovation reputation reward',
  renovationRequirementStation0: 'Capsule 10+ and kitchen opened',
  renovationRequirementStation1: 'Capsule 25+ and laundry opened',
  renovationRequirementStation2: 'Open teleport and settle 5 residents',
  renovationRequirementStation3: 'Open library and reach 70 comfort',
  renovationCycleLabel: 'Renovation cycle',
  celebrationTitle: 'Renovation complete!',
  celebrationCycle: 'Cycle {cycle}',
  celebrationReputation: '+{amount} reputation',
  celebrationDismiss: 'Continue',
  saveSaving: 'Saving…',
  saveSaved: 'Saved',
  errorBoundaryTitle: 'The station crashed',
  errorBoundaryBody: 'Something went wrong. Your save is intact — reload the page to continue.',
  errorBoundaryReload: 'Reload',
  renovationRequirementGoals: 'Complete cycle goals',
  renovate: 'Renovate',
  renovateTooltip: 'Renovation resets kopeks and modules but keeps reputation and purchased upgrades. Reward = floor(sqrt(earned / 100000)).',
  residentsSurvive: 'Neighbors stay',
  residentsSurviveDesc: 'Residents are not reset on renovation.',
  startingComfort: 'Warm start',
  startingComfortDesc: 'Each new cycle starts with +5 comfort.',
  higherOfflineCap: 'Station range',
  higherOfflineCapDesc: 'Offline income cap increased from 8 to 12 hours.',
  upgradesTitle: 'Renovation upgrades',
  renovationChoicesLeft: 'Renovation choices left',
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
  incomeBreakdownTitle: 'Income sources',
  incomeBreakdownHint: 'Top rooms by contribution to station income',
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
  tourTitle: 'Station Tour',
  tourStepStation: 'Your Station',
  tourStepStationBody: 'This is the station view. Click a room to earn a few kopeks. You can permanently settle the strange cat from Bonuses.',
  tourStepModules: 'Station Rooms',
  tourStepModulesBody: 'Buy module levels with kopeks. Each module gives income per second. At levels 10, 25, 50, and 100 modules get an income multiplier.',
  tourStepGoals: 'Goals',
  tourStepGoalsBody: 'Goals guide your progress. Completing them gives comfort, visual details, or temporary boosts. Finished goals disappear from the list.',
  tourStepBonuses: 'Bonuses',
  tourStepBonusesBody: 'On Yandex Games bonuses are activated via ads (x2 rent, VIP resident). Locally — instantly. There are also daily login rewards.',
  tourStepStats: 'Station Resources',
  tourStepStatsBody: 'Kopeks, comfort, reputation, and income per second are your key metrics. Comfort multiplies income, reputation boosts it after renovation.',
  tourNext: 'Next',
  tourPrev: 'Back',
  tourSkip: 'Skip',
  tourDone: 'Let\'s go!',
  tourStep: 'Step',
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
  residentRoleIncome: 'income',
  residentRoleComfort: 'comfort',
  residentRoleMaintenance: 'maintenance',
  residentRoleVisitor: 'visitor',
  residentRoleRenovation: 'renovation',
  previewTags: 'Result tags',
  previewTagIncome: 'income',
  previewTagComfort: 'comfort',
  previewTagCondition: 'condition',
  previewTagResident: 'resident',
  previewTagRole: 'role',
  previewTagVisual: 'detail',
  previewTagRenovation: 'renovation',
  previewTagTimedBonus: 'boost',
  previewTagCost: 'cost',
  actionPreviews: {
    incomeRateSuffix: '/sec',
    comfortDelta: 'comfort',
    conditionDelta: 'condition',
    timedBoost: 'temporary income boost',
    visualDetail: 'visual detail',
    stationStabilized: 'station stabilized',
    journalMemory: 'journal memory',
    unknownRoom: 'Unknown room',
    noPreview: 'No preview available',
    roomLocked: '{name} locked',
    roomLockedReason: 'Earn more kopeks to unlock this room.',
    unlocksAt: 'Unlocks at {amount} total earned',
    roomComfort: ', +{amount} comfort',
    openRoom: 'Open {name}',
    upgradeRoom: 'Upgrade {name}',
    firstRoomReason: 'Creates the first working room in this station area.',
    upgradeReason: 'Raises room level and moves toward the next milestone.',
    purchaseResult: 'Costs {cost}, adds {income}{comfort}',
    dutyCannot: 'Resident cannot take this duty',
    chooseResident: 'Choose an eligible resident.',
    expectedDuty: 'Expected duty result',
    roleMatches: '{role} role matches this duty.',
    roleResident: 'Resident',
    eligibleResident: 'Eligible resident can complete this duty.',
    roleSolution: 'Role solution',
    choiceResult: 'Choice result',
    roleUnlocks: '{role} role unlocks this option.',
    alwaysAvailable: 'Always available incident response.',
    renovationReady: 'Renovation ready',
    prepareRenovation: 'Prepare renovation',
    renovationReason: 'Renovation resets rooms and kopeks, but reputation and purchased permanent upgrades stay.',
    renovationGain: 'Gain +{reward} reputation and unlock {choices} upgrade choices',
    renovationBuild: 'Build toward +{reward} reputation',
    dutyResult: 'Duty result',
    dutyCompleted: 'Station duty completed'
  },
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
  aboutHint2: 'Thanks for playing! Your feedback helps make the communalka cozier.',
  feedbackEmail: 'seme4kak@yandex.ru',
  incidentJournalTitle: 'Incident Journal',
  incidentJournalNew: 'New',
  incidentJournalEmpty: 'The station is quiet. Suspiciously quiet.',
  incidentJournalCompleted: 'Resolved',
  incidentVisualReward: 'Visual detail',
  incidents: {
    kitchen_borscht_fog: {
      title: 'Borscht fog moved into the kitchen',
      body: 'The fog smells like lunch and lightly disagrees with ventilation.',
      choices: {
        make_borscht_tradition: { label: 'Borscht tradition', description: '+comfort, visual detail' },
        vent_fog: { label: 'Vent it through the airlock', description: '+kitchen condition, visual detail' },
        keep_aroma: { label: 'Keep it for aroma', description: '+comfort' }
      }
    },
    capsule_snore_echo: {
      title: 'The capsule caught a snore echo',
      body: 'The Sleepy Engineer insists it is acoustics, not him.',
      choices: {
        install_padding: { label: 'Install soft panels', description: '-kopeks, +capsule condition, detail' },
        quiet_hours: { label: 'Declare quiet hours', description: '+comfort' }
      }
    },
    laundry_sock_orbit: {
      title: 'Socks entered orbit',
      body: 'The laundry now resembles a small planetary system.',
      choices: {
        catch_socks: { label: 'Catch socks with a net', description: '+comfort, detail' },
        ask_sock_master: { label: 'Call the Sock Master', description: '+laundry condition' }
      }
    },
    garden_first_sprout_vote: {
      title: 'The first sprout needs a name',
      body: 'Residents debate whether the plant can be called Boris.',
      choices: {
        name_sprout: { label: 'Hold a vote', description: '+comfort' },
        build_lamp: { label: 'Build a grow lamp', description: '+garden condition, detail' }
      }
    },
    teleport_wrong_parcel: {
      title: 'The teleport brought a wrong parcel',
      body: 'The box says: "If this is not yours, it is almost yours."',
      choices: {
        courier_protocol: { label: 'Courier protocol', description: '+comfort, visual detail' },
        return_parcel: { label: 'Return to sender', description: '+comfort, detail' },
        open_parcel: { label: 'Open carefully', description: '+kopeks' }
      }
    },
    renovation_cold_floor: {
      title: 'The floor is cold after renovation',
      body: 'The station is new again, but the slippers escaped again.',
      choices: {
        insulate_floor: { label: 'Insulate the capsule', description: '+comfort, detail' },
        save_materials: { label: 'Save materials', description: '+kopeks' }
      }
    },
    condition_warning_light: {
      title: 'The warning light blinks with confidence',
      body: 'Nobody remembers what it means, but everyone walks softer.',
      choices: {
        maintenance_shortcut: { label: 'Maintenance shortcut', description: '+condition, visual detail' },
        repair_now: { label: 'Repair now', description: '-kopeks, +condition, detail' },
        label_switch: { label: 'Label the switch', description: '+comfort' }
      }
    },
    cat_found_warm_pipe: {
      title: 'The strange cat found a warm pipe',
      body: 'The cat pretends this was an engineering decision.',
      choices: {
        cozy_cat_corner: { label: 'Cozy cat corner', description: '+comfort, visual detail' },
        leave_saucer: { label: 'Leave a saucer', description: '+comfort, detail' },
        mark_pipe: { label: 'Mark pipe as important', description: '+capsule condition' }
      }
    },
    kitchen_garden_soup: {
      title: 'The kitchen and garden invented soup',
      body: 'Nobody knows who started it, but the smell is convincing.',
      choices: {
        communal_soup: { label: 'Cook communal soup', description: '+comfort, detail' },
        sell_recipe: { label: 'Sell the recipe', description: '+kopeks' }
      }
    },
    high_income_low_comfort_meeting: {
      title: 'Income is rising and the kettle is sad',
      body: 'Residents imply the station became efficient, not cozy.',
      choices: {
        tea_council: { label: 'Tea council', description: '+comfort' },
        fund_tea_break: { label: 'Fund a tea break', description: '-kopeks, +comfort' },
        take_minutes: { label: 'Take meeting notes', description: 'journal memory' }
      }
    },
    capsule_window_frost: {
      title: 'Frost crept across the capsule window',
      body: 'The pattern is pretty, but residents are starting to see their breath in their sleep.',
      choices: {
        wipe_window: { label: 'Wipe the window with a cloth', description: '+comfort, detail' },
        seal_frame: { label: 'Seal the frame with weatherstripping', description: '+capsule condition' }
      }
    },
    kitchen_spoon_union: {
      title: 'A spoon union has formed in the kitchen',
      body: 'The spoons teamed up with the ladles and demand a separate shelf.',
      choices: {
        approve_union: { label: 'Recognize the spoon union', description: '+comfort, detail' },
        organize_drawer: { label: 'Sort them into drawers', description: '+kitchen condition' }
      }
    },
    garden_plant_listens_radio: {
      title: 'The garden plant is listening to the radio',
      body: 'Someone left the receiver by the pot, and the sprout is clearly swaying to the beat.',
      choices: {
        keep_radio: { label: 'Leave the radio by the plant', description: '+comfort, detail' },
        tune_signal: { label: 'Tune the signal quieter', description: '+garden condition' }
      }
    },
    laundry_static_storm: {
      title: 'A static storm started in the laundry',
      body: 'Socks are crackling and attracting small objects.',
      choices: {
        ground_socks: { label: 'Ground the socks', description: '+laundry condition' },
        name_constellation: { label: 'Name the sock constellation', description: '+comfort, detail' }
      }
    },
    teleport_neighbor_duplicate: {
      title: 'The teleport duplicated a neighbor\'s mug',
      body: 'Now you have two identical mugs, and the neighbor does not know yet.',
      choices: {
        return_mug: { label: 'Return the spare mug', description: '+teleport condition' },
        display_mug: { label: 'Put the mug on the shelf', description: '+comfort, detail' }
      }
    },
    panorama_star_argument: {
      title: 'Residents argue about star names',
      body: 'A crowd gathered at the dome — everyone is sure they know the "right" name for each star.',
      choices: {
        vote_names: { label: 'Hold a naming vote', description: '+comfort, detail' },
        use_catalogue: { label: 'Open the star catalogue', description: '+dome condition' }
      }
    },
    maintenance_drones_form_committee: {
      title: 'Maintenance drones formed a committee',
      body: 'The drones stopped cleaning and started debating shift schedules. Income is slipping and comfort needs attention.',
      choices: {
        ratify_committee: { label: 'Ratify the drone committee', description: '+comfort, detail' },
        assign_shifts: { label: 'Assign shifts manually', description: '+capsule and kitchen condition' }
      }
    },
    cat_sleeps_on_button: {
      title: 'The cat fell asleep on an important button',
      body: 'The strange cat found the only warm button on the panel and refuses to leave. The capsule is suffering.',
      choices: {
        relocate_cat: { label: 'Move the cat to the sofa', description: '+comfort, detail' },
        label_button: { label: 'Label the button "no sleeping"', description: '+capsule condition' }
      }
    },
    retired_cosmonaut_mug_missing: {
      title: 'The cosmonaut\'s enamel mug is missing',
      body: 'The retired cosmonaut searched the whole capsule — the mug is nowhere. He says without it "this is not the same station".',
      choices: {
        search_capsule: { label: 'Search the capsule together', description: '+comfort, detail' },
        buy_new_mug: { label: 'Buy a new mug', description: '-kopeks, +comfort' }
      }
    },
    mist_cook_recipe_too_large: {
      title: 'The cook\'s recipe does not fit in the kitchen',
      body: 'The misty algae soup takes 47 steps. The cook from the fog planet insists there is no shorter version.',
      choices: {
        copy_recipe: { label: 'Copy the recipe onto parchment', description: '+comfort, detail' },
        simplify_recipe: { label: 'Simplify to 12 steps', description: '+kitchen condition' }
      }
    },
    vacuum_gardener_seed_escape: {
      title: 'The gardener\'s seeds escaped',
      body: 'The seed collection from different planets flew into the corridor. The vacuum gardener is frantically catching them in zero gravity.',
      choices: {
        catch_seeds: { label: 'Help catch the seeds', description: '+comfort, detail' },
        let_them_grow: { label: 'Let them grow in the corridor', description: '+garden condition' }
      }
    }
  },
  storyTitle: 'Resident Request',
  storyProgress: 'Progress',
  storyReward: 'Reward',
  storyComplete: 'Story complete!',
  storyGotoRoom: 'Go to room',
  stories: {
    engineer_quiet_capsule: {
      title: 'Sleepy Engineer wants quiet',
      request: '"The neighbors are too loud. Get the capsule to level 15 and I will install soundproofing."',
      complete: 'Sleepy Engineer enjoys the silence. +2 comfort!'
    },
    cook_working_kitchen: {
      title: 'Cook needs a working kitchen',
      request: '"The stove barely heats. Get the kitchen to level 20 and I will feed the whole station."',
      complete: 'The Mist Cook is happy. +3 comfort!'
    },
    gardener_first_plant: {
      title: 'Gardener waits for the first sprout',
      request: '"My seeds will not grow without a proper garden. Get the oxygen garden to level 10, please."',
      complete: 'The first sprout survived! Vacuum Gardener smiles. +3 comfort!'
    },
    sock_master_laundry_upgrade: {
      title: 'Sock Master demands order',
      request: '"Socks are flying everywhere! Get the laundry to level 25 and I will sort them out."',
      complete: 'All socks caught. Sock Master is proud. +5 comfort!'
    },
    courier_teleport_traffic: {
      title: 'Courier needs traffic',
      request: '"The teleport barely works. Level 15 and the parcels will fly themselves!"',
      complete: 'The teleport hums with traffic. Courier is pleased. +4 comfort!'
    },
    cosmonaut_warm_start: {
      title: 'Cosmonaut neighbor asks for warmth',
      request: '"It is cold here after renovation. Get the capsule to level 10 and I will warm up."',
      complete: 'Retired Cosmonaut warmed up. +3 comfort!'
    }
  },
  conditionTitle: 'Room condition',
  conditionPristine: 'Pristine',
  conditionWorking: 'Working',
  conditionWorn: 'Worn',
  conditionBroken: 'Broken',
  conditionHint: 'Assign a resident duty to repair this room.',
  weeklyRepairTitle: 'Weekly Repair',
  weeklyRepairDays: 'd',
  weeklyRepairHours: 'h',
  weeklyRepairExpired: 'Expired',
  weeklyRepairRoom: 'Repair {room} to {target} condition',
  weeklyRepairLevels: 'Buy {target} levels for {room}',
  weeklyRepairCondition: 'Reach {target} condition on {room}',
  weeklyRepairClaimBonus: 'Claim bonus',
  weeklyRepairBonusClaimed: 'Bonus claimed!',
  leaderboardTitle: 'Leaderboard',
  leaderboardYourScore: 'Your score',
  leaderboardAnonymous: 'Anonymous',
  leaderboardEmpty: 'No entries yet. Play to get on the board!',
  dailyConditionRepair: 'condition to all rooms',
  dailyTimedBonus: 'income',
  communalDutyTitle: 'Communal duty',
  communalDutyAssign: 'Assign',
  communalDutyInProgress: 'Resident on duty',
  communalDutyReady: 'Duty complete',
  communalDutyClaim: 'Claim result',
  communalDutyBestMatch: 'Best match',
  communalDutyNoResidents: 'No eligible residents yet',
  communalDuties: {
    capsule_quiet_hours: {
      title: 'Quiet hours in the capsule',
      request: 'The capsule lamp hums like an old radio. Someone should calm it down.',
      resultBest: 'The capsule is quiet and warm again.',
      resultAlternate: 'The capsule is calmer, though still opinionated.'
    },
    kitchen_soup_escape: {
      title: 'Soup escaped into zero-G',
      request: 'The kitchen soup is orbiting the ceiling and looking proud.',
      resultBest: 'The soup returned to the pot with dignity.',
      resultAlternate: 'The soup was negotiated back toward the table.'
    },
    garden_vacuum_sprout: {
      title: 'Vacuum sprout inspection',
      request: 'A tiny sprout demands proper orbital respect.',
      resultBest: 'The sprout is officially part of the station.',
      resultAlternate: 'The sprout accepts the compromise.'
    },
    laundry_sock_orbit: {
      title: 'Sock orbit cleanup',
      request: 'The laundry socks formed a small independent orbit.',
      resultBest: 'The socks returned to civic order.',
      resultAlternate: 'Most socks returned. The rest are being watched.'
    }
  },
  perSecond: '/sec',
  hoursShort: 'h',
  minutesShort: 'm',
  secondsShort: 's',
  content: {
    modules: {
      tenant_capsule: { name: 'Tenant Capsule', role: 'First generator' },
      cosmo_kitchen: { name: 'Shared Cosmo-Kitchen', role: 'Early service' },
      oxygen_garden: { name: 'Oxygen Garden', role: 'Comfort and income' },
      zero_g_laundry: { name: 'Zero-G Laundry', role: 'Mid income' },
      teleport_entry: { name: 'Teleport Foyer', role: 'Resident flow' },
      antigrav_gym: { name: 'Antigrav Gym', role: 'Premium service' },
      panorama_dome: { name: 'Panorama Dome', role: 'Premium zone' },
      saucer_dock: { name: 'Mini-Saucer Dock', role: 'Late MVP' },
      radiator_balcony: { name: 'Radiator Balcony', role: 'Warmth and comfort' },
      mail_tube_office: { name: 'Mail-Tube Office', role: 'Station pneumatic mail' },
      meteorite_pantry: { name: 'Meteorite Pantry', role: 'Supplies and offline income' },
      shared_observatory: { name: 'Shared Observatory', role: 'Reputation and stars' },
      comet_water_tank: { name: 'Comet Water Tank', role: 'Comfort and service' },
      orbital_library: { name: 'Orbital Library', role: 'Prestige and silence' }
    },
    residents: {
      sleepy_engineer: {
        name: 'Sleepy Engineer',
        unlockText: 'Tenant Capsule reached level 10.',
        bonusText: '+5% to capsule income',
        bio: 'Former engineer of orbital station Voskhod-7. After retirement he could not find his place on Earth and returned to space. Sleeps 14 hours a day but fixes everything that breaks, even in his sleep. Loves instant coffee and old technical magazines.'
      },
      mist_cook: {
        name: 'Mist-Planet Cook',
        unlockText: 'Cosmo-Kitchen reached level 10.',
        bonusText: '+10% to kitchen income',
        bio: 'Arrived from a planet covered in eternal mist. Cooks soups from space algae that nobody else can prepare. Claims his grandmother cooked better but left no recipe. Talks to his pots.'
      },
      vacuum_gardener: {
        name: 'Vacuum Gardener',
        unlockText: 'Oxygen Garden unlocked.',
        bonusText: '+5 comfort',
        bio: 'The only person on the station who can grow tomatoes in open space. Quiet, friendly, always offers fresh dill. Collects seeds from different planets and keeps a diary of every sprout.'
      },
      sock_master: {
        name: 'Zero-G Sock Master',
        unlockText: 'Zero-G Laundry reached level 10.',
        bonusText: '+10% to service income',
        bio: 'A station legend. Can catch a flying sock blindfolded. Turned laundry into art — his socks are hung across the station as decoration. Nobody knows where he got 247 pairs of identical socks.'
      },
      teleport_courier: {
        name: 'Teleport Courier',
        unlockText: 'Teleport Foyer unlocked.',
        bonusText: '+5% to total income',
        bio: 'The fastest courier in the galaxy. Delivers packages through the teleport in 0.3 seconds. Constantly mixes up addresses but always comes back to apologize. Collects stamps from different planets, though they are long obsolete.'
      },
      vip_astroteenant: {
        name: 'VIP Astroteenant',
        unlockText: 'Voluntary ad bonus or a rare event.',
        bonusText: 'x2 income for 10 minutes',
        bio: 'A mysterious tenant who appears only when the station needs help. Nobody knows his real name. Pays double rent but demands the best conditions. Claims to have been to every station in the galaxy.'
      },
      retired_cosmonaut: {
        name: 'Retired Cosmonaut Neighbor',
        unlockText: 'First orbit renovation.',
        bonusText: '+10% to starting income after renovation',
        bio: 'Veteran of three orbital programs. Survived 12 renovations and came back every time. Knows every corner of the station and every crack in the hull. Sits by the porthole and tells stories to younger residents. His enamel mug is the envy of all.'
      },
      three_eyed_housekeeper: {
        name: 'Three-Eyed Housekeeper',
        unlockText: 'Station comfort reached 40.',
        bonusText: '-8% to first-module cost',
        bio: 'Her third eye sees every malfunction on the station at once. Strict but fair. Keeps an inspection log and knows who did not clean up in the kitchen. Negotiates discounts on modules with suppliers. Loves cacti and order.'
      },
      comet_plumber: {
        name: 'Comet Plumber',
        unlockText: 'Comet Water Tank unlocked.',
        bonusText: '+2 hours to offline income cap',
        bio: 'Arrived on the tail of a comet and stayed. Fixes pipes with icy comet water. Wears a scarf even in vacuum. Claims comet water tastes better than Earth water. Always ready to help with plumbing.'
      },
      signal_radio_host: {
        name: 'Signal Radio Host',
        unlockText: 'Shared Observatory unlocked.',
        bonusText: '+20% to timed bonus duration',
        bio: 'Hosts a night radio show from the observatory. Catches signals from deep space and turns them into music. Sleeps by day, works by night. His broadcasts extend all bonuses — he calls it wave resonance.'
      },
      floating_librarian: {
        name: 'Floating Librarian',
        unlockText: 'Orbital Library unlocked.',
        bonusText: '+10% to income when comfort >= 50',
        bio: 'The only person who reads in zero gravity. Books float around him in a living cocoon. Knows the history of every planet and every resident. The silence of the library is his main resource. When the station is cozy, he works twice as fast.'
      },
      tiny_saucer_family: {
        name: 'Tiny Saucer Family',
        unlockText: 'Mini-Saucer Dock reached level 10.',
        bonusText: '+3% income per resident on station',
        bio: 'A family of five tiny flying saucers. Arrived at the station and decided to stay. Each saucer is a separate personality with its own character. The more residents on the station, the more actively they help with deliveries.'
      },
      orbital_beekeeper: {
        name: 'Orbital Beekeeper',
        unlockText: 'Oxygen Garden reached level 15.',
        bonusText: '+1 comfort per 5 garden levels at unlock',
        bio: 'Brought a colony of space bees to the station — bees that do not mind zero gravity. They pollinate the garden and make honey with a stardust aftertaste. The deeper the garden when they arrive, the more bees he brings — and the more comfort from their humming in the dome.'
      }
    },
    goals: {
      buy_capsule_10: {
        title: 'Upgrade capsule to level 10',
        rewardLabel: '+1 comfort, new capsule details'
      },
      unlock_kitchen: {
        title: 'Unlock the shared cosmo-kitchen',
        rewardLabel: '+1 comfort, kitchen details'
      },
      reach_comfort_25: {
        title: 'Raise comfort to 25',
        rewardLabel: '+3 comfort, warm station mode'
      },
      earn_credits_10000: {
        title: 'Earn 10,000 kopeks',
        rewardLabel: 'x1.15 income for 5 min'
      },
      unlock_three_residents: {
        title: 'Settle 3 residents',
        rewardLabel: 'Visual detail: resident schedule'
      },
      unlock_panorama_dome: {
        title: 'Unlock the panorama dome',
        rewardLabel: '+8 comfort, dome details'
      },
      first_renovation: {
        title: 'Perform the first orbit renovation',
        rewardLabel: 'Renovation acknowledged'
      },
      rebuild_capsule_10: {
        title: 'Rebuild the capsule to level 10',
        rewardLabel: '+2 comfort, restored capsule details'
      },
      reopen_kitchen: {
        title: 'Reopen the cosmo-kitchen',
        rewardLabel: '+2 comfort, kitchen details'
      },
      unlock_laundry_after_renovation: {
        title: 'Unlock the zero-gravity laundry',
        rewardLabel: '+3 comfort, laundry details'
      },
      reach_comfort_40: {
        title: 'Raise comfort to 40',
        rewardLabel: '+4 comfort, warm station mode'
      },
      earn_credits_50000: {
        title: 'Earn 50,000 kopeks in a cycle',
        rewardLabel: '+4 comfort, kopeks reserve'
      },
      second_renovation: {
        title: 'Perform the second renovation',
        rewardLabel: 'New goal list'
      },
      rebuild_capsule_25: {
        title: 'Develop the capsule to level 25',
        rewardLabel: '+4 comfort, advanced capsule details'
      },
      unlock_teleport_entry: {
        title: 'Unlock the teleport entry',
        rewardLabel: '+5 comfort, teleport details'
      },
      unlock_five_residents: {
        title: 'Settle 5 residents',
        rewardLabel: '+6 comfort, neighbors in place'
      },
      reach_comfort_60: {
        title: 'Raise comfort to 60',
        rewardLabel: '+6 comfort, settled station mode'
      },
      earn_credits_100000: {
        title: 'Earn 100,000 kopeks in a cycle',
        rewardLabel: '+6 comfort, solid kopeks reserve'
      },
      repeat_renovation: {
        title: 'Perform another renovation',
        rewardLabel: 'New station cycle'
      },
      reach_comfort_80: {
        title: 'Raise comfort to 80',
        rewardLabel: '+7 comfort, warm station mode'
      },
      unlock_seven_residents: {
        title: 'Settle 7 residents',
        rewardLabel: '+8 comfort, large communalka'
      },
      earn_credits_500000: {
        title: 'Earn 500,000 kopeks in a cycle',
        rewardLabel: '+8 comfort, solid kopeks reserve'
      },
      unlock_orbital_library: {
        title: 'Unlock the orbital library',
        rewardLabel: '+9 comfort, library details'
      },
      reach_capsule_50: {
        title: 'Develop the capsule to level 50',
        rewardLabel: '+10 comfort, advanced capsule'
      },
      third_renovation: {
        title: 'Perform the third renovation',
        rewardLabel: 'Late station cycle'
      }
    },
    achievements: {
      first_purchase: {
        title: 'First Tenant',
        description: 'Buy the first level of any module.'
      },
      ten_module_levels: {
        title: 'Small Station',
        description: '10 total module levels.'
      },
      fifty_module_levels: {
        title: 'Growing Communalka',
        description: '50 total module levels.'
      },
      hundred_module_levels: {
        title: 'Big Orbit',
        description: '100 total module levels.'
      },
      first_prestige: {
        title: 'First Renovation',
        description: 'Perform the first orbit renovation.'
      },
      renovation_master: {
        title: 'Renovation Master',
        description: 'Perform 3 orbit renovations.'
      },
      comfort_50: {
        title: 'Cozy as Home',
        description: 'Reach 50 comfort.'
      },
      comfort_100: {
        title: 'Settled Space',
        description: 'Reach 100 comfort.'
      },
      credits_million: {
        title: 'Orbital Millionaire',
        description: 'Earn 1,000,000 kopeks in total.'
      },
      all_rooms_unlocked: {
        title: 'Whole Communalka',
        description: 'Unlock every station module.'
      },
      daily_streak_7: {
        title: 'Week in a Row',
        description: 'Log in 7 days in a row.'
      }
    },
    prestigeUpgrades: {
      warm_start_credits: {
        name: 'Emergency Cashbox',
        description: 'Each new cycle starts with 100 kopeks instead of the base start.'
      },
      residents_survive: {
        name: 'Neighbors Stay',
        description: 'Residents are not reset on orbit renovation.'
      },
      first_room_discount: {
        name: 'Old Parts Storage',
        description: 'The first purchase of each room costs 10% less.'
      },
      starting_comfort: {
        name: 'Warm Start',
        description: 'Each new cycle starts with +5 comfort.'
      },
      capsule_head_start: {
        name: 'Ready Capsule',
        description: 'After renovation, the tenant capsule starts at level 5.'
      },
      visitor_comfort_bonus: {
        name: 'Guestbook',
        description: 'Accepted visitors grant 1 extra comfort.'
      },
      higher_offline_cap: {
        name: 'Station Range',
        description: 'Offline income cap increased from 8 to 12 hours.'
      },
      reputation_income: {
        name: 'Good Name',
        description: 'Each reputation point increases station income more strongly.'
      },
      starting_comfort_plus: {
        name: 'Settled Start',
        description: 'Each new cycle starts with +10 comfort.'
      },
      offline_cap_16h: {
        name: 'Duty Automation',
        description: 'Offline income cap increased to 16 hours.'
      },
      maintenance_drones: {
        name: 'Maintenance Drones',
        description: 'New rooms start the cycle in better condition.'
      }
    },
    visitors: {
      courier: {
        name: 'Space Courier',
        flavor: 'I need a dry dock for 10 minutes. Pay up and I will leave the station a good review.'
      },
      trader: {
        name: 'Mist Trader',
        flavor: 'I will trade rare seeds for kopeks. Your garden comfort will rise.'
      },
      mechanic: {
        name: 'Wandering Mechanic',
        flavor: 'I will tweak your ventilation for a couple of kopeks. The station will get cozier.'
      },
      tourist: {
        name: 'Lost Tourist',
        flavor: 'I just wanted to look at the stars. Give me a bed and I will tell everyone about your communalka.'
      }
    }
  }
};

export const translations: Record<Language, Translation> = { ru, en };

const LANGUAGE_KEY = 'cosmic-communalka-language';

export function getDefaultLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'ru';
  }

  // Stored preference takes priority.
  const stored = window.localStorage.getItem(LANGUAGE_KEY);

  if (stored === 'ru' || stored === 'en') {
    return stored;
  }

  // Auto-detect from browser/Yandex environment (requirement 2.14).
  // Check Yandex SDK environment first, then fall back to navigator.language.
  const yaEnv = (window as unknown as { YaGames?: { environment?: { i18n?: { lang?: string } } } }).YaGames;
  const yaLang = yaEnv?.environment?.i18n?.lang;

  if (yaLang) {
    return yaLang.startsWith('en') ? 'en' : 'ru';
  }

  const navLang = navigator.language ?? 'ru';

  return navLang.startsWith('en') ? 'en' : 'ru';
}

export function setStoredLanguage(lang: Language): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LANGUAGE_KEY, lang);
  }
}
