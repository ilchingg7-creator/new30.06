import { useEffect, useState } from 'react';
import { useGameState } from './ui/useGameState';
import { DesktopLayout } from './ui/layouts/DesktopLayout';
import { MobileLayout } from './ui/layouts/MobileLayout';
import { DailyLoginDialog } from './ui/screens/DailyLoginDialog';
import { LoadingScreen } from './ui/screens/LoadingScreen';
import { OfflineRewardDialog } from './ui/screens/OfflineRewardDialog';

const MOBILE_BREAKPOINT = 900;

function getIsMobileViewport() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.innerWidth < MOBILE_BREAKPOINT;
}

export function App() {
  const game = useGameState();
  const [isMobileViewport, setIsMobileViewport] = useState(getIsMobileViewport);

  useEffect(() => {
    const updateViewport = () => {
      setIsMobileViewport(getIsMobileViewport());
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);

    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  if (!game.ready) {
    return <LoadingScreen />;
  }

  return (
    <main className="app-shell">
      <header className="app-title">
        <p className="eyebrow">Retro Soviet Space Cozy</p>
        <h1>Космическая коммуналка</h1>
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
    </main>
  );
}
