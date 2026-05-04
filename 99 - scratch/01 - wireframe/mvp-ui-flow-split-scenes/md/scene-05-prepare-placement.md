# 05 Prepare Placement

Image mapping: `../images/scene-05-prepare-placement.svg`

## Purpose

Lets a player place starting units inside their formation zone.

## Layout

- Top bar:
  - Back button
  - Ready count: `1 / 4 READY`
- Main content:
  - 9x9 battlefield grid with row and column labels.
  - Four corner formation zones:
    - `P1 YOUR ZONE`
    - `P2 ZONE`
    - `P3 ZONE`
    - `P4 ZONE`
  - Initial P1 unit placement:
    - Infantry
    - Archer
    - Cavalry
- Right panel:
  - Header: `YOUR UNITS`
  - Unit inventory cards:
    - `INF x1`
    - `ARC x1`
    - `CAV x1`
- Bottom toolbar:
  - Placement instruction
  - Unit selection buttons
  - `READY` button

## Primary Actions

- Select a unit type.
- Place selected unit in local formation zone.
- `READY` locks placement and waits for other players.

## State Notes

- Only local formation zone is editable.
- Enemy zones are visible but not editable.
