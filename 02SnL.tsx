import { Devvit, useState } from '@devvit/public-api';

Devvit.addCustomPostType({
  name: 'Snakes and Ladders',
  height: 'tall',
  render: (context) => {
    // Game board configuration
    const boardSize = 100;
    const snakesAndLadders = {
      // Snakes: key is head, value is tail
      16: 6,
      47: 26,
      49: 11,
      56: 53,
      62: 19,
      87: 24,
      93: 73,
      95: 75,
      98: 78,
      // Ladders: key is bottom, value is top
      4: 14,
      9: 31,
      21: 42,
      28: 84,
      36: 44,
      51: 67,
      71: 91,
      80: 100
    };

    // Add color constants
    const colors = {
      board: '#2c3e50',
      boardBg: '#ecf0f1',
      player: '#e74c3c',
      snake: '#27ae60',
      ladder: '#f1c40f',
      text: '#ffffff',
      evenCell: '#34495e',
      oddCell: '#2c3e50'
    };

    const [playerPosition, setPlayerPosition] = useState(1);
    const [gameWon, setGameWon] = useState(false);
    const [lastRoll, setLastRoll] = useState<number | null>(null);

    const rollDice = () => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setLastRoll(roll);
      
      let newPosition = playerPosition + roll;
      
      // Check if landed on a snake or ladder
      if (snakesAndLadders[newPosition]) {
        newPosition = snakesAndLadders[newPosition];
      }
      
      // Check for win condition
      if (newPosition >= boardSize) {
        setGameWon(true);
        newPosition = boardSize;
      }
      
      setPlayerPosition(newPosition);
    };

    const resetGame = () => {
      setPlayerPosition(1);
      setGameWon(false);
      setLastRoll(null);
    };

    const renderBoard = () => {
      const rows = [];
      
      // Generate the board with numbers and check for snakes and ladders
      for (let row = 0; row < 10; row++) {
        const cells = [];
        
        for (let col = 0; col < 10; col++) {
          const cellNumber = row % 2 === 0 ? (9 - row) * 10 + (9 - col) : (9 - row) * 10 + col + 1;
          
          const isPlayerHere = playerPosition === cellNumber;
          const isSnakeHead = snakesAndLadders[cellNumber] && snakesAndLadders[cellNumber] < cellNumber;
          const isLadderBottom = snakesAndLadders[cellNumber] && snakesAndLadders[cellNumber] > cellNumber;
          
          const cellColor = (row + col) % 2 === 0 ? colors.evenCell : colors.oddCell;
          
          cells.push(
            <vstack 
              key={col}
              width="50px" 
              height="50px" 
              backgroundColor={isPlayerHere ? colors.player : cellColor}
              borderColor={colors.boardBg}
              borderWidth="1px"
              alignment="center"
              padding="small"
            >
              <text 
                size="medium" 
                color={colors.text}
              >
                {cellNumber}
                {isSnakeHead ? ' 🐍' : ''}
                {isLadderBottom ? ' 🪜' : ''}
              </text>
            </vstack>
          );
        }

        rows.push(
          <hstack key={row} gap="none">
            {cells}
          </hstack>
        );
      }

      return rows;
    };

    return (
      <vstack gap="medium" padding="medium">
        <text 
          alignment="center" 
          size="xlarge" 
          weight="bold" 
          color={colors.board}
        >
          🎲 Snakes and Ladders 🎲
        </text>
        
        {/* Render the game board */}
        <vstack 
          gap="none" 
          padding="medium" 
          backgroundColor={colors.boardBg} 
          cornerRadius="large"
        >
          {renderBoard()}
        </vstack>
        
        <vstack gap="small" alignment="center">
          <text size="large">Position: {playerPosition}</text>
          {lastRoll && <text size="large">🎲 Rolled: {lastRoll}</text>}
        </vstack>
        
        {gameWon ? (
          <vstack gap="small" alignment="center">
            <text size="large">🎉 You Won! 🎉</text>
            <button 
              onPress={resetGame}
              backgroundColor={colors.board}
              color={colors.text}
            >
              Play Again
            </button>
          </vstack>
        ) : (
          <button 
            onPress={rollDice}
            backgroundColor={colors.board}
            color={colors.text}
          >
            Roll Dice 🎲
          </button>
        )}
      </vstack>
    );
  },
});

export default Devvit;
