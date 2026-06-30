import { useGameState } from './ui/useGameState';
import { DesktopLayout } from './ui/layouts/DesktopLayout';
import { MobileLayout } from './ui/layouts/MobileLayout';
import { DailyLoginDialog } from './ui/screens/DailyLoginDialog';
import { LoadingScreen } from './ui/screens/LoadingScreen';
import { OfflineRewardDialog } from './ui/screens/OfflineRewardDialog';

export function App() {
  const game = useGameState();

  if (!game.ready) {
    return <LoadingScreen />;
  }

  return (
    <main className="app-shell">
      <header className="app-title">
        <p className="eyebrow">Retro Soviet Space Cozy</p>
        <h1>Космическая коммуналка</h1>
      </header>
      <div className="desktop-only">
        <DesktopLayout game={game} />
      </div>
      <div className="mobile-only">
        <MobileLayout game={game} />
      </div>
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
