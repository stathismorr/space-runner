// Get references to HTML elements
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

// Constants for game settings
const EDGE_DEADZONE = 10; // The space near the edges where the player cannot move
const INITIAL_SPEED = 0.5; // Initial speed of obstacles
const SPEED_INCREMENT = 0.01; // How much the speed increases over time

// Game state variables
let playerPosition = 50;
let targetPlayerPosition = 50;
let obstaclePosition = 0;
let score = 0;
let speed = INITIAL_SPEED;
let gameRunning = false;
let isMuted = false;
let shiftPressed = false;

// Initial setup for displaying elements
startMessage.style.display = 'block';
highestScoreDisplay.style.cssText = 'color: white; font-size: 18px; position: absolute; top: 40px; left: 50%; transform: translateX(-50%);';
gameContainer.appendChild(highestScoreDisplay);

// Event listener for keydown events
document.addEventListener('keydown', (event) => {
    if (!gameRunning) {
        startGame();
    } else {
        handleMovement(event);
    }
});

// Event listener for keyup events
document.addEventListener('keyup', (event) => {
    if (event.key === 'Shift') {
        shiftPressed = false;
    }
});

// Event listener for mute button
muteButton.addEventListener('click', () => {
    toggleMute();
});

// Event listener for volume control
volumeControl.addEventListener('input', (event) => {
    soundtrack.volume = event.target.value;
});

// Start the game
function startGame() {
    startMessage.style.display = 'none';
    gameOverMessage.style.display = 'none';
    obstacle.style.display = 'block';
    scoreDisplay.style.display = 'block';
    highestScoreDisplay.style.display = 'block';
    gameRunning = true;
    score = 0;
    speed = INITIAL_SPEED; // Reset speed to initial value
    obstaclePosition = 0;
    obstacle.style.top = obstaclePosition + '%';
    obstacle.style.left = Math.random() * 90 + '%';
    if (!isMuted) {
        soundtrack.play();
    }
    updateGame();
}

// Update game state
function updateGame() {
    if (!gameRunning) return;

    // Smoothly move the player towards the target position
    playerPosition += (targetPlayerPosition - playerPosition) * 0.1;
    player.style.left = playerPosition + '%';

    // Move the obstacle down the screen
    obstaclePosition += speed;
    if (obstaclePosition > 100) {
        // Reset obstacle to the top with a new random horizontal position
        obstaclePosition = 0;
        obstacle.style.left = Math.random() * 90 + '%';
        score++;
        speed += SPEED_INCREMENT; // Increase speed gradually
    }
    obstacle.style.top = obstaclePosition + '%';

    // Check for collisions
    if (checkCollision(player, obstacle)) {
        endGame();
    }

    // Update score display
    scoreDisplay.textContent = 'Score: ' + score;

    // Generate and move pixels
    generatePixel();
    movePixels();

    // Continue updating the game
    requestAnimationFrame(updateGame);
}

// Handle player movement
function handleMovement(event) {
    if (event.key === 'ArrowLeft') {
        targetPlayerPosition = Math.max(targetPlayerPosition - (shiftPressed ? 20 : 10), EDGE_DEADZONE);
    }
    if (event.key === 'ArrowRight') {
        targetPlayerPosition = Math.min(targetPlayerPosition + (shiftPressed ? 20 : 10), 100 - EDGE_DEADZONE);
    }
    if (event.key === 'Shift') {
        shiftPressed = true;
    }
}

// Toggle mute state
function toggleMute() {
    isMuted = !isMuted;
    soundtrack.muted = isMuted;
    muteButton.textContent = isMuted ? 'Unmute' : 'Mute';
}

// Check if two elements collide
function checkCollision(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    return (
        rect1.left < rect2.left + rect2.width &&
        rect1.left + rect1.width > rect2.left &&
        rect1.top < rect2.top + rect2.height &&
        rect1.top + rect1.height > rect2.top
    );
}

// End the game
function endGame() {
    gameRunning = false;
    gameOverMessage.style.display = 'block';
    saveHighScore(score);
    fetchHighScore();
}

// Save the highest score to localStorage
function saveHighScore(score) {
    const highestScore = Math.max(score, getHighScore());
    localStorage.setItem('highestScore', highestScore);
}

// Get the highest score from localStorage
function getHighScore() {
    return parseInt(localStorage.getItem('highestScore')) || 0;
}

// Fetch and display the highest score
function fetchHighScore() {
    const highestScore = getHighScore();
    highestScoreDisplay.textContent = 'Highest Score: ' + highestScore;
}

// Generate a new pixel element
function generatePixel() {
    if (Math.random() < 0.1) { // Adjust the probability of pixel generation
        const pixel = document.createElement('div');
        pixel.className = 'pixel';
        pixel.style.left = Math.random() * 100 + '%';
        pixel.dataset.speed = 0.05 + Math.random() * 0.1; // Assign a random speed between 0.05 and 0.15
        gameContainer.appendChild(pixel);
    }
}

// Move pixel elements down the screen
function movePixels() {
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
}

// Initialize the game by fetching the highest score
fetchHighScore();
