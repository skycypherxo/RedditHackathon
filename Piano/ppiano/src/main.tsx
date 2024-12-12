import './createPost.js';

import { Devvit, useState } from '@devvit/public-api';

// Add type for score data
type ScoreData = {
  username: string;
  score: number;
};

type WebViewMessage = {
  type: 'initialData' | 'updateScore';
  data: { username: string; score?: number };
};

// Add type for Redis ZMember
type ZMember = {
  score: number;
  member: string;
};

Devvit.configure({
  redditAPI: true,
  redis: true,
});

Devvit.addCustomPostType({
  name: 'Piano Game',
  height: 'tall',
  render: (context) => {
    const [webviewVisible, setWebviewVisible] = useState(false);
    const [leaderboardVisible, setLeaderboardVisible] = useState(false);

    const [username] = useState(async () => {
      const currUser = await context.reddit.getCurrentUser();
      if (!currUser?.username) {
        console.error('No username found');
        return null;
      }
      console.log("Current user:", currUser.username);
      return currUser.username;
    });

    const [scores, setScores] = useState<ScoreData[]>(async () => {
      try {
        const result = await context.redis.zRange('piano_scores', 0, 9, {
          reverse: true,
          withScores: true
        });
        
        console.log('Initial Redis result:', result);
        
        const scoreArray: ScoreData[] = [];
        if (Array.isArray(result)) {
          result.forEach(item => {
            if ('member' in item && 'score' in item) {
              scoreArray.push({
                username: String(item.member),
                score: Number(item.score)
              });
            }
          });
        }
        console.log('Processed score array:', scoreArray);
        return scoreArray;
      } catch (error) {
        console.error('Error loading scores:', error);
        return [];
      }
    });

    const onMessage = async (msg: WebViewMessage) => {
      if (msg.type === 'updateScore' && username) {
        try {
          console.log('Received score update:', msg.data);
          
          const score = Number(msg.data.score);
          
          console.log('Storing score for user:', username, 'Score:', score);
          
          if (isNaN(score)) {
            console.error('Invalid score:', score);
            return;
          }

          // Update the user's score in Redis
          const member: ZMember = {
            score: score,
            member: username
          };
          
          console.log('Adding to Redis:', member);
          await context.redis.zAdd('piano_scores', member);
          
          // Refresh leaderboard
          const result = await context.redis.zRange('piano_scores', 0, 9, {
            reverse: true,
            withScores: true
          });
          
          console.log('Updated Redis result:', result);
          
          const scoreArray: ScoreData[] = [];
          if (Array.isArray(result)) {
            result.forEach(item => {
              if ('member' in item && 'score' in item) {
                scoreArray.push({
                  username: String(item.member),
                  score: Number(item.score)
                });
              }
            });
          }
          
          console.log('Updated score array:', scoreArray);
          setScores(scoreArray);
        } catch (error) {
          console.error('Error updating scores:', error);
        }
      }
    };

    const onShowWebviewClick = () => {
      if (!username) {
        console.error('Cannot start game without username');
        return;
      }
      
      setWebviewVisible(true);
      console.log('Sending username to game:', username);
      context.ui.webView.postMessage('myWebView', {
        type: 'initialData',
        data: {
          username: username,
        },
      });
    };

    if (!username) {
      return (
        <vstack padding="medium">
          <text>Please log in to play the game.</text>
        </vstack>
      );
    }

    return (
      <vstack grow padding="small">
        {/* Game Section */}
        <vstack grow>
          <vstack
            grow={!webviewVisible}
            height={webviewVisible ? '0%' : '100%'}
            alignment="middle center"
          >
            <text size="xlarge" weight="bold">
              Piano Game
            </text>
            <spacer />
            <text size="medium" align="center">
              Welcome to the Piano Game! Test your musical skills and have fun playing along.
            </text>
            <spacer />
            <hstack gap="medium">
              <button onPress={onShowWebviewClick}>Enter Game</button>
              <button onPress={() => setLeaderboardVisible(true)}>View Leaderboard</button>
            </hstack>
          </vstack>
          <vstack grow={webviewVisible} height={webviewVisible ? '100%' : '0%'}>
            <webview
              id="myWebView"
              url="page.html"
              onMessage={(msg) => onMessage(msg as WebViewMessage)}
              grow
              height={webviewVisible ? '100%' : '0%'}
            />
          </vstack>
        </vstack>

        {/* Leaderboard Modal */}
        {leaderboardVisible && (
          <vstack
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            backgroundColor="transparent-darker"
            alignment="middle center"
          >
            <vstack
              backgroundColor="background"
              padding="large"
              cornerRadius="large"
              maxWidth="400px"
              gap="medium"
              border="thick"
              borderColor="neutral"
            >
              <hstack alignment="space-between">
                <text size="xlarge" weight="bold">Leaderboard</text>
                <button
                  appearance="subtle"
                  size="small"
                  onPress={() => setLeaderboardVisible(false)}
                >
                  ✕
                </button>
              </hstack>
              
              <text align="center">Playing as: {username}</text>
              <spacer size="small" />
              
              <vstack gap="medium" padding="medium">
                {scores.map((score, i) => (
                  <hstack 
                    key={i} 
                    gap="medium" 
                    alignment="space-between"
                    backgroundColor={i < 3 ? "neutral-transparent" : undefined}
                    padding="small"
                    cornerRadius="medium"
                  >
                    <hstack gap="medium" alignment="center">
                      <text 
                        weight="bold" 
                        color={i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "neutral"}
                      >
                        {i + 1}
                      </text>
                      <text>{score.username}</text>
                    </hstack>
                    <text weight="bold">{score.score}</text>
                  </hstack>
                ))}
              </vstack>
              
              <spacer />
              <button 
                onPress={() => setLeaderboardVisible(false)}
                appearance="secondary"
              >
                Close
              </button>
            </vstack>
          </vstack>
        )}
      </vstack>
    );
  },
});

export default Devvit;
