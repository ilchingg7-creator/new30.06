# Offline Income Rebalance Implementation Plan

**Goal:** Reduce offline progression inflation while preserving a free return reward and a voluntary rewarded-ad multiplier.

## Global Constraints

- Base offline cap is 3 hours at 50% of normal income.
- Legacy `higher_offline_cap` raises the cap to 4.5 hours.
- Active `offline_cap_16h` raises the cap to 6 hours.
- Resident `comet_plumber` adds 1 hour to whichever cap applies, including the 6-hour cap.
- Rewarded video continues to add one additional copy of the calculated base reward, producing x2 total.
- Timed income boosts and timed VIP multipliers must not affect offline income.
- Existing prestige IDs and saved ownership remain valid; no IAP is added in this change.
- RU and EN copy must describe the new values accurately and in player-facing language.
- Leaderboard scoring and purchases are out of scope until monetization analytics justify the permanent product.

## Task 1: Core Formula and Tests

Modify `src/game/economy.ts` and focused tests in `src/test/economy.test.ts` and `src/test/prestige-upgrades.test.ts`.

- Add failing tests for 3-hour base cap at 50%, 4.5/6-hour prestige caps, plumber stacking to 7 hours, and timed boosts not affecting offline rewards.
- Implement the smallest API change that calculates normal income without timed multipliers for offline rewards.
- Keep live income calculations unchanged.
- Run the focused economy and prestige tests.

## Task 2: Player Copy and UI Tests

Modify `src/platform/i18n.ts` and relevant screen/copy tests.

- Update the offline reward explanation and both prestige upgrade descriptions in RU and EN.
- Make the dialog clearly state that station automation works at 50% and only for the counted period.
- Keep rewarded copy explicit: watching an ad doubles the displayed offline result.
- Run focused screen and localization tests.

## Task 3: Integration Verification

- Review all changes for spec compliance and code quality.
- Run `npm test`, `npm run build`, and `git diff --check`.
- Commit all implementation and plan files together.
