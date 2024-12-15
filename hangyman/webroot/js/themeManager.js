// Theme management functionality
const themes = ['kawaii', 'space', 'neon', 'techie', 'retro', 'gothic'];
let currentTheme = '';

// Load theme stylesheets
themes.forEach(theme => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `themes/${theme}.css`;
    document.head.appendChild(link);
});

// Create theme background element
const themeBackground = document.createElement('div');
themeBackground.className = 'theme-background';
document.body.insertBefore(themeBackground, document.body.firstChild);

// Create decorative elements for kawaii theme
function createKawaiiElements() {
    const gameContainer = document.querySelector('.game-container');
    const containerWidth = gameContainer.clientWidth; 

    // Create bubbles
    for (let i = 0; i < 15; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'kawaii-bubble';
        bubble.style.left = `${Math.random() * (containerWidth - 30)}px`; // Limit position within container
        bubble.style.animationDelay = `${Math.random() * 15}s`; // Random delay for variety
        gameContainer.appendChild(bubble); // Append inside game-container
    }

    // Create floating decorations
    const decorations = ['🌸', '⭐', '💖', '✨'];
    decorations.forEach((decoration, index) => {
        const element = document.createElement('div');
        element.className = 'kawaii-decoration';
        element.textContent = decoration;
        element.style.left = `${Math.random() * (containerWidth - 30)}px`; // Limit position within container
        element.style.animationDelay = `${Math.random() * 10}s`; // Random delay for variety
        gameContainer.appendChild(element); // Append inside game-container
    });
}





export function setTheme(theme) {
    // Clean up previous theme elements
    document.querySelectorAll('.kawaii-bubble, .kawaii-decoration, .gothic-fog, .gothic-particle, .gothic-web')
        .forEach(el => el.remove());

    // Remove previous theme
    if (currentTheme) {
        document.body.classList.remove(currentTheme);
    }
    
    // Apply new theme
    document.body.classList.add(theme);
    currentTheme = theme;
    
    // Add theme-specific elements
    if (theme === 'kawaii') {
        createKawaiiElements();
    } 
    
    // Save theme preference
    localStorage.setItem('preferred-theme', theme);
}

export function initializeThemes() {
    // Load saved theme or default to 'space'
    const savedTheme = localStorage.getItem('preferred-theme') || 'space';
    setTheme(savedTheme);
    
    // Add click handlers to theme icons
    document.querySelectorAll('.theme-icon').forEach(icon => {
        icon.addEventListener('click', () => {
            const theme = icon.dataset.theme;
            setTheme(theme);
        });
    });
}