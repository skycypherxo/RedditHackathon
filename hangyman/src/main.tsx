import { Devvit, useAsync, UIClient } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
  http: true,
});

Devvit.addCustomPostType({
  name: 'Snooman Game',
  render: (context: UIClient) => {
    const [gameStarted, setGameStarted] = context.useState(false);

    // Fetch post data asynchronously
    const { data: postData, error, loading } = useAsync(async () => {
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
      return <text>Error: {error.message}</text>;
    }

    // If game hasn't started, show initial screen
    if (!gameStarted) {
      return (
        <vstack padding="medium" gap="medium" alignment="middle center">
          <text size="xlarge" weight="bold">Snooman UwU</text>
          
          <vstack gap="medium">
            <button 
              onPress={() => {
                if (postData) {
                  console.log('Sending postData to webview:', postData);
                  context.ui.webView.postMessage('fetchWebview', {
                    type: 'devvit-message',
                    message: postData,
                  });
                }
                setGameStarted(true);
              }}
            >
              Start Game
            </button>
            
            <button 
              onPress={() => {
                context.ui.webView.navigate('leaderboard.html');
              }}
            >
              View Leaderboard
            </button>
          </vstack>
        </vstack>
      );
    }

    // When game is started, render the webview
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
      </blocks>
    );
  },
});

export default Devvit;