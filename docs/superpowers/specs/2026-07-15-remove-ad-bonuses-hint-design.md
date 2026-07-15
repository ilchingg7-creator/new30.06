# Remove the Local Ad Bonuses Hint

## Goal

Remove the informational paragraph shown in the Bonuses panel when rewarded ads are unavailable:

> Рекламные бонусы доступны на Yandex Games. Локально бонусы включаются сразу.

The rest of the Bonuses panel and all advertising explanations in help content and button tooltips remain unchanged.

## Implementation Design

- Remove the conditional `adBonusesHint` paragraph from `BonusPanel`.
- Remove the now-unused `adBonusesHint` field from the `Translation` type and from both Russian and English translation objects.
- Do not replace the paragraph with an empty element or CSS hiding rule, so it no longer occupies layout space or appears in the accessibility tree.

## Verification

- Add or update a `BonusPanel` component test so the removed Russian copy is absent when `adsAvailable` is false.
- Run the focused component test first, then the complete project test suite.

## Out of Scope

- Advertising behavior and bonus activation logic.
- Help dialog copy, onboarding copy, and button tooltips.
- Styling of other `.panel-copy` elements.
