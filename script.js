function goToGame() {
    window.location.href = 'game.html';
}

function goHome() {
    window.location.href = 'index.html';
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
    currentMobIndex = Math.floor(Math.random() * mobs.length);
    currentMob = mobs[currentMobIndex];
    answered = false;
    
    document.getElementById('mobImage').src = currentMob.image;
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
    document.getElementById('nextButton').style.display = 'none';
    
    generateOptions();
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
        });
        
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
window.addEventListener('load', initGame);
