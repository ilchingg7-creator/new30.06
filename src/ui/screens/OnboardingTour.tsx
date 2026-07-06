'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, SkipForward, X } from 'lucide-react';
import type { Translation } from '../../platform/i18n';

interface OnboardingTourProps {
  onClose(): void;
  t: Translation;
}

interface TourStep {
  target: string;
  title: string;
  body: string;
  placement: 'bottom' | 'right' | 'top' | 'left';
}

function buildTourSteps(t: Translation): TourStep[] {
  return [
    {
      target: '[data-tour="station-view"]',
      title: t.tourStepStation,
      body: t.tourStepStationBody,
      placement: 'bottom'
    },
    {
      target: '[data-tour="modules"]',
      title: t.tourStepModules,
      body: t.tourStepModulesBody,
      placement: 'right'
    },
    {
      target: '[data-tour="goals"]',
      title: t.tourStepGoals,
      body: t.tourStepGoalsBody,
      placement: 'right'
    },
    {
      target: '[data-tour="bonuses"]',
      title: t.tourStepBonuses,
      body: t.tourStepBonusesBody,
      placement: 'left'
    },
    {
      target: '[data-tour="stats"]',
      title: t.tourStepStats,
      body: t.tourStepStatsBody,
      placement: 'bottom'
    }
  ];
}

export function OnboardingTour({ onClose, t }: OnboardingTourProps) {
  const steps = buildTourSteps(t);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  useEffect(() => {
    function updateRect() {
      const el = document.querySelector(currentStep.target);

      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    }

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);

    const interval = window.setInterval(updateRect, 200);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
      window.clearInterval(interval);
    };
  }, [currentStep.target]);

  function handleNext() {
    if (isLast) {
      onClose();
    } else {
      setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    }
  }

  function handlePrev() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  function getTooltipStyle(): React.CSSProperties {
    if (!targetRect) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const padding = 16;
    const tooltipWidth = 320;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top: number;
    let left: number;

    if (currentStep.placement === 'bottom') {
      top = targetRect.bottom + padding;
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
    } else if (currentStep.placement === 'right') {
      top = targetRect.top + targetRect.height / 2 - 60;
      left = targetRect.right + padding;
    } else {
      top = targetRect.top + targetRect.height / 2 - 60;
      left = targetRect.left - tooltipWidth - padding;
    }

    left = Math.max(padding, Math.min(left, viewportWidth - tooltipWidth - padding));
    top = Math.max(padding, Math.min(top, viewportHeight - 200));

    return { top, left, width: tooltipWidth, transform: 'none' };
  }

  const spotlightStyle: React.CSSProperties = targetRect
    ? {
        boxShadow: `0 0 0 9999px rgb(8 16 28 / 82%), 0 0 0 4px var(--color-signal-red), 0 0 24px 4px rgb(199 62 58 / 40%)`,
        borderRadius: '8px',
        position: 'fixed',
        top: targetRect.top - 4,
        left: targetRect.left - 4,
        width: targetRect.width + 8,
        height: targetRect.height + 8,
        pointerEvents: 'none',
        transition: 'all 0.3s ease',
        zIndex: 9998
      }
    : {
        position: 'fixed',
        inset: 0,
        background: 'rgb(8 16 28 / 82%)',
        zIndex: 9998
      };

  return (
    <div className="tour-overlay" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      <div style={spotlightStyle} />
      <div className="tour-tooltip" style={getTooltipStyle()}>
        <header className="tour-tooltip-header">
          <span className="tour-progress-label">
            {t.tourStep} {stepIndex + 1}/{steps.length}
          </span>
          <button type="button" className="tour-close" onClick={onClose} aria-label={t.tourSkip}>
            <X aria-hidden="true" size={16} />
          </button>
        </header>
        <h3 id="tour-title" className="tour-tooltip-title">{currentStep.title}</h3>
        <p className="tour-tooltip-body">{currentStep.body}</p>
        <div className="tour-dots">
          {steps.map((_, i) => (
            <span
              key={i}
              className={i === stepIndex ? 'tour-dot active' : 'tour-dot'}
              aria-hidden="true"
            />
          ))}
        </div>
        <footer className="tour-tooltip-actions">
          {stepIndex > 0 ? (
            <button type="button" className="tour-btn tour-btn-secondary" onClick={handlePrev}>
              <ArrowLeft aria-hidden="true" size={14} />
              {t.tourPrev}
            </button>
          ) : (
            <button type="button" className="tour-btn tour-btn-secondary" onClick={onClose}>
              <SkipForward aria-hidden="true" size={14} />
              {t.tourSkip}
            </button>
          )}
          <button type="button" className="tour-btn tour-btn-primary" onClick={handleNext}>
            {isLast ? t.tourDone : t.tourNext}
            {!isLast ? <ArrowRight aria-hidden="true" size={14} /> : null}
          </button>
        </footer>
      </div>
    </div>
  );
}
