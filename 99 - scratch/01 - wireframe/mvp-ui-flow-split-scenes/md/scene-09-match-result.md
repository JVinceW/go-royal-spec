# 09 Match Result

Image mapping: `../images/scene-09-match-result.svg`

## Purpose

Shows final match winner and standings.

## Layout

- Top bar:
  - Menu icon
  - Home icon
- Main content:
  - Winner panel:
    - Label: `WINNER`
    - Trophy icon
    - Winner: `P2`
  - Final battlefield snapshot.
  - Final standings panel:
    - `1 P2`
    - `2 P1`
    - `3 P4`
    - `4 P3`
- Bottom actions:
  - `PLAY AGAIN`
  - `BACK TO ROOM`
- Bottom status bar:
  - Online status
  - Version: `v0.1.0 (MVP)`

## Primary Actions

- `PLAY AGAIN` starts another match flow.
- `BACK TO ROOM` returns to room lobby.

## State Notes

- Match is complete.
- Winner and standings are server-authoritative.
