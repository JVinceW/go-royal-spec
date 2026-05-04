# 02 Create Room

Image mapping: `../images/scene-02-create-room.svg`

## Purpose

Shows the host a generated room code and lets them enter the lobby.

## Layout

- Top bar:
  - Back button
  - Title: `CREATE ROOM`
  - Home icon
- Center content:
  - Label: `YOUR ROOM CODE`
  - Large room code: `A7KQ`
  - Button row:
    - `COPY CODE`
    - `ENTER LOBBY`
  - Helper text: `Share code with 3 players.`
- Bottom status bar:
  - Online status
  - Version: `v0.1.0 (MVP)`

## Primary Actions

- `COPY CODE` copies the generated room code.
- `ENTER LOBBY` opens scene 04 as host.

## State Notes

- Room exists.
- Local player is host.
- Room code is visible and shareable.
