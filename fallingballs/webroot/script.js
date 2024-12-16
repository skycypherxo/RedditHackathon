const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const colorDisplay = document.getElementById('colorDisplay');
const scoreDisplay = document.getElementById('scoreValue');
const highScoreDisplay = document.getElementById('highScoreValue');

// Game state
let score = 0;
let highestScore = localStorage.getItem('highScore') || 0;
highestScore = parseInt(highestScore);
highScoreDisplay.textContent = highestScore;

let currentColor = '';
let balls = [];
let bullets = [];
let particles = [];
let shooter = {
    x: canvas.width / 2,
    y: canvas.height - 15,
    width: 30,
    height: 40
};

const colors = ['#FF3366', '#33FF99', '#3366FF', '#FFFF66'];
currentColor = colors[Math.floor(Math.random() * colors.length)];
colorDisplay.style.backgroundColor = currentColor;

let baseSpeed = 1;
let difficultyLevel = 1;
let lastBallCreated = 0;
const initialBallSpawnInterval = 1000;
let ballSpawnInterval = initialBallSpawnInterval;
const maxBallsOnScreen = 5;
let isGameActive = true;
let peakScore = 0;

// Particle system
function createParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x,
            y,
            color,
            radius: Math.random() * 3,
            dx: (Math.random() - 0.5) * 8,
            dy: (Math.random() - 0.5) * 8,
            alpha: 1
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.x += particle.dx;
        particle.y += particle.dy;
        particle.alpha -= 0.02;

        if (particle.alpha <= 0) {
            particles.splice(i, 1);
            continue;
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${particle.color}${Math.floor(particle.alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();
    }
}




function createBall() {
    if (balls.length >= maxBallsOnScreen) return;
    
    const ball = {
        x: Math.random() * (canvas.width - 20) + 10,
        y: -10,
        radius: 15,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: baseSpeed * difficultyLevel,
        trail: []
    };
    balls.push(ball);
}

function drawShooter() {
    ctx.save();
    ctx.translate(shooter.x + shooter.width / 2, shooter.y + shooter.height / 2);
    
    // Draw shooter body
    ctx.fillStyle = currentColor;
    ctx.beginPath();
    ctx.moveTo(-shooter.width / 2, shooter.height / 2);
    ctx.lineTo(shooter.width / 2, shooter.height / 2);
    ctx.lineTo(0, -shooter.height / 2);
    ctx.closePath();
    ctx.fill();
    
    // Add glow effect
    ctx.shadowColor = currentColor;
    ctx.shadowBlur = 10;
    ctx.stroke();
    
    ctx.restore();
}


canvas.addEventListener('click', (e) => {
    const bullet = {
        x: shooter.x + shooter.width / 2,
        y: shooter.y,
        radius: 5,
        color: currentColor,
        speed: 5,
        trail: []
    };
    bullets.push(bullet);
    

    createParticles(bullet.x, bullet.y, currentColor, 5);
});

function showScorePopup(x, y, score, color) {
    const popup = document.createElement('div');
    popup.style.position = 'absolute';
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    popup.style.color = color;
    popup.style.fontSize = '24px';
    popup.style.fontFamily = 'Orbitron, sans-serif';
    popup.style.animation = 'scorePopup 1s forwards';
    popup.textContent = score > 0 ? `+${score}` : score;
    document.body.appendChild(popup);
    
    setTimeout(() => document.body.removeChild(popup), 1000);
}

function gameLoop() {
    if (!isGameActive) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateParticles();

    drawShooter();
    
    // Increase difficulty every 30 points
    if (score >= peakScore + 30) {
        peakScore = Math.floor(score / 30) * 30; // Keeps track of the last score multiple of 30
        difficultyLevel = Math.floor(score / 20) + 1; // Increase the level by 1 for every 30 points
        ballSpawnInterval = Math.max(initialBallSpawnInterval - (difficultyLevel * 50), 500); // Decrease interval, but not below 500ms
    }
    
    balls.forEach((ball, index) => {
        ball.y += ball.speed;
        
        // Update trail
        ball.trail.unshift({ x: ball.x, y: ball.y });
        if (ball.trail.length > 5) ball.trail.pop();
        
        // Draw trail
        ball.trail.forEach((pos, i) => {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, ball.radius * (1 - i / 5), 0, Math.PI * 2);
            ctx.fillStyle = `${ball.color}${Math.floor((1 - i / 5) * 255).toString(16).padStart(2, '0')}`;
            ctx.fill();
        });
        
        // Draw ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        
        // Add glow effect
        ctx.shadowColor = ball.color;
        ctx.shadowBlur = 10;
        ctx.stroke();
        
        // Ball goes off screen
        if (ball.y > canvas.height) {
            if (ball.color === currentColor) {
                score = Math.max(0, score - 8);
                scoreDisplay.textContent = score;
                showScorePopup(ball.x, canvas.height - 30, -8, '#FF3366');
                
                if (score === 0) {
                    gameOver();
                }
            }
            balls.splice(index, 1);
        }
    });
    
    // Update and draw bullets with trail effect
    bullets.forEach((bullet, bulletIndex) => {
        bullet.y -= bullet.speed;
        
        // Update trail
        bullet.trail.unshift({ x: bullet.x, y: bullet.y });
        if (bullet.trail.length > 3) bullet.trail.pop();
        
        // Draw trail
        bullet.trail.forEach((pos, i) => {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, bullet.radius * (1 - i / 3), 0, Math.PI * 2);
            ctx.fillStyle = `${bullet.color}${Math.floor((1 - i / 3) * 255).toString(16).padStart(2, '0')}`;
            ctx.fill();
        });
        
        // Draw bullet
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fillStyle = bullet.color;
        ctx.fill();
        
        // Check collisions
        balls.forEach((ball, ballIndex) => {
            const dx = bullet.x - ball.x;
            const dy = bullet.y - ball.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < ball.radius + bullet.radius) {
                let scoreChange = bullet.color === ball.color ? 10 : -5;
                
                if (bullet.color === ball.color) {
                    currentColor = colors[Math.floor(Math.random() * colors.length)];
                    colorDisplay.style.backgroundColor = currentColor;
                    createParticles(ball.x, ball.y, ball.color, 20);
                }
                
                score = Math.max(0, score + scoreChange);
                scoreDisplay.textContent = score;
                showScorePopup(ball.x, ball.y, scoreChange, scoreChange > 0 ? '#33FF99' : '#FF3366');
                
                if (score > highestScore) {
                    highestScore = score;
                    localStorage.setItem('highScore', highestScore);
                    highScoreDisplay.textContent = highestScore;
                }
                
                if (score === 0) {
                    gameOver();
                }
                
                bullets.splice(bulletIndex, 1);
                balls.splice(ballIndex, 1);
                return;
            }
        });
        
        // Remove bullets that go off screen
        if (bullet.y < 0) {
            bullets.splice(bulletIndex, 1);
        }
    });
    
    // Create new balls
    const currentTime = Date.now();
    if (currentTime - lastBallCreated > ballSpawnInterval && balls.length < maxBallsOnScreen) {
        createBall();
        lastBallCreated = currentTime;
    }
    
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    isGameActive = false;
    const gameOverScreen = document.getElementById('game-over');
    const finalScore = document.getElementById('finalScore');
    gameOverScreen.style.display = 'flex';
    finalScore.textContent = score;
    
    createParticles(canvas.width / 2, canvas.height / 2, currentColor, 50);
}

function restartGame() {
    score = 0;
    peakScore = 0;
    difficultyLevel = 1;
    ballSpawnInterval = initialBallSpawnInterval;
    balls = [];
    bullets = [];
    particles = [];
    isGameActive = true;
    
    scoreDisplay.textContent = '0';
    document.getElementById('game-over').style.display = 'none';
    
    currentColor = colors[Math.floor(Math.random() * colors.length)];
    colorDisplay.style.backgroundColor = currentColor;
    
    gameLoop();
}

// Event Listeners
document.getElementById('restart-btn').addEventListener('click', restartGame);

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    shooter.x = e.clientX - rect.left - shooter.width / 2;
    
    if (shooter.x < 0) shooter.x = 0;
    if (shooter.x + shooter.width > canvas.width) shooter.x = canvas.width - shooter.width;
});

// Mobile support
function initTouchControls() {
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const scaleX = canvas.width / rect.width;
        
        shooter.x = (touch.clientX - rect.left) * scaleX - shooter.width / 2;
        
        if (shooter.x < 0) shooter.x = 0;
        if (shooter.x + shooter.width > canvas.width) shooter.x = canvas.width - shooter.width;
    });
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const bullet = {
            x: shooter.x + shooter.width / 2,
            y: shooter.y,
            radius: 5,
            color: currentColor,
            speed: 5,
            trail: []
        };
        bullets.push(bullet);
        createParticles(bullet.x, bullet.y, currentColor, 5);
    });
}

function handleResize() {
    const container = canvas.parentElement;
    const containerWidth = container.clientWidth;
    const aspectRatio = canvas.height / canvas.width;
    
    if (containerWidth < canvas.width) {
        canvas.style.width = containerWidth + 'px';
        canvas.style.height = (containerWidth * aspectRatio) + 'px';
    } else {
        canvas.style.width = canvas.width + 'px';
        canvas.style.height = canvas.height + 'px';
    }
}

// Initialize
initTouchControls();
window.addEventListener('resize', handleResize);
handleResize();
gameLoop();