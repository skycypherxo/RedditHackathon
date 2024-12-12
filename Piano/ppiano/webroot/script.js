class PianoGame {
    constructor() {
        this.sequence = [];
        this.playerSequence = [];
        this.score = 0;
        this.isPlaying = false;
        this.level = 1;
        this.baseSequenceLength = 4;
        
        this.keys = document.querySelectorAll('.key');
        this.startBtn = document.getElementById('start-btn');
        this.scoreDisplay = document.getElementById('score');
        this.sequenceDisplay = document.querySelector('.sequence-display');
        
        this.sounds = {};
        this.loadSounds();
        
        this.sequenceDelay = 1000;
        
        this.isAutoPlaying = false;
        this.isWatchingPhase = false;
        
        this.init();
    }

    init() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.keys.forEach(key => {
            key.addEventListener('click', () => this.handleKeyClick(key));
        });
    }

    startGame() {
        console.log('Starting game...');
        this.sequence = [];
        this.playerSequence = [];
        this.score = 0;
        this.isPlaying = true;
        this.startBtn.disabled = true;
        this.scoreDisplay.textContent = '0';
        this.sequenceDelay = 1000;
        this.sequenceDisplay.textContent = 'Watch carefully...';
        
        setTimeout(() => {
            this.generateSequence();
            this.playSequence();
        }, 1000);
    }

    generateSequence() {
        console.log('Generating sequence...');
        this.sequence = [];  // Clear existing sequence
        
        // Calculate sequence length based on score
        const additionalNotes = Math.floor(this.score / 10);
        const sequenceLength = this.baseSequenceLength + additionalNotes;
        
        // Generate notes
        for (let i = 0; i < sequenceLength; i++) {
            const randomKey = this.keys[Math.floor(Math.random() * this.keys.length)];
            const noteKey = `${randomKey.dataset.note}${randomKey.dataset.octave}`;
            this.sequence.push(noteKey);
        }
        
        console.log('Generated sequence:', this.sequence);
    }

    async playSequence() {
        console.log('Playing sequence...');
        this.isAutoPlaying = true;
        this.sequenceDisplay.textContent = 'Watch the sequence...';
        
        // Play sequence just once
        for (const noteKey of this.sequence) {
            const key = this.findKeyByNote(noteKey);
            if (key) {
                key.classList.add('active');
                await this.playSound(noteKey);
                key.classList.remove('active');
                await this.sleep(200); // Small gap between notes
            }
        }
        
        this.isAutoPlaying = false;
        this.sequenceDisplay.textContent = 'Your turn! Repeat the sequence';
    }

    findKeyByNote(noteKey) {
        const note = noteKey.slice(0, -1);
        const octave = noteKey.slice(-1);
        return Array.from(this.keys).find(k => 
            k.dataset.note === note && k.dataset.octave === octave
        );
    }

    handleKeyClick(key) {
        if (!this.isPlaying || this.isAutoPlaying || this.isWatchingPhase) {
            return;
        }

        const noteKey = `${key.dataset.note}${key.dataset.octave}`;
        this.playerSequence.push(noteKey);
        this.highlightKey(noteKey);

        if (this.playerSequence[this.playerSequence.length - 1] !== 
            this.sequence[this.playerSequence.length - 1]) {
            this.gameOver();
            return;
        }

        if (this.playerSequence.length === this.sequence.length) {
            this.score += 5;
            this.scoreDisplay.textContent = this.score;
            this.playerSequence = [];
            this.sequenceDisplay.textContent = 'Correct!';
            
            // Send score update to parent
            window.parent.postMessage({
                type: 'updateScore',
                data: { score: this.score }
            }, '*');
            
            setTimeout(() => {
                this.generateSequence();
                this.playSequence();
            }, 2000);
        }
    }

    gameOver() {
        this.isPlaying = false;
        this.startBtn.disabled = false;
        this.sequenceDisplay.textContent = 'Game Over! Press Start to play again';
        
        // Send final score to parent
        window.parent.postMessage({
            type: 'updateScore',
            data: { score: this.score }
        }, '*');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    loadSounds() {
        const notes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
        const octaves = ['4'];
        
        notes.forEach(note => {
            octaves.forEach(octave => {
                const noteKey = `${note}${octave}`;
                const audio = new Audio();
                audio.preload = 'auto';
                audio.src = `./notes/${noteKey}.mp3`;
                
                audio.addEventListener('canplaythrough', () => {
                    console.log(`Successfully loaded: ${noteKey}`);
                });
                
                audio.addEventListener('error', (e) => {
                    console.error(`Failed to load sound for note: ${noteKey}`, e.target.error);
                    console.log('Attempted path:', audio.src);
                });
                
                this.sounds[noteKey] = audio;
            });
        });
    }

    async playSound(noteKey) {
        console.log('Attempting to play:', noteKey);
        
        if (!this.sounds[noteKey]) {
            console.error('Sound not found in sounds object:', noteKey);
            return;
        }

        try {
            const sound = this.sounds[noteKey].cloneNode();
            await sound.play();
            // Just wait for a fixed duration instead of using sequenceDelay
            return new Promise(resolve => {
                setTimeout(resolve, 500); // Reduced from 1000 to make it snappier
            });
        } catch (err) {
            console.error('Error playing sound:', err);
        }
    }

    async highlightKey(noteKey) {
        console.log('Highlighting key:', noteKey);
        const note = noteKey.slice(0, -1);
        const octave = noteKey.slice(-1);
        const key = Array.from(this.keys).find(k => 
            k.dataset.note === note && k.dataset.octave === octave
        );
        
        if (!key) {
            console.error('Key not found:', noteKey);
            return;
        }
        
        key.classList.add('active');
        await this.playSound(noteKey);
        await this.sleep(10);
        key.classList.remove('active');
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const game = new PianoGame();
});
