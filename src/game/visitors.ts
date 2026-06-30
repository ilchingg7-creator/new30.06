import type { GameState, VisitorRequest } from './types';

interface VisitorTemplate {
  name: string;
  flavor: string;
  costMultiplier: number;
  rewardComfort: number;
  durationMs: number;
}

const visitorTemplates: VisitorTemplate[] = [
  {
    name: 'Космический курьер',
    flavor: 'Мне нужен сухой док на 10 минут. Заплатите, и я оставлю станции хороший отзыв.',
    costMultiplier: 0.8,
    rewardComfort: 1,
    durationMs: 2 * 60 * 1_000
  },
  {
    name: 'Туманный торговец',
    flavor: 'Обменяю редкие семена на кредиты. Комфорт вашего сада вырастет.',
    costMultiplier: 1.2,
    rewardComfort: 3,
    durationMs: 3 * 60 * 1_000
  },
  {
    name: 'Бродячий механик',
    flavor: 'Подправлю вашу вентиляцию за пару кредитов. Станция станет уютнее.',
    costMultiplier: 0.5,
    rewardComfort: 2,
    durationMs: 90 * 1_000
  },
  {
    name: 'Заблудившийся турист',
    flavor: 'Я просто хотел посмотреть на звезды. Дайте мне кров, и я расскажу всем о вашей коммуналке.',
    costMultiplier: 1.5,
    rewardComfort: 4,
    durationMs: 4 * 60 * 1_000
  }
];

let visitorCounter = 0;

export function generateVisitorRequest(state: GameState, now = Date.now()): VisitorRequest | null {
  const hasModules = Object.values(state.moduleLevels).some((level) => (level as number) > 0);

  if (!hasModules || state.activeVisitor) {
    return null;
  }

  const template = visitorTemplates[Math.floor(Math.random() * visitorTemplates.length)];
  const baseCost = Math.max(50, state.credits * template.costMultiplier);
  const cost = Math.ceil(baseCost);

  visitorCounter += 1;

  return {
    id: `visitor-${now}-${visitorCounter}`,
    name: template.name,
    flavor: template.flavor,
    cost,
    rewardComfort: template.rewardComfort,
    expiresAt: now + template.durationMs
  };
}

export function acceptVisitor(state: GameState, now = Date.now()): GameState {
  const visitor = state.activeVisitor;

  if (!visitor) {
    return state;
  }

  if (state.credits < visitor.cost) {
    return state;
  }

  if (now > visitor.expiresAt) {
    return { ...state, activeVisitor: null };
  }

  return {
    ...state,
    credits: state.credits - visitor.cost,
    comfort: state.comfort + visitor.rewardComfort,
    activeVisitor: null
  };
}

export function declineVisitor(state: GameState): GameState {
  return { ...state, activeVisitor: null };
}

export function isVisitorExpired(state: GameState, now = Date.now()): boolean {
  const visitor = state.activeVisitor;

  if (!visitor) {
    return false;
  }

  return now > visitor.expiresAt;
}
