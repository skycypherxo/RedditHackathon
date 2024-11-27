import { Devvit, useState, useForm } from '@devvit/public-api';

Devvit.addCustomPostType({
  name: 'Hangman Game',
  height: 'tall',
  render: (context) => {
    const words = ['REDDIT', 'DEVVIT', 'PROGRAMMING', 'JAVASCRIPT', 'TYPESCRIPT'];
    const [word, setWord] = useState(() => words[Math.floor(Math.random() * words.length)]);
    const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
    const [remainingGuesses, setRemainingGuesses] = useState(6);
    
    const maskedWord = word
      .split('')
      .map(letter => guessedLetters.includes(letter) ? letter : '_')
      .join(' ');
    
    const isGameOver = remainingGuesses <= 0;
    const hasWon = word.split('').every(letter => guessedLetters.includes(letter));

    const form = useForm(
      {
        fields: [
          {
            type: 'string',
            name: 'guess',
            label: 'Enter a letter:',
            validation: {
              maxLength: 1,
              matches: /^[A-Za-z]$/,
            },
          },
        ],
      },
      (values) => {
        const guess = values.guess.toUpperCase();
        
        if (!guessedLetters.includes(guess)) {
          setGuessedLetters(prev => [...prev, guess]);
          
          if (!word.includes(guess)) {
            setRemainingGuesses(prev => prev - 1);
          }
        }
      }
    );

    const resetGame = () => {
      setWord(words[Math.floor(Math.random() * words.length)]);
      setGuessedLetters([]);
      setRemainingGuesses(6);
    };

    const renderHangman = (wrongGuesses: number) => {
      return (
        <vstack gap="none" alignment="center">
          {/* Gallows */}
          <hstack width="120px" height="10px" backgroundColor="#ff4500" />
          <hstack>
            <vstack width="10px" height="120px" backgroundColor="#ff4500" />
            <spacer grow />
          </hstack>
          
          {/* Head */}
          {wrongGuesses >= 1 && (
            <hstack width="40px" height="40px" backgroundColor="#ff4500" cornerRadius="full" />
          )}
          
          {/* Body */}
          {wrongGuesses >= 2 && (
            <vstack width="10px" height="50px" backgroundColor="#ff4500" />
          )}
          
          {/* Arms */}
          {wrongGuesses >= 3 && (
            <hstack gap="none">
              <hstack width="40px" height="10px" backgroundColor="#ff4500" />
              <hstack width="40px" height="10px" backgroundColor="#ff4500" />
            </hstack>
          )}
          
          {/* Legs */}
          {wrongGuesses >= 4 && (
            <vstack gap="small">
              {/* Left leg using diagonal illusion */}
              <zstack width="40px" height="40px">
                <vstack>
                  <spacer />
                  <hstack height="4px" backgroundColor="#ff4500" />
                  <spacer />
                </vstack>
              </zstack>
              
              {/* Right leg using diagonal illusion */}
              <zstack width="40px" height="40px">
                <vstack>
                  <spacer />
                  <hstack height="4px" backgroundColor="#ff4500" />
                  <spacer />
                </vstack>
              </zstack>
            </vstack>
          )}
        </vstack>
      );
    };

    return (
      <vstack gap="medium" padding="medium">
        <text>Hangman Game</text>
        {renderHangman(6 - remainingGuesses)}
        <text>Remaining Guesses: {remainingGuesses}</text>
        <text size="xlarge">{maskedWord}</text>
        <text>Guessed Letters: {guessedLetters.join(', ')}</text>
        
        {isGameOver && (
          <vstack gap="small">
            <text>Game Over! The word was: {word}</text>
            <button onPress={resetGame}>Play Again</button>
          </vstack>
        )}
        
        {hasWon && (
          <vstack gap="small">
            <text>Congratulations! You won!</text>
            <button onPress={resetGame}>Play Again</button>
          </vstack>
        )}
        
        {!isGameOver && !hasWon && (
          <button onPress={() => context.ui.showForm(form)}>Make a Guess</button>
        )}
      </vstack>
    );
  },
});

export default Devvit;