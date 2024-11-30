class HangmanGame {
    constructor() {
        this.words = ['PEPPER', 'YOUTUBE', 'DISCORD', 'CUTE', 'CODING'];//replace these w subreddit names
        this.maxGuesses = 6;
        this.canvas = document.getElementById('hangmanCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 200;
        this.canvas.height = 200;
        this.init();
    }

    init() {
        this.word = this.words[Math.floor(Math.random() * this.words.length)];
        this.guessedLetters = new Set();
        this.remainingGuesses = this.maxGuesses;
        this.gameOver = false;
        const wordDisplay = document.getElementById('word-display');
        wordDisplay.style.color = '#fff';
        this.createKeyboard();
        this.updateDisplay();
        this.clearCanvas();
        this.drawGallows();
    }

    createKeyboard() {
        const keyboard = document.querySelector('.keyboard');
        keyboard.innerHTML = '';
        
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
            const button = document.createElement('button');
            button.className = 'key';
            button.textContent = letter;
            button.dataset.letter = letter;
            button.addEventListener('click', () => this.makeGuess(letter));
            keyboard.appendChild(button);
        });
    }

    makeGuess(letter) {
        if (this.gameOver || this.guessedLetters.has(letter)) return;

        this.guessedLetters.add(letter);
        const isCorrect = this.word.includes(letter);
        
        const button = document.querySelector(`.key[data-letter="${letter}"]`);
        
        button.classList.remove('correct', 'incorrect');
        
        if (isCorrect) {
            button.classList.add('correct');
        } else {
            button.classList.add('incorrect');
            this.remainingGuesses--;
            const wrongGuesses = this.maxGuesses - this.remainingGuesses;
            this.drawHangman(wrongGuesses);
        }

        this.updateDisplay();
        this.checkGameEnd();
    }

    updateDisplay() {
        // Update word display
        const wordDisplay = document.getElementById('word-display');
        wordDisplay.textContent = this.word
            .split('')
            .map(letter => this.guessedLetters.has(letter) ? letter : '_')
            .join(' ');

        // Update guesses left
        const guessesLeft = document.getElementById('guesses-left');
        guessesLeft.textContent = `Guesses left: ${this.remainingGuesses}`;

        // Update keyboard
        document.querySelectorAll('.key').forEach(key => {
            if (this.guessedLetters.has(key.textContent)) {
                key.classList.add('used');
            }
        });
    }

    checkGameEnd() {
        // Check for win
        const won = this.word
            .split('')
            .every(letter => this.guessedLetters.has(letter));

        // Check for loss
        const lost = this.remainingGuesses === 0;

        if (won || lost) {
            this.gameOver = true;
            
            // Get the word display element
            const wordDisplay = document.getElementById('word-display');
            
            if (lost) {
                // Show the correct word in red
                wordDisplay.style.color = '#e74c3c';
                wordDisplay.textContent = this.word;
                
                setTimeout(() => {
                    alert(`Game Over! The word was: ${this.word}`);
                }, 100);
            } else {
                wordDisplay.style.color = '#2ecc71';
                setTimeout(() => {
                    alert('Congratulations! You won!');
                }, 100);
            }
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 3;
    }

    drawGallows() {
        this.ctx.beginPath();
        // Base
        this.ctx.moveTo(30, 170);
        this.ctx.lineTo(100, 170);
        // Vertical pole
        this.ctx.moveTo(65, 170);
        this.ctx.lineTo(65, 30);
        // Top
        this.ctx.lineTo(130, 30);
        // Rope
        this.ctx.lineTo(130, 50);
        this.ctx.stroke();
    }

    drawHangman(step) {
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;

        switch(step) {
            case 1: // Head
                this.ctx.beginPath();
                this.ctx.arc(130, 65, 15, 0, Math.PI * 2);
                this.ctx.stroke();
                break;
            case 2: // Body
                this.ctx.beginPath();
                this.ctx.moveTo(130, 80);
                this.ctx.lineTo(130, 120);
                this.ctx.stroke();
                break;
            case 3: // Left arm
                this.ctx.beginPath();
                this.ctx.moveTo(130, 90);
                this.ctx.lineTo(100, 105);
                this.ctx.stroke();
                break;
            case 4: // Right arm
                this.ctx.beginPath();
                this.ctx.moveTo(130, 90);
                this.ctx.lineTo(160, 105);
                this.ctx.stroke();
                break;
            case 5: // Left leg
                this.ctx.beginPath();
                this.ctx.moveTo(130, 120);
                this.ctx.lineTo(110, 150);
                this.ctx.stroke();
                break;
            case 6: // Right leg
                this.ctx.beginPath();
                this.ctx.moveTo(130, 120);
                this.ctx.lineTo(150, 150);
                this.ctx.stroke();
                break;
        }
    }
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    const game = new HangmanGame();
    document.getElementById('new-game').addEventListener('click', () => {
        game = new HangmanGame();
    });
}); 