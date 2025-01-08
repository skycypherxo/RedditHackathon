        // Listen for messages from the parent window
        window.addEventListener('message', (event) => {
            console.log('Received message:', event.data);
            
            const jsonDisplay = document.getElementById('jsonDisplay');
            
            // Display raw message data
            jsonDisplay.innerHTML = 
                '<div class="received-message">Received Message:</div>' +
                JSON.stringify(event.data, null, 2);
        });

        // Request initial data when page loads
        window.parent.postMessage({ type: 'getLeaderboard' }, '*');