Minecraft Gabgool — Multiplayer Minecraft mob guessing game

A fast-paced multiplayer quiz where you and friends join a room, guess Minecraft mob faces, and race to rack up the highest score.

Twist: Every correct guess advances the shared room mob, so the whole group stays synced and each correct answer changes the next challenge for everyone.

Live URL: Not deployed yet. Add your deployment URL here once the game is hosted.

How to play:
1. Run the server locally with `npm install` and `npm start`.
2. Open `http://localhost:3000` in your browser and enter a player name.
3. Create a new room or join an existing room using a room code.
4. Guess the Minecraft mob from the picture using the provided answer buttons.
5. Correct answers increase your score and update the shared mob for all players in the room; wrong answers increase your wrong count.

APIs used:
- Express: https://expressjs.com/
- Socket.IO: https://socket.io/
- Clipboard API: https://developer.mozilla.org/docs/Web/API/Clipboard_API

Architecture notes:
- `server.js` serves the static front-end files and manages multiplayer rooms, scores, and real-time events via Socket.IO.
- `package.json` defines the project dependencies and the `start`/`dev` scripts.
- `index.html` is the lobby/start page where players enter a room code, create a room, and begin the game.
- `game.html` is the main game interface that displays the mob image, answer options, score, multiplayer status, and slot machine.
- `script.js` contains the client-side logic for room navigation, Socket.IO connection, mob selection, scoring, UI rendering, and slot-machine bonus behavior.
- `styles.css` defines the visual styling for both the lobby and the game screens.
