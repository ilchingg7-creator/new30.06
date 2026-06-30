import { HelpCircle, Settings, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useGameState } from './ui/useGameState';
import { DesktopLayout } from './ui/layouts/DesktopLayout';
import { MobileLayout } from './ui/layouts/MobileLayout';
import { DailyLoginDialog } from './ui/screens/DailyLoginDialog';
import { HelpOverlay } from './ui/screens/HelpOverlay';
import { LoadingScreen } from './ui/screens/LoadingScreen';
import { OfflineRewardDialog } from './ui/screens/OfflineRewardDialog';
import { SettingsDialog } from './ui/screens/SettingsDialog';
import { VisitorDialog } from './ui/screens/VisitorDialog';

const HELP_SEEN_KEY = 'cosmic-communalka-help-seen';
const MOBILE_BREAKPOINT = 900;
const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

function hasSeenHelp(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }

  return window.localStorage.getItem(HELP_SEEN_KEY) === '1';
}

function markHelpSeen(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(HELP_SEEN_KEY, '1');
  }
}

function getIsMobileViewport() {
  if (typeof window === 'undefined') {
    return false;
  }

  if (typeof window.matchMedia === 'function') {
    return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
  }

  return (window.visualViewport?.width ?? window.innerWidth) < MOBILE_BREAKPOINT;
}

export function App() {
  const game = useGameState();
  const [isMobileViewport, setIsMobileViewport] = useState(getIsMobileViewport);
  const [showHelp, setShowHelp] = useState(() => !hasSeenHelp());
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const updateViewport = () => {
      setIsMobileViewport(getIsMobileViewport());
    };
    const mobileMedia = typeof window.matchMedia === 'function' ? window.matchMedia(MOBILE_MEDIA_QUERY) : null;
    const visualViewport = window.visualViewport ?? null;

    updateViewport();
    window.addEventListener('resize', updateViewport);
    visualViewport?.addEventListener('resize', updateViewport);

    if (mobileMedia?.addEventListener) {
      mobileMedia.addEventListener('change', updateViewport);
    } else {
      mobileMedia?.addListener(updateViewport);
    }

    return () => {
      window.removeEventListener('resize', updateViewport);
      visualViewport?.removeEventListener('resize', updateViewport);

      if (mobileMedia?.removeEventListener) {
        mobileMedia.removeEventListener('change', updateViewport);
      } else {
        mobileMedia?.removeListener(updateViewport);
      }
    };
  }, []);

  const closeHelp = () => {
    markHelpSeen();
    setShowHelp(false);
  };

  if (!game.ready) {
    return <LoadingScreen />;
  }

  return (
    <main className="app-shell">
      <header className="app-title">
        <p className="eyebrow">Retro Soviet Space Cozy</p>
        <div className="title-row">
          <h1>Космическая коммуналка</h1>
          <button
            type="button"
            className="sound-toggle"
            onClick={() => setShowHelp(true)}
            aria-label="Как играть"
            title="Как играть"
          >
            <HelpCircle aria-hidden="true" size={18} />
          </button>
          <button
            type="button"
            className="sound-toggle"
            onClick={() => setShowSettings(true)}
            aria-label="Настройки"
            title="Настройки"
          >
            <Settings aria-hidden="true" size={18} />
          </button>
          <button
            type="button"
            className="sound-toggle"
            onClick={game.toggleSound}
            aria-label={game.soundMuted ? 'Включить звук' : 'Выключить звук'}
            title={game.soundMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {game.soundMuted ? <VolumeX aria-hidden="true" size={18} /> : <Volume2 aria-hidden="true" size={18} />}
          </button>
        </div>
      </header>
      {isMobileViewport ? <MobileLayout game={game} /> : <DesktopLayout game={game} />}
      {game.offlineReward && (
        <OfflineRewardDialog
          seconds={game.offlineReward.seconds}
          credits={game.offlineReward.credits}
          onCollect={game.dismissOfflineReward}
          onDouble={game.doubleOfflineReward}
          adsAvailable={game.adsAvailable}
          adPending={game.adPending}
        />
      )}
      {game.dailyReward && (
        <DailyLoginDialog
          streak={game.dailyReward.streak}
          credits={game.dailyReward.credits}
          onCollect={game.dismissDailyReward}
        />
      )}
      {game.gameState.activeVisitor && (
        <VisitorDialog
          visitor={game.gameState.activeVisitor}
          canAfford={game.gameState.credits >= game.gameState.activeVisitor.cost}
          onAccept={game.acceptVisitor}
          onDecline={game.declineVisitor}
        />
      )}
      {showHelp && <HelpOverlay onClose={closeHelp} />}
      {showSettings && <SettingsDialog onClose={() => setShowSettings(false)} onResetSave={game.resetSave} />}
    </main>
  );
}
