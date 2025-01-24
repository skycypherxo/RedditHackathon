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
    const [leaderboardData, setLeaderboardData] = context.useState(null);

    const goHome = () => {
      console.log('Navigating to Home...');
      setGameStarted(false);
      setLeaderboardVisible(false);
      setPostData(null);
    };

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

    // Fetch leaderboard data using Devvit's Redis method
    const fetchLeaderboard = async (context: Devvit.Context) => {
      try {
        const leaderboardData = await context.redis.zRange('leaderboard', 0, 9, { 
          reverse: true, 
          by: 'score'
        });
        console.log('Leaderboard Data:', leaderboardData);
        return leaderboardData;
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
      }
    };

 const saveScore = async (context: Devvit.Context, score: number) => {
  try {
    // Get current user's username
    const currUser = await context.reddit.getCurrentUser();
    const username = currUser?.username ?? 'anonymous';

    // Add score to leaderboard
    await context.redis.zAdd('leaderboard', { 
      member: username, 
      score: score 
    });

    // Log the saved score
    console.log(`Score saved for ${username}: ${score}`);
    
    // Fetch updated leaderboard
    const updatedLeaderboard = await context.redis.zRange('leaderboard', 0, 9, { 
      reverse: true, 
      by: 'score' 
    });
    
    // Send updated leaderboard to webview
    context.ui.webView.postMessage('fetchWebview', {
      type: 'leaderboardUpdate',
      data: updatedLeaderboard
    });

  } catch (error) {
    console.error('Error saving score:', error);
  }
};
 

    // Function to log the leaderboard
    const logLeaderboard = async (context: Devvit.Context) => {
      try {
        const leaderboard = await context.redis.zRange('leaderboard', 0, -1, { reverse: true, by: 'score' });
        console.log('Current leaderboard:', leaderboard);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };

    if (loading) {
      return <text>Loading Post... Please wait while the content is being fetched.</text>;
    }

    if (error) {
      return (
        <vstack>
          <text>Error: {error.message}</text>
          <button onPress={() => setPostData(null)}>Retry</button>
        </vstack>
      );
    }

    if (!gameStarted && !leaderboardVisible) {
      return (
        <vstack padding="medium" gap="medium" alignment="middle center">
          <text size="xlarge" weight="bold">Snooman UwU</text>
          <vstack gap="medium">
            <button
              onPress={() => {
                if (data) {
                  setPostData(data);
                  console.log('Sending postData to webview:', data);
                  context.ui.webView.postMessage('fetchWebview', {
                    type: 'devvit-message',
                    message: data,
                  });
                  setGameStarted(true);
                }
              }}
            >
              Start Game
            </button>
            <button
              onPress={async () => {
                const leaderboard = await fetchLeaderboard(context);
                setLeaderboardData(leaderboard);
                context.ui.webView.postMessage('fetchLeaderboard', {
                  type: 'leaderboard-message',
                  message: leaderboard,
                });
                setLeaderboardVisible(true);
              }}
            >
              View Leaderboard
            </button>
          </vstack>
        </vstack>
      );
    }

    const startNewGame = async () => {
      console.log('Starting new game...');
      setGameStarted(false);
      setLeaderboardVisible(false);
      setPostData(null);

      try {
        const response = await fetch('https://hangtwo.vercel.app/api/fetch-random-post');
        if (!response.ok) {
          throw new Error(`Failed to fetch new data: ${response.status}`);
        }
        const newData = await response.json();
        console.log('Fetched new post data:', newData);

        setPostData(newData);
        context.ui.webView.postMessage('fetchWebview', {
          type: 'devvit-message',
          message: newData,
        });

        setGameStarted(true);
      } catch (error) {
        console.error('Error starting new game:', error);
        alert('Failed to start new game. Please try again.');
      }
    };

    if (gameStarted && !leaderboardVisible) {
      return (
        <vstack grow>
          <webview
            id="fetchWebview"
            url="page.html"
            grow
            height="100%"
            onMessage={async (msg) => {
              console.log('Received message in Devvit app:', msg);
              if (msg.type === 'setScore') {
                await saveScore(context, msg.data.username, msg.data.score);
              }
            }}
          />
          <hstack gap="medium" alignment="middle center">
            <button onPress={startNewGame}>New Game</button>
            <button onPress={goHome}>Home</button>
          </hstack>
        </vstack>
      );
    }

    if (leaderboardVisible) {
      return (
        <vstack grow>
          <webview
            id="fetchLeaderboardView"
            url="leaderboard.html"
            grow
            height="100%"
            onMessage={(message) => {
              console.log('Received message from leaderboard view:', message);
            }}
          />
          <button onPress={() => setLeaderboardVisible(false)}>Back to Menu</button>
        </vstack>
      );
    }

    return null;
  },
});

export default Devvit;
