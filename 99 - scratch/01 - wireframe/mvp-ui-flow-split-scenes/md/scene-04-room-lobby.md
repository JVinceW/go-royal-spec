# 04 Room Lobby

Image mapping: `../images/scene-04-room-lobby.svg`

## Purpose

Shows all room players, ready state, and host start control.

## Layout

- Top bar:
  - Back button
  - Room label: `ROOM A7KQ`
  - Player count: `4 / 4`
  - Home icon
- Main content:
  - Four player cards: `P1`, `P2`, `P3`, `P4`
  - Host badge on `P1`
  - Avatar placeholder per player
  - Ready check per player
- Bottom row:
  - Chat icon
  - Status text: `All players ready.`
  - Host-only button: `START MATCH`
- Bottom status bar:
  - Online status
  - Version: `v0.1.0 (MVP)`

## Primary Actions

- `START MATCH` opens scene 05 when all players are ready.

## State Notes

- Room is full.
- All players are ready.
- Local player is host in the reference wireframe.
