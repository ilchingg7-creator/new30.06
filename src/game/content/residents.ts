import type { ResidentDefinition } from '../types';

export const residents: ResidentDefinition[] = [
  {
    id: 'sleepy_engineer',
    name: 'Сонный инженер',
    unlockText: 'Капсула арендатора достигла 10 уровня.',
    bonusText: '+5% к доходу капсул',
    requiredModule: 'tenant_capsule',
    requiredModuleLevel: 10
  },
  {
    id: 'mist_cook',
    name: 'Повар с туманной планеты',
    unlockText: 'Космо-кухня достигла 10 уровня.',
    bonusText: '+10% к доходу кухни',
    requiredModule: 'cosmo_kitchen',
    requiredModuleLevel: 10
  },
  {
    id: 'vacuum_gardener',
    name: 'Садовник вакуума',
    unlockText: 'Открыт кислородный сад.',
    bonusText: '+5 комфорта',
    requiredModule: 'oxygen_garden',
    requiredModuleLevel: 1
  },
  {
    id: 'sock_master',
    name: 'Мастер носков в невесомости',
    unlockText: 'Прачечная невесомости достигла 10 уровня.',
    bonusText: '+10% к сервисному доходу',
    requiredModule: 'zero_g_laundry',
    requiredModuleLevel: 10
  },
  {
    id: 'teleport_courier',
    name: 'Курьер через телепорт',
    unlockText: 'Открыта телепорт-прихожая.',
    bonusText: '+5% к общему доходу',
    requiredModule: 'teleport_entry',
    requiredModuleLevel: 1
  },
  {
    id: 'vip_astroteenant',
    name: 'VIP-астроарендатор',
    unlockText: 'Добровольный рекламный бонус или редкое событие.',
    bonusText: 'x2 доход на 10 минут',
    requiredComfort: 25
  },
  {
    id: 'retired_cosmonaut',
    name: 'Сосед-отставной космонавт',
    unlockText: 'Первая реновация орбиты.',
    bonusText: '+10% к стартовому доходу после реновации',
    requiredComfort: 0
  },
  {
    id: 'three_eyed_housekeeper',
    name: 'Трёхглазая комендантша',
    unlockText: 'Комфорт станции достиг 40.',
    bonusText: '-8% к цене первых модулей',
    requiredComfort: 40
  }
];
