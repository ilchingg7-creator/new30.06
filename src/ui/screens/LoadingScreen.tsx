import type { Translation } from '../../platform/i18n';

interface LoadingScreenProps {
  t: Translation;
}

export function LoadingScreen({ t }: LoadingScreenProps) {
  return (
    <main className="loading-screen">
      <p className="eyebrow">{t.eyebrow}</p>
      <h1>{t.appTitle}</h1>
      <strong>{t.loadingHint}</strong>
      <p>{t.loadingBody}</p>
    </main>
  );
}
