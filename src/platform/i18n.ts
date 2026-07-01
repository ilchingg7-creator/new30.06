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
  // Game content (modules, residents, goals, achievements, prestige
  // upgrades, visitors). Keys are the id fields from src/game/content/*;
  // visitor keys are the `template` field set in src/game/visitors.ts.
  content: {
    modules: Record<string, { name: string; role: string }>;
    residents: Record<string, { name: string; unlockText: string; bonusText: string }>;
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
  aboutHint2: 'Спасибо за игру! Ваша обратная связь помогает делать коммуналку уютнее.',
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
      complete: 'Телепорт гудит от traffic. Курьер доволен. +4 комфорта!'
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
      mail_tube_office: { name: 'Почтовая труба-контора', role: 'Пневмопочта станции' }
    },
    residents: {
      sleepy_engineer: {
        name: 'Сонный инженер',
        unlockText: 'Капсула арендатора достигла 10 уровня.',
        bonusText: '+5% к доходу капсул'
      },
      mist_cook: {
        name: 'Повар с туманной планеты',
        unlockText: 'Космо-кухня достигла 10 уровня.',
        bonusText: '+10% к доходу кухни'
      },
      vacuum_gardener: {
        name: 'Садовник вакуума',
        unlockText: 'Открыт кислородный сад.',
        bonusText: '+5 комфорта'
      },
      sock_master: {
        name: 'Мастер носков в невесомости',
        unlockText: 'Прачечная невесомости достигла 10 уровня.',
        bonusText: '+10% к сервисному доходу'
      },
      teleport_courier: {
        name: 'Курьер через телепорт',
        unlockText: 'Открыта телепорт-прихожая.',
        bonusText: '+5% к общему доходу'
      },
      vip_astroteenant: {
        name: 'VIP-астроарендатор',
        unlockText: 'Добровольный рекламный бонус или редкое событие.',
        bonusText: 'x2 доход на 10 минут'
      },
      retired_cosmonaut: {
        name: 'Сосед-отставной космонавт',
        unlockText: 'Первая реновация орбиты.',
        bonusText: '+10% к стартовому доходу после реновации'
      },
      three_eyed_housekeeper: {
        name: 'Трёхглазая комендантша',
        unlockText: 'Комфорт станции достиг 40.',
        bonusText: '-8% к цене первых модулей'
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
        rewardLabel: '+2 комфорт, подсказка к реновации'
      },
      unlock_three_residents: {
        title: 'Заселить 3 жильцов',
        rewardLabel: '+5 комфорт, жильцы в комнатах'
      },
      unlock_panorama_dome: {
        title: 'Открыть панорамный купол',
        rewardLabel: '+8 комфорт, детали купола'
      },
      first_renovation: {
        title: 'Сделать первую реновацию орбиты',
        rewardLabel: 'Реновация отмечена'
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
      first_prestige: {
        title: 'Первая реновация',
        description: 'Сделать первую реновацию орбиты.'
      },
      comfort_50: {
        title: 'Уютно как дома',
        description: 'Достичь 50 комфорта.'
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
      residents_survive: {
        name: 'Соседи остаются',
        description: 'Жильцы не сбрасываются при реновации орбиты.'
      },
      starting_comfort: {
        name: 'Тёплый старт',
        description: 'Каждый новый цикл начинается с +5 комфорта.'
      },
      higher_offline_cap: {
        name: 'Запас хода станции',
        description: 'Лимит офлайн-дохода увеличен с 8 до 12 часов.'
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
  aboutHint2: 'Thanks for playing! Your feedback helps make the communalka cozier.',
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
      mail_tube_office: { name: 'Mail-Tube Office', role: 'Station pneumatic mail' }
    },
    residents: {
      sleepy_engineer: {
        name: 'Sleepy Engineer',
        unlockText: 'Tenant Capsule reached level 10.',
        bonusText: '+5% to capsule income'
      },
      mist_cook: {
        name: 'Mist-Planet Cook',
        unlockText: 'Cosmo-Kitchen reached level 10.',
        bonusText: '+10% to kitchen income'
      },
      vacuum_gardener: {
        name: 'Vacuum Gardener',
        unlockText: 'Oxygen Garden unlocked.',
        bonusText: '+5 comfort'
      },
      sock_master: {
        name: 'Zero-G Sock Master',
        unlockText: 'Zero-G Laundry reached level 10.',
        bonusText: '+10% to service income'
      },
      teleport_courier: {
        name: 'Teleport Courier',
        unlockText: 'Teleport Foyer unlocked.',
        bonusText: '+5% to total income'
      },
      vip_astroteenant: {
        name: 'VIP Astroteenant',
        unlockText: 'Voluntary ad bonus or a rare event.',
        bonusText: 'x2 income for 10 minutes'
      },
      retired_cosmonaut: {
        name: 'Retired Cosmonaut Neighbor',
        unlockText: 'First orbit renovation.',
        bonusText: '+10% to starting income after renovation'
      },
      three_eyed_housekeeper: {
        name: 'Three-Eyed Housekeeper',
        unlockText: 'Station comfort reached 40.',
        bonusText: '-8% to first-module cost'
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
        rewardLabel: '+2 comfort, renovation hint'
      },
      unlock_three_residents: {
        title: 'Settle 3 residents',
        rewardLabel: '+5 comfort, residents in rooms'
      },
      unlock_panorama_dome: {
        title: 'Unlock the panorama dome',
        rewardLabel: '+8 comfort, dome details'
      },
      first_renovation: {
        title: 'Perform the first orbit renovation',
        rewardLabel: 'Renovation acknowledged'
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
      first_prestige: {
        title: 'First Renovation',
        description: 'Perform the first orbit renovation.'
      },
      comfort_50: {
        title: 'Cozy as Home',
        description: 'Reach 50 comfort.'
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
      residents_survive: {
        name: 'Neighbors Stay',
        description: 'Residents are not reset on orbit renovation.'
      },
      starting_comfort: {
        name: 'Warm Start',
        description: 'Each new cycle starts with +5 comfort.'
      },
      higher_offline_cap: {
        name: 'Station Range',
        description: 'Offline income cap increased from 8 to 12 hours.'
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
