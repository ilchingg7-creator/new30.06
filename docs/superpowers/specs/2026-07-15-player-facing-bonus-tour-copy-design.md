# Player-Facing Bonus Tour Copy

## Goal

Rewrite the Russian body text of the onboarding step titled «Бонусы» as direct guidance for a player. The text must explain that advertising unlocks bonuses without mentioning Yandex Games, local mode, platform differences, or implementation behavior.

## Final Copy

> Хотите больше дохода? Смотрите рекламу, удваивайте аренду и приглашайте VIP-жильца. А за ежедневный вход вас ждут награды.

## Scope

- Change only the Russian `tourStepBonusesBody` localization string.
- Preserve the step title, layout, pagination, other languages, tooltips, and bonus mechanics.
- Add a regression test that verifies the exact approved text and rejects references to Yandex Games or local mode in this onboarding message.

## Success Criteria

- The fourth onboarding step shows the approved player-facing text.
- The text mentions advertising, doubled rent, the VIP resident, and daily-login rewards.
- The text contains no platform or developer-oriented explanation.
- Existing localization and UI tests remain green.
