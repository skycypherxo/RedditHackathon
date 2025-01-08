import { initializeThemes } from "./js/themeManager.js";
class HangmanGame {
    static activeGame = null;
    static totalScore = 0; // Initialize score here

    constructor(postData) {
        // Stop any active game and initialize a new one
        if (HangmanGame.activeGame) {
            HangmanGame.activeGame.stopTimers();
        }
        HangmanGame.activeGame = this;

        // Game state variables
        this.postData = postData;
        this.maxGuesses = 6;
        this.timeLimit = 60;
        this.elapsedTime = 0;
        this.guessedLetters = new Set();
        this.remainingGuesses = this.maxGuesses;
        this.gameOver = false;

        // Initialize the game
        this.init();
    }

    // Reset the game state to prepare for a new game
    reset() {
        this.stopTimers();
        this.guessedLetters.clear();
        this.remainingGuesses = this.maxGuesses;
        this.gameOver = false;
        this.elapsedTime = 0;

        // Clear canvas and reset display
        this.clearCanvas();
        this.updateDisplay();
        this.setupUI();
        this.clearMessages();
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

    // Display post data (subreddit, image, etc.)
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
            subredditField.style.color = ''; // Reset color in case it was changed in a previous game
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

    // Setup UI elements like score and guesses left
    setupUI() {
        const scoreDisplay = document.getElementById('score');
        const timerDisplay = document.querySelector('.timer');
        const guessesLeft = document.querySelector('.guesses-left');

        scoreDisplay.textContent = HangmanGame.totalScore;
        timerDisplay.textContent = `Time: ${this.timeLimit}s`;
        guessesLeft.textContent = `Guesses left: ${this.remainingGuesses}`;
    }

    // Create the virtual keyboard for the game
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

    // Handle a guess and update the game state
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

    // Update the word display and guesses left
    updateDisplay() {
        const wordDisplay = document.getElementById('word-display');
        wordDisplay.textContent = this.word.split('').map(letter => (this.guessedLetters.has(letter) ? letter : '_')).join(' ');

        const guessesLeft = document.querySelector('.guesses-left');
        guessesLeft.textContent = `Guesses left: ${this.remainingGuesses}`;
    }

    // Clear any hangman parts
    clearCanvas() {
        document.querySelectorAll('.hangman-part').forEach(part => {
            part.style.display = 'none';
        });
    }

    // Draw the hangman based on incorrect guesses
    drawHangman(step) {
        const parts = ['left-hand', 'body', 'head', 'right-hand', 'gallow', 'rope'];
        if (step > 0 && step <= parts.length) {
            document.getElementById(parts[step - 1]).style.display = 'block';
        }
    }

    // Check if the game has ended
    checkGameEnd() {
        const wordDisplay = document.getElementById('word-display');
        const messageField = document.getElementById('game-message'); // New element for the message
        if (this.remainingGuesses <= 0) {
            this.gameOver = true;
            clearInterval(this.stopwatch); // Stop the timer when no guesses remain
            wordDisplay.style.color = '#e74c3c';
            wordDisplay.textContent = this.word;

            // Display the game over message
            messageField.innerHTML = `Game Over! The word was: ${this.word}`;
            messageField.style.color = '#e74c3c';

            // After game ends, send scores to the parent window
            this.sendScoreToDB();
        } else if (!wordDisplay.textContent.includes('_')) {
            // If the word is guessed correctly before running out of guesses
            this.gameOver = true;
            clearInterval(this.stopwatch); // Stop the timer when the word is guessed correctly

            // Display the win message
            messageField.innerHTML = 'Congratulations! You guessed the word.';
            messageField.style.color = '#ffffff';

            // Add 10 points only if the entire word is guessed correctly
            if (this.remainingGuesses > 0 && this.elapsedTime < this.timeLimit) {
                HangmanGame.totalScore += 10;
            }

            // After calculating the scores, send them to the parent window
            this.sendScoreToDB();
        }
    }

    // Start the timer (stopwatch)
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

                // Display the time's up message
                const messageField = document.getElementById('game-message');
                messageField.innerHTML = `Time's up! The word was: ${this.word}`;
                messageField.style.color = '#e74c3c';

                // After time is up, send scores to the parent window
                this.sendScoreToDB();
            }
        }, 1000);
    }

    // Function to send the score to the parent window
    sendScoreToDB() {
        // Ensure username is initialized properly
        const username = HangmanGame.username || 'anonymous';
        
        if (!username) {
            console.error('Error: Username is missing. Cannot send score to DB.');
            return;
        }
    
        console.log('Preparing to send score to backend:', {
            username: username,
            score: HangmanGame.totalScore,
        });
    
        // Post message to the backend via WebView
        window.parent.postMessage(
            {
                type: 'setScore',
                data: {
                    username: username,
                    score: HangmanGame.totalScore,
                },
            },
            '*'
        );
    
        console.log('Message posted to parent window:', {
            type: 'setScore',
            data: { username, score: HangmanGame.totalScore },
        });
    }
    

    // Function to clear the game messages
    clearMessages() {
        const messageField = document.getElementById('game-message');
        if (messageField) {
            messageField.innerHTML = ''; // Clear the message field
        }
    }
}

// Function to request a new game from the parent window
function requestNewGame() {
    window.parent.postMessage(
        {
            type: 'newGame'
        },
        '*'
    );
}

// Initialize themes and add event listener for the new game button
document.addEventListener('DOMContentLoaded', () => {
    initializeThemes();

    // Add event listener for the New Game button
    const newGameButton = document.getElementById('newGameButton');
    if (newGameButton) {
        newGameButton.addEventListener('click', () => {
            // Request new game from backend
            window.postMessage(
                {
                    type: 'newGame'
                },
                '*'
            );
        });
    }
});

// Listen for messages to initiate the game or reset the state
window.addEventListener('message', (event) => {
    console.log('Received message:', event);

    // Handle the incoming message for game data
    if (event.data && event.data.type === 'devvit-message') {
        const postData = event.data.data || event.data;
        console.log('Parsed postData:', postData);

        if (HangmanGame.activeGame) {
            HangmanGame.activeGame.reset();  // Reset the game state
        }

        // Start a new game
        new HangmanGame(postData);
    }
});
