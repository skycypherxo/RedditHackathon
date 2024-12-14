class HangmanGame {
    static activeGame = null;

    constructor(subreddits) {
        if (HangmanGame.activeGame) {
            HangmanGame.activeGame.stopTimers();
        }
        HangmanGame.activeGame = this;

        this.subreddits = subreddits;
        this.maxGuesses = 6;
        this.canvas = document.getElementById('hangmanCanvas');
        this.canvas.width = 200;
        this.canvas.height = 200;
        this.timeLimit = 60;
        this.timer = null;
        this.stopwatch = null;
        this.elapsedTime = 0;
        this.score = 0;
        this.init();
    }

    stopTimers() {
        if (this.stopwatch) clearInterval(this.stopwatch);
        this.stopwatch = null;
    }

    async init() {
        if (this.stopwatch) clearInterval(this.stopwatch);
    
        this.elapsedTime = 0;
        this.timer = null;
        this.stopwatch = null;
    
        // Clear the previous post
        const postContainer = document.getElementById('post-container');
        postContainer.innerHTML = ''; // Clear previous content
    
        const postData = await this.fetchRandomPost();
    
        if (!postData) {
            return;
        }
    
        // Set the target word as the subreddit name
        this.word = postData.subreddit.toUpperCase();
        this.textExcerpt = postData.text_excerpt || '';
    
        this.guessedLetters = new Set();
        this.remainingGuesses = this.maxGuesses;
        this.gameOver = false;
    
        const wordDisplay = document.getElementById('word-display');
        const scoreDisplay = document.getElementById('score');
        const timerDisplay = document.querySelector('.timer');
        const guessesLeft = document.querySelector('.guesses-left'); 
    
        wordDisplay.style.color = '#fff';
        scoreDisplay.textContent = this.score;
        timerDisplay.textContent = `Time: ${this.timeLimit}s`;
        guessesLeft.textContent = `Guesses left: ${this.remainingGuesses}`;
    
        // Display the random post (image or text)
        if (postData.image) {
            const img = document.createElement('img');
            img.src = postData.image;
            img.alt = "Random Reddit Post";
            postContainer.appendChild(img);
        } else if (this.textExcerpt) {
            const textExcerpt = document.createElement('p');
            textExcerpt.textContent = this.textExcerpt;
            postContainer.appendChild(textExcerpt);
        }
    
        this.createKeyboard();
        this.updateDisplay();
        this.clearCanvas();
        this.startStopwatch();
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
            this.score += 10;
            document.getElementById('score').textContent = this.score;
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
        wordDisplay.textContent = this.word.split('').map(letter => this.guessedLetters.has(letter) ? letter : '_').join(' ');

        const guessesLeft = document.getElementsByClassName('guesses-left');
        guessesLeft.textContent = `Guesses left: ${this.remainingGuesses}`;

        document.querySelectorAll('.key').forEach(key => {
            if (this.guessedLetters.has(key.textContent)) {
                key.classList.add('used');
            }
        });
    }

    checkGameEnd() {
        const won = this.word.split('').every(letter => this.guessedLetters.has(letter));
        const lost = this.remainingGuesses === 0;

        if (won || lost) {
            clearInterval(this.stopwatch);
            this.gameOver = true;

            const wordDisplay = document.getElementById('word-display');

            if (lost) {
                wordDisplay.style.color = '#e74c3c';
                wordDisplay.textContent = this.word;

                setTimeout(() => {
                    alert(`Game Over! The word was: ${this.word}`);
                }, 100);
            } else {
                this.score += 5;
                document.getElementById('score').textContent = this.score;

                wordDisplay.style.color = '#2ecc71';
                setTimeout(() => {
                    alert('Congratulations! You won!');
                }, 100);
            }
        }
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

    async fetchRandomPost() {
        try {
            const response = await fetch('https://hangtwo-19wqtgomn-peppers-projects-2ebd9759.vercel.app/api/fetch-random-post');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching post:', error);
            return null;
        }
    }
}

// Initialize game
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const subredditResponse = await fetch('subreddit_list.json');
        const subreddits = await subredditResponse.json();

        let game = new HangmanGame(subreddits);

        document.getElementById('new-game').addEventListener('click', async () => {
            game = new HangmanGame(subreddits);
        });
    } catch (error) {
        console.error('Error initializing game:', error);
    }
});
