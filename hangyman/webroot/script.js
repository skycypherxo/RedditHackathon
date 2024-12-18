import { initializeThemes } from './js/themeManager.js';

window.addEventListener('message', (event) => {
    console.log('Received full event:', event);

    // Check if the event data has the expected structure
    if (event.data && event.data.type === 'devvit-message') {
        try {
            const postData = event.data.data || event.data;
            console.log('Parsed postData:', postData);

            // Initialize the game with the received data
            new HangmanGame(postData);
        } catch (e) {
            console.error('Error displaying postData:', e);
            document.getElementById('postDataDisplay').innerHTML = `
                <p>Error displaying data:</p>
                <p>${e.message}</p>
                <p>Full error details: ${JSON.stringify(e, null, 2)}</p>
            `;
        }
    } else {
        console.log('Message does not match expected structure:', event.data);
    }
});

class HangmanGame {
    static activeGame = null;
    static totalScore = 0;

    constructor(postData) {
        if (HangmanGame.activeGame) {
            HangmanGame.activeGame.stopTimers();
        }
        HangmanGame.activeGame = this;

        this.postData = postData;
        this.maxGuesses = 6;
        this.timeLimit = 60;
        this.elapsedTime = 0;
        this.guessedLetters = new Set();
        this.remainingGuesses = this.maxGuesses;
        this.gameOver = false;

        this.init();
    }

    stopTimers() {
        if (this.stopwatch) clearInterval(this.stopwatch);
        this.stopwatch = null;
    }

    async init() {
        this.displayPostData();
        this.setupUI();
        this.createKeyboard();
        this.updateDisplay();
        this.clearCanvas();
        this.startStopwatch();
    }

    displayPostData() {
        const subredditField = document.getElementById('word-display');
        const imageField = document.getElementById('imageField');
        const textExcerptField = document.getElementById('textExcerpt');
        const urlField = document.getElementById('urlField');
    
        // Extract the relevant data with fallbacks
        const subreddit = this.postData.message.message.subreddit?.toUpperCase() || 'UNKNOWN';
        const imageUrl = this.postData.message.message.image;
        const textExcerpt = this.postData.message.message.text_excerpt;
        const url = this.postData.message.message.url;
    
        // Set the word to guess based on subreddit
        this.word = subreddit;
    
        // Update UI fields for the word display
        if (subredditField) {
            subredditField.textContent = this.word.split('').map(() => '_').join(' ');
        }
    
        // Handle image display
        if (imageField) {
            imageField.style.display = imageUrl ? 'block' : 'none';
            imageField.innerHTML = imageUrl
                ? `<img src="${imageUrl}" style="width: 100%; height: 100%; object-fit: contain;">`
                : 'Image: No image available.';
        }
    
        // Handle text excerpt display
        if (textExcerptField) {
            textExcerptField.style.display = textExcerpt ? 'block' : 'none';
            textExcerptField.textContent = textExcerpt
                ? `Text: ${textExcerpt}`
                : 'Text: No text available.';
        }
    
        // Handle URL display
        if (urlField) {
            urlField.innerHTML = url
                ? `URL: <a href="${url}" target="_blank">${url}</a>`
                : '';
        }
    }    

    setupUI() {
        const scoreDisplay = document.getElementById('score');
        const timerDisplay = document.querySelector('.timer');
        const guessesLeft = document.querySelector('.guesses-left');

        scoreDisplay.textContent = HangmanGame.totalScore;
        timerDisplay.textContent = `Time: ${this.timeLimit}s`;
        guessesLeft.textContent = `Guesses left: ${this.remainingGuesses}`;
    }

    createKeyboard() {
        const keyboard = document.querySelector('.keyboard');
        keyboard.innerHTML = '';

        'ABCDEFGHIJKLMNOPQRSTUVWXYZ_'.split('').forEach(letter => {
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
        const wordDisplay = document.getElementById('word-display');
        wordDisplay.textContent = this.word.split('').map(letter => (this.guessedLetters.has(letter) ? letter : '_')).join(' ');

        const guessesLeft = document.querySelector('.guesses-left');
        guessesLeft.textContent = `Guesses left: ${this.remainingGuesses}`;
    }

    clearCanvas() {
        document.querySelectorAll('.hangman-part').forEach(part => {
            part.style.display = 'none';
        });
    }

    drawHangman(step) {
        const parts = ['left-hand', 'body', 'head', 'right-hand', 'gallow', 'rope'];
        if (step > 0 && step <= parts.length) {
            document.getElementById(parts[step - 1]).style.display = 'block';
        }
    }

    checkGameEnd() {
        if (this.remainingGuesses <= 0) {
            this.gameOver = true;
            clearInterval(this.stopwatch); // Stop the timer when no guesses remain
            alert(`Game Over! The word was: ${this.word}`);
            const wordDisplay = document.getElementById('word-display');
            wordDisplay.style.color = '#e74c3c';
            wordDisplay.textContent = this.word;
        } else if (!document.getElementById('word-display').textContent.includes('_')) {
            this.gameOver = true;
            clearInterval(this.stopwatch); // Stop the timer when the word is guessed correctly
            alert('Congratulations! You guessed the word.');
        }
    }
    

    startStopwatch() {
        if (this.stopwatch) clearInterval(this.stopwatch);

        const timerDisplay = document.querySelector('.timer');
        timerDisplay.textContent = `Time: ${this.timeLimit}s`;

        this.stopwatch = setInterval(() => {
            this.elapsedTime++;
            const remainingTime = Math.max(this.timeLimit - this.elapsedTime, 0);
            timerDisplay.textContent = `Time: ${remainingTime}s`;

            if (remainingTime === 0) {
                clearInterval(this.stopwatch);
                this.gameOver = true;
                const wordDisplay = document.getElementById('word-display');
                wordDisplay.style.color = '#e74c3c';
                wordDisplay.textContent = this.word;
                alert(`Time's up! The word was: ${this.word}`);
            }
        }, 1000);
    }
}

// Initialize themes
document.addEventListener('DOMContentLoaded', () => {
    initializeThemes();
});
