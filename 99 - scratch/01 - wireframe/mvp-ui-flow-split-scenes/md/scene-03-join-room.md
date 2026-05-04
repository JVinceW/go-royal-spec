# 03 Join Room

Image mapping: `../images/scene-03-join-room.svg`

## Purpose

Lets a player enter a 4-letter room code and join an existing room.

## Layout

- Top bar:
  - Back button
  - Title: `JOIN ROOM`
  - Home icon
- Center content:
  - Label: `ENTER ROOM CODE`
  - Text field placeholder: `Enter 4-letter code`
  - Primary button: `JOIN ROOM`
  - Error message area: `Invalid or full room.`
- Bottom status bar:
  - Online status
  - Version: `v0.1.0 (MVP)`

## Primary Actions

- `JOIN ROOM` submits the room code.
- Successful join opens scene 04.

## State Notes

- Error area appears for invalid code, full room, or join failure.
