import { HelpCircle, Info, RotateCcw, Settings, Volume2, VolumeX, X } from 'lucide-react';
import { useState } from 'react';
import type { Language, Translation } from '../../platform/i18n';

interface SettingsDialogProps {
  onClose(): void;
  onOpenHelp?(): void;
  onResetSave(): void;
  onToggleSound?(): void;
  soundMuted?: boolean;
  t: Translation;
  language: Language;
  onLanguageChange(lang: Language): void;
}

export function SettingsDialog({
  onClose,
  onOpenHelp,
  onResetSave,
  onToggleSound,
  soundMuted = false,
  t,
  language,
  onLanguageChange
}: SettingsDialogProps) {
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
    <div className="dialog-backdrop" role="presentation">
      <section className="dialog-panel help-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <header className="help-header">
          <h2 id="settings-title">
            <Settings aria-hidden="true" size={18} style={{ verticalAlign: 'middle' }} /> {t.settingsTitle}
          </h2>
          <button type="button" className="help-close" onClick={onClose} aria-label={t.close}>
            <X aria-hidden="true" size={18} />
          </button>
        </header>

        {(onOpenHelp || onToggleSound) && (
          <div className="settings-section">
            <h3>
              <Settings aria-hidden="true" size={16} /> {t.settings}
            </h3>
            <div className="settings-action-list">
              {onOpenHelp && (
                <button type="button" className="settings-action" onClick={onOpenHelp}>
                  <HelpCircle aria-hidden="true" size={16} />
                  {t.howToPlay}
                </button>
              )}
              {onToggleSound && (
                <button
                  type="button"
                  className="settings-action"
                  onClick={onToggleSound}
                  aria-label={soundMuted ? t.soundOn : t.soundOff}
                >
                  {soundMuted ? <VolumeX aria-hidden="true" size={16} /> : <Volume2 aria-hidden="true" size={16} />}
                  {soundMuted ? t.soundOn : t.soundOff}
                </button>
              )}
            </div>
          </div>
        )}

        <div className="settings-section">
          <h3>
            <RotateCcw aria-hidden="true" size={16} /> {t.resetSave}
          </h3>
          <p className="panel-copy">{t.resetSaveDesc}</p>
          <button
            type="button"
            className={confirmReset ? 'settings-confirm' : 'settings-reset'}
            onClick={handleReset}
          >
            {confirmReset ? t.confirmReset : t.resetProgress}
          </button>
        </div>

        <div className="settings-section">
          <h3>{t.language}</h3>
          <div className="language-switcher">
            <button
              type="button"
              className={language === 'ru' ? 'language-option active' : 'language-option'}
              onClick={() => onLanguageChange('ru')}
              aria-pressed={language === 'ru'}
            >
              {t.russian}
            </button>
            <button
              type="button"
              className={language === 'en' ? 'language-option active' : 'language-option'}
              onClick={() => onLanguageChange('en')}
              aria-pressed={language === 'en'}
            >
              {t.english}
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h3>
            <Info aria-hidden="true" size={16} /> {t.about}
          </h3>
          <p className="panel-copy">{t.aboutText}</p>
          <p className="panel-copy">{t.aboutHint1}</p>
          <p className="panel-copy">{t.aboutHint2}</p>
        </div>
      </section>
    </div>
  );
}
