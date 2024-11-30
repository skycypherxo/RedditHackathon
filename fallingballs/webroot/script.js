const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const colorDisplay = document.getElementById('colorDisplay');
const scoreDisplay = document.getElementById('scoreValue');

let score = 0;
let highestScore = localStorage.getItem('highScore') || 0; // Load saved high score
highestScore = parseInt(highestScore);
let currentColor = '';
let balls = [];
let bullets = [];
let shooter = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    width: 40,
    height: 60
};

const colors = ['red', 'blue', 'green', 'yellow'];
currentColor = colors[Math.floor(Math.random() * colors.length)];
colorDisplay.style.color = currentColor;
colorDisplay.textContent = currentColor;

let baseSpeed = 1;
let difficultyLevel = 1;
let lastBallCreated = 0;
const initialBallSpawnInterval = 1000;
let ballSpawnInterval = initialBallSpawnInterval;
const maxBallsOnScreen = 5;
let isGameActive = true;

// Add restart button listener
document.getElementById('restart-btn').addEventListener('click', restartGame);

// Add a new variable to track the highest score reached in current game
let peakScore = 0;

function restartGame() {
    // Reset game state
    score = 0;
    peakScore = 0;  // Reset peak score on restart
    difficultyLevel = 1;
    ballSpawnInterval = initialBallSpawnInterval;
    balls = [];
    bullets = [];
    isGameActive = true;
    
    // Reset UI
    scoreDisplay.textContent = '0';
    document.getElementById('game-over').style.display = 'none';
    
    // Reset color
    currentColor = colors[Math.floor(Math.random() * colors.length)];
    colorDisplay.style.color = currentColor;
    colorDisplay.textContent = currentColor;
    
    // Restart game loop
    gameLoop();
}

// Ball creation
function createBall() {
    if (balls.length >= maxBallsOnScreen) return;
    
    const ball = {
        x: Math.random() * (canvas.width - 40) + 20,
        y: -20,
        radius: 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: baseSpeed * difficultyLevel
    };
    balls.push(ball);
}

// Shoot bullets
canvas.addEventListener('click', (e) => {
    const bullet = {
        x: shooter.x + shooter.width / 2,
        y: shooter.y,
        radius: 5,
        color: currentColor,
        speed: 5
    };
    bullets.push(bullet);
});

// Move shooter
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    shooter.x = e.clientX - rect.left - shooter.width / 2;
    
    // Keep shooter within canvas bounds
    if (shooter.x < 0) shooter.x = 0;
    if (shooter.x + shooter.width > canvas.width) shooter.x = canvas.width - shooter.width;
});

function checkCollision(bullet, ball) {
    const dx = bullet.x - ball.x;
    const dy = bullet.y - ball.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < ball.radius + bullet.radius;
}

function updateDifficulty() {
    const previousLevel = difficultyLevel;
    
    // Update high score if current score is higher
    if (score > highestScore) {
        highestScore = score;
        localStorage.setItem('highScore', highestScore);
        document.getElementById('highScoreValue').textContent = highestScore;
    }
    
    // Update peak score if current score is higher
    peakScore = Math.max(peakScore, score);
    
    // Calculate difficulty based on peak score (not current score)
    const scoreThreshold = Math.floor(peakScore / 10);
    difficultyLevel = 1 + scoreThreshold * 0.3;
    
    // Reduce spawn interval based on peak score
    ballSpawnInterval = Math.max(400, initialBallSpawnInterval - (scoreThreshold * 200));
    
    // Update existing balls' speed if difficulty changed
    if (previousLevel !== difficultyLevel) {
        balls.forEach(ball => {
            ball.speed = baseSpeed * difficultyLevel;
        });
    }
}

function gameLoop() {
    if (!isGameActive) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw shooter
    ctx.fillStyle = currentColor;
    ctx.fillRect(shooter.x, shooter.y, shooter.width, shooter.height);
    
    // Update and draw balls
    for (let i = balls.length - 1; i >= 0; i--) {
        const ball = balls[i];
        ball.y += ball.speed;
        
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
        
        // Ball goes off screen
        if (ball.y > canvas.height) {
            if (ball.color === currentColor) {
                score = Math.max(0, score - 8);
                scoreDisplay.textContent = score;
                
                // Visual feedback for missing target color
                const missText = document.createElement('div');
                missText.textContent = '-8';
                missText.style.position = 'absolute';
                missText.style.color = currentColor;
                missText.style.left = `${ball.x}px`;
                missText.style.top = `${canvas.height - 30}px`;
                missText.style.fontSize = '24px';
                document.body.appendChild(missText);
                setTimeout(() => document.body.removeChild(missText), 1000);
                
                if (score === 0) {
                    gameOver();
                }
            }
            balls.splice(i, 1);
        }
    }
    
    // Update and draw bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.y -= bullet.speed;
        
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fillStyle = bullet.color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.closePath();
        
        // Check collisions
        for (let j = balls.length - 1; j >= 0; j--) {
            if (checkCollision(bullet, balls[j])) {
                const hitBall = balls[j];
                let scoreChange = 0;
                let scoreText = '';
                
                if (bullet.color === hitBall.color) {
                    scoreChange = 10;
                    scoreText = '+10';
                    currentColor = colors[Math.floor(Math.random() * colors.length)];
                    colorDisplay.style.color = currentColor;
                    colorDisplay.textContent = currentColor;
                    updateDifficulty();
                } else {
                    scoreChange = -5;
                    scoreText = '-5';
                }
                
                // Visual feedback for score change
                const pointsText = document.createElement('div');
                pointsText.textContent = scoreText;
                pointsText.style.position = 'absolute';
                pointsText.style.color = scoreChange > 0 ? '#4CAF50' : '#FF4444';
                pointsText.style.left = `${hitBall.x}px`;
                pointsText.style.top = `${hitBall.y}px`;
                pointsText.style.fontSize = '24px';
                document.body.appendChild(pointsText);
                setTimeout(() => document.body.removeChild(pointsText), 1000);
                
                score = Math.max(0, score + scoreChange);
                scoreDisplay.textContent = score;
                
                if (score === 0) {
                    gameOver();
                }
                
                bullets.splice(i, 1);
                balls.splice(j, 1);
                break;
            }
        }
        
        if (bullet.y < 0) {
            bullets.splice(i, 1);
        }
    }
    
    // Create new balls based on time and max balls limit
    const currentTime = Date.now();
    if ((currentTime - lastBallCreated) > ballSpawnInterval && balls.length < maxBallsOnScreen) {
        createBall();
        lastBallCreated = currentTime;
    }
    
    // Redraw
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    isGameActive = false;
    const gameOverScreen = document.getElementById('game-over');
    const finalScore = document.getElementById('finalScore');
    gameOverScreen.style.display = 'block';
    finalScore.textContent = `${score} (High Score: ${highestScore})`;
}

gameLoop(); 