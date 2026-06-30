'use client';

import { motion } from 'framer-motion';
import { Info, RotateCcw, Settings, X } from 'lucide-react';
import { useState } from 'react';

interface SettingsDialogProps {
  onClose(): void;
  onResetSave(): void;
}

export function SettingsDialog({ onClose, onResetSave }: SettingsDialogProps) {
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }

    onResetSave();
    setConfirmReset(false);
    onClose();
  };

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
        aria-labelledby="settings-title"
        initial={{ scale: 0.92, y: 12, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      >
        <header className="help-header">
          <h2 id="settings-title">
            <Settings aria-hidden="true" size={18} style={{ verticalAlign: 'middle' }} /> Настройки
          </h2>
          <button type="button" className="help-close" onClick={onClose} aria-label="Закрыть">
            <X aria-hidden="true" size={18} />
          </button>
        </header>

        <div className="settings-section">
          <h3>
            <RotateCcw aria-hidden="true" size={16} /> Сбросить сохранение
          </h3>
          <p className="panel-copy">
            Полностью стирает прогресс: кредиты, модули, жильцов, достижения и репутацию. Действие необратимо.
          </p>
          <button
            type="button"
            className={confirmReset ? 'settings-confirm' : 'settings-reset'}
            onClick={handleReset}
          >
            {confirmReset ? 'Нажмите ещё раз для подтверждения' : 'Сбросить прогресс'}
          </button>
        </div>

        <div className="settings-section">
          <h3>
            <Info aria-hidden="true" size={16} /> О игре
          </h3>
          <p className="panel-copy">
            <strong>Космическая коммуналка</strong> — уютная idle-игра про старую орбитальную коммуналку.
          </p>
          <p className="panel-copy">
            Стиль: Retro Soviet Space Cozy. Платформа: Yandex Games.
          </p>
          <p className="panel-copy">
            Версия: 0.2.0 · Стек: Vite + React 19 + PixiJS 8 + TypeScript
          </p>
        </div>
      </motion.section>
    </motion.div>
  );
}
