// Listen for messages from the parent
window.addEventListener('message', (event) => {
    console.log('Received message in leaderboard:', event.data);
    const { type, data } = event.data;
    
    if (type === 'updateLeaderboard') {
        console.log('Updating leaderboard with data:', data);
        updateLeaderboard(data.scores, data.currentPlayer);
    }
});

function updateLeaderboard(scores, currentPlayer) {
    console.log('Updating leaderboard UI with scores:', scores);
    const leaderboardList = document.getElementById('leaderboard-list');
    const currentPlayerElement = document.getElementById('current-player');
    
    if (currentPlayerElement) {
        currentPlayerElement.textContent = currentPlayer;
    }
    
    if (leaderboardList) {
        if (!scores || scores.length === 0) {
            leaderboardList.innerHTML = '<div class="player-row">No scores yet!</div>';
            return;
        }
        
        leaderboardList.innerHTML = scores.map((score, index) => `
            <div class="player-row ${score.username === currentPlayer ? 'current-player' : ''}">
                <div class="rank rank-${index + 1}">${index + 1}</div>
                <div class="username">${score.username}</div>
                <div class="score">${score.score}</div>
            </div>
        `).join('');
    } else {
        console.error('Leaderboard list element not found');
    }
}

// Add this to check when the script loads
console.log('Leaderboard script loaded');

// Add this to check initial DOM state
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded in leaderboard');
    // Request initial data from parent
    window.parent.postMessage({ type: 'requestLeaderboardData' }, '*');
}); 