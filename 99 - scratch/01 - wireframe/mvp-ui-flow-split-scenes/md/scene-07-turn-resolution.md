# 07 Turn Resolution

Image mapping: `../images/scene-07-turn-resolution.svg`

## Purpose

Shows deterministic turn playback and ordered events.

## Layout

- Top bar:
  - Menu icon
  - Phase: `RESOLUTION`
  - Round: `R4`
  - `LOG` button
- Main content:
  - 9x9 battlefield grid.
  - Player corner labels.
  - Safe-zone boundary.
  - Movement arrow and impact markers.
  - Unit markers with HP values.
- Bottom event strip:
  - Label: `EVENTS (IN ORDER)`
  - Event chips:
    - `1 Move`
    - `Attack (D6)`
    - `Shrink (7 -> 5)`
    - `Eliminated (P3)`

## Primary Actions

- Watch resolution playback.
- Open battle log.

## State Notes

- Player input is locked during resolution.
- Event order must match server-authoritative resolution.
