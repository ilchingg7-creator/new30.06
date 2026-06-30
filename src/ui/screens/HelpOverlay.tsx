'use client';

import { motion } from 'framer-motion';
import { HelpCircle, Home, RotateCcw, Sparkles, Target, X } from 'lucide-react';

interface HelpOverlayProps {
  onClose(): void;
}

const helpSections = [
  {
    icon: Home,
    title: 'Комнаты',
    body: 'Покупайте уровни модулей за кредиты. Каждый модуль даёт доход в секунду и повышает комфорт станции. На уровнях 10, 25, 50 и 100 модуль получает множитель дохода.'
  },
  {
    icon: Target,
    title: 'Цели',
    body: 'Цели направляют развитие станции. Награды — комфорт, визуальные детали или временные бусты. Завершённые цели исчезают из списка.'
  },
  {
    icon: Sparkles,
    title: 'Бонусы',
    body: 'На Yandex Games бонусы включаются за просмотр рекламы (x2 аренда на 5 мин, VIP-жилец на 10 мин). Локально — сразу.'
  },
  {
    icon: RotateCcw,
    title: 'Реновация орбиты',
    body: 'Сбрасывает кредиты и модули, но сохраняет репутацию. Репутация покупает постоянные улучшения (жильцы выживают, тёплый старт, больше офлайн-лимит).'
  }
];

export function HelpOverlay({ onClose }: HelpOverlayProps) {
  return (
    <motion.div
      className="dialog-backdrop"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
    >
      <motion.section
        className="dialog-panel help-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        initial={{ scale: 0.92, y: 12, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      >
        <header className="help-header">
          <h2 id="help-title">
            <HelpCircle aria-hidden="true" size={18} style={{ verticalAlign: 'middle' }} /> Как играть
          </h2>
          <button type="button" className="help-close" onClick={onClose} aria-label="Закрыть">
            <X aria-hidden="true" size={18} />
          </button>
        </header>
        <ul className="help-list">
          {helpSections.map((section) => {
            const Icon = section.icon;

            return (
              <li key={section.title} className="help-item">
                <Icon aria-hidden="true" size={20} />
                <div>
                  <strong>{section.title}</strong>
                  <p>{section.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <button type="button" onClick={onClose} className="help-start">
          Понятно, начать играть
        </button>
      </motion.section>
    </motion.div>
  );
}
