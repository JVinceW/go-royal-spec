# 06 Battle Planning

Image mapping: `../images/scene-06-battle-planning.svg`

## Purpose

Main turn-planning screen where a player builds and confirms a plan.

## Layout

- Top bar:
  - Menu icon
  - Phase: `PLANNING`
  - Round: `R4`
  - Shrink preview: `7 -> 5`
  - Ready count: `2 / 4`
  - `LOG` button
- Main content:
  - 9x9 battlefield grid.
  - Player corner labels.
  - Safe-zone boundary.
  - Planned movement path.
  - Target marker and attack preview.
  - Unit markers with HP values.
- Bottom action bar:
  - Selected unit summary: `INFANTRY`, `HP 8 / 10`, `SAFE`
  - AP display: `3 / 5`
  - Plan slots:
    - `1 Move`
    - `2 Move`
    - `3 Attack (D6)`
  - `CLEAR`
  - `CONFIRM`

## Primary Actions

- Select unit.
- Queue move and attack actions.
- Clear current plan.
- Confirm turn plan.
- Open battle log.

## State Notes

- Plans are hidden from other players until resolution.
- Client preview is non-authoritative.
