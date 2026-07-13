# Wrapping Truncated UI Copy

## Goal

Show complete interface copy by allowing it to wrap instead of replacing the end with an ellipsis. Player names in the leaderboard remain single-line and truncated because their length is unbounded user content.

## Scope

Update the wrapping behavior for:

- room names in the income breakdown;
- compact station-task descriptions;
- compact communal-duty copy;
- inline action-preview details;
- incident-choice labels and descriptions.

No React components, translations, dimensions, or leaderboard styles change.

## CSS behavior

Each in-scope text rule uses normal whitespace and permits emergency breaks for unusually long tokens:

```css
white-space: normal;
overflow-wrap: anywhere;
```

The rules must not use `text-overflow: ellipsis`. Text containers must not hide overflowing copy. The existing compact incident-journal override is kept consistent with this behavior.

## Verification

A focused CSS regression test reads `src/styles/global.css` and verifies:

- every in-scope selector enables wrapping and contains neither ellipsis nor `nowrap`;
- `.leaderboard-name` still uses `text-overflow: ellipsis` and `white-space: nowrap`.

Run the focused test first, then the complete test suite.
