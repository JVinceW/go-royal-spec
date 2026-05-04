# 08 Player Eliminated

Image mapping: `../images/scene-08-player-eliminated.svg`

## Purpose

Notifies a player that all of their units have been defeated.

## Layout

- Background:
  - Dimmed battle resolution screen.
  - Player `P3` marked as eliminated in the grid corner.
- Center modal:
  - Skull icon
  - Title: `YOU ARE ELIMINATED`
  - Message: `All your units have been defeated.`
  - Button: `CONTINUE WATCHING`
- Bottom modal strip:
  - Remaining players: `P1`, `P2`, `P4`
  - Status: `REMAIN`

## Primary Actions

- `CONTINUE WATCHING` returns to spectator view.

## State Notes

- Eliminated player can keep watching.
- Eliminated player cannot submit new plans.
