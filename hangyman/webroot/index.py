from flask import Flask, jsonify, render_template
import praw
import random
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

reddit = praw.Reddit(
    client_id='3P81k3yxN6S9ct8nbeB0lA',
    client_secret='D20m9Nh0YH-ee480I6rPqE8zuLA8iA',
    user_agent='myapp:v1.0 (by /u/Sorry_Dot_8723)'
)

# Route to render the main HTML page
@app.route('/')
def home():
    return "Welcome to the Hangman Game!"

@app.route('/api/fetch-random-post', methods=['GET'])
def fetch_random_post():
    try:
  
        with open('subreddit_list.json', 'r') as file:
            subreddits = json.load(file)

        random_subreddit = random.choice(subreddits)

        reddit_subreddit = reddit.subreddit(random_subreddit)
        top_posts = reddit_subreddit.top(limit=10)
        post_data = None

        for post in top_posts:
            try:
                # Handle image posts (ensure 'preview' exists)
                if hasattr(post, 'preview') and post.preview:
                    post_data = {
                        'image': post.preview['images'][0]['source']['url'],
                        'url': post.url,
                        'subreddit': random_subreddit  # Add subreddit to the response
                    }
                    break
                # Handle text posts
                elif not post.is_video and post.selftext:
                    text_excerpt = ' '.join(post.selftext.split()[:100])
                    post_data = {
                        'text_excerpt': text_excerpt,
                        'url': post.url,
                        'subreddit': random_subreddit  # Add subreddit to the response
                    }
                    break
            except Exception as e:
                print(f"Error processing post: {e}")

        # Return the post data as a JSON response
        if post_data:
            return jsonify(post_data)
        else:
            return jsonify({'error': 'No suitable post found'}), 404

    except Exception as e:
        print(f"Error fetching post: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
