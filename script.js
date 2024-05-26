const gameContainer = document.getElementById('gameContainer');
const player = document.getElementById('player');
const obstacle = document.getElementById('obstacle');
const scoreDisplay = document.getElementById('score');
const startMessage = document.getElementById('startMessage');
const gameOverMessage = document.getElementById('gameOverMessage');
const highestScoreDisplay = document.createElement('div');
const soundtrack = document.getElementById('soundtrack');
const muteButton = document.getElementById('muteButton');
const volumeControl = document.getElementById('volumeControl');

const EDGE_DEADZONE = 10; // Adjust this value to increase/decrease the edge deadzone

let playerPosition = 50;
let targetPlayerPosition = 50;
let obstaclePosition = 0;
let score = 0;
let speed = 1;
let gameRunning = false;
let isMuted = false;
let shiftPressed = false;

startMessage.style.display = 'block';
highestScoreDisplay.style.cssText = 'color: white; font-size: 18px; position: absolute; top: 40px; left: 50%; transform: translateX(-50%);';
gameContainer.appendChild(highestScoreDisplay);

document.addEventListener('keydown', (event) => {
    if (!gameRunning) {
        startGame();
    } else {
        if (event.key === 'ArrowLeft') {
            if (shiftPressed) {
                targetPlayerPosition = Math.max(targetPlayerPosition - 20, EDGE_DEADZONE);
            } else {
                targetPlayerPosition = Math.max(targetPlayerPosition - 10, EDGE_DEADZONE);
            }
        }
        if (event.key === 'ArrowRight') {
            if (shiftPressed) {
                targetPlayerPosition = Math.min(targetPlayerPosition + 20, 100 - EDGE_DEADZONE);
            } else {
                targetPlayerPosition = Math.min(targetPlayerPosition + 10, 100 - EDGE_DEADZONE);
            }
        }
        if (event.key === 'Shift') {
            shiftPressed = true;
        }
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'Shift') {
        shiftPressed = false;
    }
});

muteButton.addEventListener('click', () => {
    isMuted = !isMuted;
    soundtrack.muted = isMuted;
    muteButton.textContent = isMuted ? 'Unmute' : 'Mute';
});

volumeControl.addEventListener('input', (event) => {
    soundtrack.volume = event.target.value;
});

const startGame = () => {
    startMessage.style.display = 'none';
    gameOverMessage.style.display = 'none';
    obstacle.style.display = 'block';
    scoreDisplay.style.display = 'block';
    highestScoreDisplay.style.display = 'block';
    gameRunning = true;
    score = 0;
    speed = 1;
    obstaclePosition = 0;
    obstacle.style.top = obstaclePosition + '%';
    obstacle.style.left = Math.random() * 90 + '%';
    if (!isMuted) {
        soundtrack.play();
    }
    updateGame();
};

const updateGame = () => {
    if (!gameRunning) return;

    playerPosition += (targetPlayerPosition - playerPosition) * 0.1;
    player.style.left = playerPosition + '%';
    obstaclePosition += speed;

    if (obstaclePosition > 100) {
        obstaclePosition = 0;
        obstacle.style.left = Math.random() * 90 + '%';
        score++;
        speed += 0.02;
    }
    obstacle.style.top = obstaclePosition + '%';

    // Check collision with obstacle
    const playerRect = player.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    if (
        playerRect.left < obstacleRect.left + obstacleRect.width &&
        playerRect.left + playerRect.width > obstacleRect.left &&
        playerRect.top < obstacleRect.top + obstacleRect.height &&
        playerRect.top + playerRect.height > obstacleRect.top
    ) {
        gameRunning = false;
        gameOverMessage.style.display = 'block';
        saveHighScore(score);
        fetchHighScore();
    }

    scoreDisplay.textContent = 'Score: ' + score;

    generatePixel();
    movePixels();

    requestAnimationFrame(updateGame);
};

const saveHighScore = (score) => {
    const highestScore = Math.max(score, getHighScore());
    localStorage.setItem('highestScore', highestScore);
};

const getHighScore = () => parseInt(localStorage.getItem('highestScore')) || 0;

const fetchHighScore = () => {
    const highestScore = getHighScore();
    highestScoreDisplay.textContent = 'Highest Score: ' + highestScore;
};

const generatePixel = () => {
    if (Math.random() < 0.1) { // Adjust the probability of pixel generation
        const pixel = document.createElement('div');
        pixel.className = 'pixel';
        pixel.style.left = Math.random() * 100 + '%';
        pixel.dataset.speed = 0.05 + Math.random() * 0.1; // Assign a random speed between 0.05 and 0.15
        gameContainer.appendChild(pixel);
    }
};

const movePixels = () => {
    const pixels = document.querySelectorAll('.pixel');
    pixels.forEach(pixel => {
        let top = parseFloat(pixel.style.top) || 0;
        let pixelSpeed = parseFloat(pixel.dataset.speed); // Retrieve the assigned speed
        top += pixelSpeed;
        if (top > 100) {
            pixel.remove();
        } else {
            pixel.style.top = top + '%';
        }
    });
};

// Initialize the game
fetchHighScore();
