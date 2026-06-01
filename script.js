function goToGame() {
    window.location.href = 'game.html';
}

function goHome() {
    window.location.href = 'index.html';
}

// --- Multiplayer room helpers (start screen) ---
function createRoom() {
    // generate a short human-friendly room code and show it on the Start screen
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const roomInput = document.getElementById('roomCode');
    if (roomInput) roomInput.value = code;
    const display = document.getElementById('roomDisplay');
    const gen = document.getElementById('generatedRoom');
    const openBtn = document.getElementById('openRoomBtn');
    const copyBtn = document.getElementById('copyRoomBtn');
    if (display) display.textContent = code;
    if (gen) gen.style.display = 'block';
    if (openBtn) openBtn.style.display = 'inline-block';
    if (copyBtn) copyBtn.style.display = 'inline-block';
}

function openRoom() {
    const room = document.getElementById('roomCode') ? document.getElementById('roomCode').value.trim().toUpperCase() : '';
    const name = document.getElementById('playerName') ? document.getElementById('playerName').value.trim() : '';
    if (!room) {
        alert('No room code found. Create a room first.');
        return;
    }
    window.location.href = `game.html?room=${encodeURIComponent(room)}&name=${encodeURIComponent(name)}`;
}

function copyRoomCode() {
    const room = document.getElementById('roomCode') ? document.getElementById('roomCode').value.trim().toUpperCase() : '';
    if (!room) return;
    navigator.clipboard.writeText(room).then(() => {
        const btn = document.getElementById('copyRoomBtn');
        if (btn) {
            const old = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => btn.textContent = old, 1500);
        }
    }).catch(() => alert('Copy failed — select and copy manually.'));
}

function joinRoom() {
    const room = document.getElementById('roomCode') ? document.getElementById('roomCode').value.trim().toUpperCase() : '';
    const name = document.getElementById('playerName') ? document.getElementById('playerName').value.trim() : '';
    if (!room) {
        alert('Enter a room code to join.');
        return;
    }
    window.location.href = `game.html?room=${encodeURIComponent(room)}&name=${encodeURIComponent(name)}`;
}

function getQueryParams() {
    const qp = {};
    location.search.slice(1).split('&').forEach(pair => {
        if (!pair) return;
        const [k, v] = pair.split('=');
        qp[decodeURIComponent(k)] = decodeURIComponent(v || '');
    });
    return qp;
}

let socket = null;
let roomCode = null;
let playerName = null;

function connectToRoomIfNeeded() {
    const params = getQueryParams();
    if (!params.room) return;
    roomCode = params.room.toUpperCase();
    playerName = params.name || (`P${Math.floor(Math.random()*9000)+1000}`);
    if (typeof io === 'undefined') return;
    socket = io();
    socket.on('connect', () => {
        const s = document.getElementById('mpStatus');
        if (s) s.textContent = `Multiplayer: connected (${roomCode})`;
        socket.emit('join', { name: playerName, room: roomCode });
    });
    socket.on('roomState', ({ players, mobIndex }) => {
        renderPlayers(players);
        if (typeof mobIndex !== 'undefined') {
            const idx = mobIndex % mobs.length;
            loadMobByIndex(idx);
        }
    });
    socket.on('newMob', ({ mobIndex }) => {
        const idx = mobIndex % mobs.length;
        loadMobByIndex(idx);
    });
    socket.on('disconnect', () => {
        const s = document.getElementById('mpStatus');
        if (s) s.textContent = 'Multiplayer: disconnected';
    });
}

function renderPlayers(players) {
    const el = document.getElementById('playersList');
    if (!el) return;
    el.innerHTML = '<strong>Players</strong>';
    const ul = document.createElement('ul');
    players.forEach(p => {
        const li = document.createElement('li');
        li.textContent = `${p.name} — Score: ${p.score} Wrong: ${p.wrongCount}`;
        ul.appendChild(li);
    });
    el.appendChild(ul);
}

const mobs = [
    {
        name: 'creeper',
        image: 'https://minecraft.wiki/images/Creeper_face_1.png'
    },
    {
        name: 'wolf',
        image: 'https://minecraft.wiki/images/Wolf_face.png'
    },
    {
        name: 'zombie',
        image: 'https://minecraft.wiki/images/Zombie_face.png'
    },
    {
        name: 'enderman',
        image: 'https://minecraft.wiki/images/Enderman_face.png'
    },
    {
        name: 'pig',
        image: 'https://minecraft.wiki/images/Pig_face.png'
    },
    {
        name: 'spider',
        image: 'https://minecraft.wiki/images/Spider_face.png'
    },
    {
        name: 'sheep',
        image: 'https://minecraft.wiki/images/Sheep_face.png'
    },
    {
        name: 'chicken',
        image: 'https://minecraft.wiki/images/Chicken_face.png'
    },
    {
        name: 'cow',
        image: 'https://minecraft.wiki/images/Cow_face.png'
    },
    {
        name: 'skeleton',
        image: 'https://minecraft.wiki/images/Skeleton_face.png'
    }
    ,
    {
        name: 'warden',
        image: 'https://minecraft.wiki/images/Warden_face.png'
    },
    {
        name: 'villager',
        image: 'https://minecraft.wiki/images/Villager_face.png'
    },
    {
        name: 'cat',
        image: 'https://minecraft.wiki/images/Cat_face.png'
    },
    {
        name: 'slime',
        image: 'https://minecraft.wiki/images/Slime_face.png'
    },
    {
        name: 'ghast',
        image: 'https://minecraft.wiki/images/Ghast_face.png'
    },
    {
        name: 'fox',
        image: 'https://minecraft.wiki/images/Fox_face.png'
    }
    ,
    {
        name: 'd3rlord3',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBq6_yqw9Fb6r3-dz3DB1fzruESVtepQJPgQ&s'
    }
];

let currentMobIndex = 0;
let score = 0;
let questionsAsked = 0;
let wrongCount = 0;
let currentMob = null;
let answered = false;

function initGame() {
    score = 0;
    questionsAsked = 0;
    wrongCount = 0;
    document.getElementById('score').textContent = '0';
    const wc = document.getElementById('wrongCount');
    if (wc) wc.textContent = '0';
    loadNewMob();
}

function loadNewMob() {
    // In single-player/local mode pick a random mob. In multiplayer the server will call loadMobByIndex.
    currentMobIndex = Math.floor(Math.random() * mobs.length);
    currentMob = mobs[currentMobIndex];
    answered = false;
    
    const img = document.getElementById('mobImage');
    img.src = currentMob.image;
    img.alt = `Picture of ${currentMob.name}`;
    img.setAttribute('aria-label', `Picture of ${currentMob.name}`);

    const feedbackEl = document.getElementById('feedback');
    if (feedbackEl) {
        feedbackEl.textContent = '';
        feedbackEl.className = 'feedback';
    }

    // special styling for the custom mob d3rlord3
    const mobDisplayEl = document.querySelector('.mob-display');
    if (mobDisplayEl) mobDisplayEl.classList.remove('d3r');
    if (currentMob.name === 'd3rlord3') {
        if (mobDisplayEl) mobDisplayEl.classList.add('d3r');
        if (feedbackEl) {
            feedbackEl.textContent = 'Whatever you do at the cross roads dont turn left';
            feedbackEl.className = 'feedback d3r';
        }
    }
    document.getElementById('nextButton').style.display = 'none';
    
    generateOptions();
    // focus first option for keyboard/screen-reader users
    setTimeout(() => {
        const first = document.querySelector('.option-button');
        if (first) first.focus();
    }, 50);
}

function loadMobByIndex(idx) {
    currentMobIndex = idx;
    currentMob = mobs[currentMobIndex];
    answered = false;

    const img = document.getElementById('mobImage');
    img.src = currentMob.image;
    img.alt = `Picture of ${currentMob.name}`;
    img.setAttribute('aria-label', `Picture of ${currentMob.name}`);

    const feedbackEl = document.getElementById('feedback');
    if (feedbackEl) {
        feedbackEl.textContent = '';
        feedbackEl.className = 'feedback';
    }

    const mobDisplayEl = document.querySelector('.mob-display');
    if (mobDisplayEl) mobDisplayEl.classList.remove('d3r');
    if (currentMob.name === 'd3rlord3') {
        if (mobDisplayEl) mobDisplayEl.classList.add('d3r');
        if (feedbackEl) {
            feedbackEl.textContent = 'Whatever you do at the cross roads dont turn left';
            feedbackEl.className = 'feedback d3r';
        }
    }
    document.getElementById('nextButton').style.display = 'none';
    generateOptions();
    setTimeout(() => {
        const first = document.querySelector('.option-button');
        if (first) first.focus();
    }, 50);
}

function generateOptions() {
    const buttons = document.querySelectorAll('.option-button');
    const allMobs = [...mobs];
    
    // Fisher-Yates shuffle
    for (let i = allMobs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allMobs[i], allMobs[j]] = [allMobs[j], allMobs[i]];
    }
    
    // Ensure correct answer is in one of the options
    let options = allMobs.slice(0, 4);
    if (!options.find(m => m.name === currentMob.name)) {
        options[Math.floor(Math.random() * 4)] = currentMob;
    }
    
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    
    buttons.forEach((button, index) => {
        button.textContent = options[index].name.charAt(0).toUpperCase() + options[index].name.slice(1);
        button.dataset.mob = options[index].name;
        button.type = 'button';
        button.setAttribute('aria-label', `Answer: ${options[index].name}`);
        button.disabled = false;
        button.classList.remove('correct', 'incorrect');
    });
}

function guessOption(button) {
    if (answered) return;
    
    answered = true;
    questionsAsked++;
    
    const guess = button.dataset.mob;
    const feedback = document.getElementById('feedback');
    
    if (guess === currentMob.name) {
        score++;
        document.getElementById('score').textContent = score;
        feedback.textContent = '✓ Correct!';
        feedback.className = 'feedback correct';
        button.classList.add('correct');
        // special win message/effect for d3rlord3
        if (currentMob.name === 'd3rlord3') {
            feedback.textContent = '✓ You discovered D3RLORD3!';
            feedback.className = 'feedback d3r correct';
            document.body.classList.add('d3r-mode');
            setTimeout(() => document.body.classList.remove('d3r-mode'), 2600);
        }
        button.setAttribute('aria-pressed', 'true');
        if (socket) socket.emit('guess', { correct: true });
    } else {
        wrongCount++;
        const wcEl = document.getElementById('wrongCount');
        if (wcEl) wcEl.textContent = wrongCount;
        feedback.textContent = `✗ Wrong! It was a ${currentMob.name}.`;
        feedback.className = 'feedback incorrect';
        button.classList.add('incorrect');
        
        // Highlight correct answer
        document.querySelectorAll('.option-button').forEach(btn => {
            if (btn.dataset.mob === currentMob.name) {
                btn.classList.add('correct');
            }
            btn.disabled = true;
            btn.setAttribute('aria-pressed', 'false');
        });
        
        if (socket) socket.emit('guess', { correct: false });

        if (wrongCount >= 3) {
            document.getElementById('nextButton').style.display = 'block';
            document.getElementById('nextButton').textContent = 'Game Over';
            document.getElementById('nextButton').onclick = endGame;
            return;
        }
    }
    
    document.getElementById('nextButton').style.display = 'block';
}

function nextMob() {
    loadNewMob();
}

function endGame() {
    const gameContainer = document.querySelector('.game-container');
    gameContainer.innerHTML = `
        <div class="end-game">
            <h2>Game Over!</h2>
            <p>You got <span class="final-score">${wrongCount}</span> questions wrong.</p>
            <p>Final Score: <span class="final-score">${score}</span></p>
            <button class="start-button" onclick="initGame()">Try Again</button>
            <button class="start-button" onclick="goHome()">Back to Home</button>
        </div>
    `;
}

// Initialize game when page loads
function toggleColorBlindMode() {
    document.body.classList.toggle('colorblind-mode');
    const enabled = document.body.classList.contains('colorblind-mode');
    localStorage.setItem('colorblindMode', enabled ? '1' : '0');
    // update all toggle buttons' labels
    document.querySelectorAll('#colorToggle').forEach(btn => {
        btn.textContent = enabled ? 'CB: On' : 'CB Mode';
    });
}

function applySavedColorMode() {
    const enabled = localStorage.getItem('colorblindMode') === '1';
    if (enabled) document.body.classList.add('colorblind-mode');
    document.querySelectorAll('#colorToggle').forEach(btn => {
        btn.textContent = enabled ? 'CB: On' : 'CB Mode';
    });
}

window.addEventListener('load', () => {
    applySavedColorMode();
    initGame();
});
