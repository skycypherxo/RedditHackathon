// Listen for messages from the parent window
window.addEventListener('message', (event) => {
    console.log('Leaderboard received message:', event.data);
    
    // Ignore MetaMask-related messages
    if (event.data.target && event.data.target.includes('metamask')) {
        return; // Ignore MetaMask-related messages
    }
    
    // Update debug display
    document.getElementById('debugData').innerHTML += `
        <br>Received message: ${JSON.stringify(event.data)}
    `;
    
    // Handle the devvit message containing leaderboard data
    if (event.data.type === 'leaderboard-message') {
        const leaderboardData = event.data.message;
        
        // Log the leaderboard data
        console.log('Leaderboard data:', leaderboardData);

        const leaderboardElement = document.getElementById('leaderboard');
        
        // Display the data
        if (leaderboardData && Array.isArray(leaderboardData)) {
            if (leaderboardData.length > 0) {
                leaderboardElement.innerHTML = leaderboardData.map((entry, index) => `
                    <div>${index + 1}. ${entry.username}: ${entry.score}</div>
                `).join('');
            } else {
                leaderboardElement.innerHTML = 'No leaderboard data available';
            }
        } else {
            leaderboardElement.innerHTML = 'Invalid leaderboard data received';
        }
    }
});

// Request leaderboard data when page loads
window.parent.postMessage({
    type: 'getLeaderboard',
    action: 'fetch'
}, '*');
