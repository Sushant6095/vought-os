# @vought/design-system

Canonical design tokens and Tailwind config for the entire Vought product.

## Exports

- `tokens.ts` — color, type, spacing, motion as TypeScript constants
- `tailwind.config.ts` — Tailwind preset extending theme from tokens
- `global.css` — root CSS with breath animation, font-face declarations

## Source of truth

See `vault/20 · Design System/Tokens · Color.md`, `Tokens · Typography.md`, `Motion · Timing Table.md`.

When tokens change, the vault note is updated FIRST, then this package, then a sweep across all apps.
