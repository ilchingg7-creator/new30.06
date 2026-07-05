import type { ActionPreview, ActionPreviewTag, LastActionFeedback } from '../../game/types';
import type { Translation } from '../../platform/i18n';

interface ActionPreviewLineProps {
  preview: ActionPreview | LastActionFeedback;
  t: Translation;
  variant?: 'default' | 'compact';
}

function getTagLabel(tag: ActionPreviewTag, t: Translation): string {
  switch (tag) {
    case 'income':
      return t.previewTagIncome;
    case 'comfort':
      return t.previewTagComfort;
    case 'condition':
      return t.previewTagCondition;
    case 'resident':
      return t.previewTagResident;
    case 'role':
      return t.previewTagRole;
    case 'visual':
      return t.previewTagVisual;
    case 'renovation':
      return t.previewTagRenovation;
    case 'timed_bonus':
      return t.previewTagTimedBonus;
    case 'cost':
      return t.previewTagCost;
  }
}

export function ActionPreviewLine({ preview, t, variant = 'default' }: ActionPreviewLineProps) {
  const detail = 'detail' in preview ? preview.detail : preview.result;
  const reason = 'reason' in preview ? preview.reason : undefined;

  return (
    <div className={variant === 'compact' ? 'action-preview compact' : 'action-preview'}>
      <div className="action-preview-text">
        <strong>{preview.title}</strong>
        {reason ? <span>{reason}</span> : null}
        <small>{detail}</small>
      </div>
      {preview.tags.length > 0 ? (
        <div className="action-preview-tags" aria-label={t.previewTags}>
          {preview.tags.map((tag) => (
            <span className={`action-preview-tag tag-${tag}`} key={tag}>
              {getTagLabel(tag, t)}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
