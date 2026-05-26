# @vought/ui

Shared React components. Every interactive surface in the product uses these.

## Categories

- **Primitives** — Container, Section, Stack, Cluster, Grid, Spacer
- **Inputs** — Button, IconButton, TextField, Select, Toggle
- **Display** — Card, Pill, Badge, Avatar, MetricTile
- **Feedback** — Toast (rare), Banner, Skeleton, ErrorState
- **Layout** — Sidebar, TopBar, CommandPalette, Modal
- **Live** — StatePill, SuggestionCard, SpeakerTimeline, WordStream

## Conventions

- Variants via `class-variance-authority`
- Forward refs always
- Storybook story per (variant × size × state)
- No raw colors, pixels, durations

Audit via `/vought-verify-tokens`.
