import { Devvit, useAsync, UIClient } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
  http: true,
  redis: true,
});

Devvit.addCustomPostType({
  name: 'Snooman Game',
  render: (context: UIClient) => {
    const [gameStarted, setGameStarted] = context.useState(false);
    const [leaderboardVisible, setLeaderboardVisible] = context.useState(false);
    const [postData, setPostData] = context.useState(null);

    // Fetch post data asynchronously using useAsync
    const { data, error, loading } = useAsync(async () => {
      try {
        const response = await fetch('https://hangtwo.vercel.app/api/fetch-random-post');
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        const jsonData = await response.json();
        console.log('Fetched Post Data:', jsonData);
        return jsonData;
      } catch (err) {
        console.error('Error fetching data:', err);
        throw err;
      }
    });

    // Handle loading state
    if (loading) {
      return <text>Loading Post... Please wait while the content is being fetched.</text>;
    }

    // Handle error state
    if (error) {
      return (
        <vstack>
          <text>Error: {error.message}</text>
          <button onPress={() => setPostData(null)}>Retry</button> {/* Retry button */}
        </vstack>
      );
    }

    // Main Menu - If game hasn't started and leaderboard isn't visible
    if (!gameStarted && !leaderboardVisible) {
      return (
        <vstack padding="medium" gap="medium" alignment="middle center">
          <text size="xlarge" weight="bold">Snooman UwU</text>
          <vstack gap="medium">
            <button
              onPress={() => {
                if (data) {
                  setPostData(data); // Set the post data to use for the game
                  console.log('Sending postData to webview:', data);
                  context.ui.webView.postMessage('fetchWebview', {
                    type: 'devvit-message',
                    message: data,
                  });
                  setGameStarted(true); // Start the game after setting the post data
                }
              }}
            >
              Start Game
            </button>
            <button onPress={() => setLeaderboardVisible(true)}>View Leaderboard</button>
          </vstack>
        </vstack>
      );
    }

    // Handle "New Game" request (fetch new data directly without refetch)
    const startNewGame = async () => {
      console.log('Starting new game...');
      setGameStarted(false); // Reset the gameStarted state
      setLeaderboardVisible(false); // Hide leaderboard if visible
      setPostData(null); // Clear current game data

      try {
        const response = await fetch('https://hangtwo.vercel.app/api/fetch-random-post');
        if (!response.ok) {
          throw new Error(`Failed to fetch new data: ${response.status}`);
        }
        const newData = await response.json();
        console.log('Fetched new post data:', newData);

        setPostData(newData); // Set new post data for the new game
        context.ui.webView.postMessage('fetchWebview', {
          type: 'devvit-message',
          message: newData,
        });

        setGameStarted(true); // Start the game
      } catch (error) {
        console.error('Error starting new game:', error);
        alert('Failed to start new game. Please try again.');
      }
    };

    // Render the game WebView when the game starts
    if (gameStarted && !leaderboardVisible) {
      return (
        <blocks grow>
          <webview
            id="fetchWebview"
            url="page.html"
            grow
            height="100%"
            onMessage={(message) => {
              console.log('Received message from webview:', message);
            }}
          />
          <button onPress={startNewGame}>New Game</button>
        </blocks>
      );
    }

    // Render the leaderboard WebView when the leaderboard is visible
    if (leaderboardVisible) {
      return (
        <blocks grow>
          <webview
            id="fetchLeaderboardView"
            url="leaderboard.html"
            grow
            height="100%"
            onMessage={(message) => {
              console.log('Received message from webview:', message);
            }}
          />
          <button onPress={() => setLeaderboardVisible(false)}>Back to Menu</button>
        </blocks>
      );
    }

    return null;
  },
});

export default Devvit;
