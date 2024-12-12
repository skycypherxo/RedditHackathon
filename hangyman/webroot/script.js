class HangmanGame {
    constructor() {
        this.words = ['PEPPER', 'YOUTUBE', 'DISCORD', 'CUTE', 'CODING'];//replace these w subreddit names
        this.maxGuesses = 6;
        this.canvas = document.getElementById('hangmanCanvas');
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
        // Hide all hangman parts
        document.querySelectorAll('.hangman-part').forEach(part => {
            part.style.display = 'none';
        });
        // Show the gallows
        document.getElementById('gallow').style.display = 'block';
    }

    drawHangman(step) {
        const parts = ['left-hand', 'body', 'head', 'right-hand','rope'];
        if (step > 0 && step <= parts.length) {
            document.getElementById(parts[step - 1]).style.display = 'block';
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