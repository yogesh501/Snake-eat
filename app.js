// Snake Game - Fixed Implementation
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game settings
        this.GRID_SIZE = 20;
        this.CANVAS_WIDTH = 480;
        this.CANVAS_HEIGHT = 360;
        this.INITIAL_SPEED = 150;
        this.SPEED_INCREMENT = 5;
        this.POINTS_PER_FOOD = 10;
        this.LEVEL_UP_POINTS = 50;
        
        // Game state
        this.gameState = 'start'; // start, playing, paused, gameOver
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.level = 1;
        this.gameSpeed = this.INITIAL_SPEED;
        this.animationId = null;
        this.lastTime = 0;
        
        // Snake and food
        this.snake = [];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.food = { x: 0, y: 0 };
        
        // Touch controls
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.minSwipeDistance = 30;
        
        // Initialize
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.cacheElements();
        this.bindEvents();
        this.resetGame();
        this.updateUI();
        this.render(); // Initial render
        this.showScreen('startScreen');
        console.log('Snake Game initialized successfully');
    }
    
    setupCanvas() {
        this.canvas.width = this.CANVAS_WIDTH;
        this.canvas.height = this.CANVAS_HEIGHT;
        this.gridWidth = Math.floor(this.CANVAS_WIDTH / this.GRID_SIZE);
        this.gridHeight = Math.floor(this.CANVAS_HEIGHT / this.GRID_SIZE);
        console.log('Grid dimensions:', this.gridWidth, 'x', this.gridHeight);
    }
    
    cacheElements() {
        this.elements = {
            // Screens
            startScreen: document.getElementById('startScreen'),
            pauseScreen: document.getElementById('pauseScreen'),
            gameOverScreen: document.getElementById('gameOverScreen'),
            
            // Buttons
            startButton: document.getElementById('startButton'),
            resumeButton: document.getElementById('resumeButton'),
            restartButton: document.getElementById('restartButton'),
            mobilePause: document.getElementById('mobilePause'),
            mobileRestart: document.getElementById('mobileRestart'),
            
            // UI elements
            currentScore: document.getElementById('currentScore'),
            highScore: document.getElementById('highScore'),
            level: document.getElementById('level'),
            speed: document.getElementById('speed'),
            length: document.getElementById('length'),
            finalScore: document.getElementById('finalScore'),
            highScoreNotice: document.getElementById('highScoreNotice'),
            
            // Touch controls
            dpadButtons: document.querySelectorAll('.dpad-btn')
        };
    }
    
    bindEvents() {
        // Button events
        this.elements.startButton?.addEventListener('click', () => this.startGame());
        this.elements.resumeButton?.addEventListener('click', () => this.resumeGame());
        this.elements.restartButton?.addEventListener('click', () => this.restartGame());
        this.elements.mobilePause?.addEventListener('click', () => this.togglePause());
        this.elements.mobileRestart?.addEventListener('click', () => this.restartGame());
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Touch controls
        this.elements.dpadButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleDirectionInput(e.target.dataset.direction);
            });
            
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleDirectionInput(e.target.dataset.direction);
            }, { passive: false });
        });
        
        // Swipe controls
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        
        // Click outside overlay to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('game-overlay')) {
                this.handleOverlayClick();
            }
        });
        
        // Escape key to close overlays
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
        });
        
        // Window events
        window.addEventListener('resize', () => this.handleResize());
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    }
    
    // Game State Management
    startGame() {
        console.log('Starting game...');
        this.hideAllScreens();
        this.resetGame();
        this.gameState = 'playing';
        this.startGameLoop();
    }
    
    pauseGame() {
        if (this.gameState === 'playing') {
            console.log('Pausing game...');
            this.gameState = 'paused';
            this.stopGameLoop();
            this.showScreen('pauseScreen');
        }
    }
    
    resumeGame() {
        if (this.gameState === 'paused') {
            console.log('Resuming game...');
            this.hideAllScreens();
            this.gameState = 'playing';
            this.startGameLoop();
        }
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.pauseGame();
        } else if (this.gameState === 'paused') {
            this.resumeGame();
        }
    }
    
    restartGame() {
        console.log('Restarting game...');
        this.stopGameLoop();
        this.hideAllScreens();
        this.resetGame();
        this.startGame();
    }
    
    gameOver() {
        console.log('Game over! Score:', this.score);
        this.gameState = 'gameOver';
        this.stopGameLoop();
        
        // Check for high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            this.elements.highScoreNotice?.classList.remove('hidden');
        } else {
            this.elements.highScoreNotice?.classList.add('hidden');
        }
        firebase.database().ref('scores/').push({
  name: playerName,
  score: playerScore,
  date: Date.now()
});

        this.elements.finalScore.textContent = this.score;
        this.updateUI();
        this.showScreen('gameOverScreen');
    }
    
    resetGame() {
        console.log('Resetting game...');
        
        // Reset snake to center
        const centerX = Math.floor(this.gridWidth / 2);
        const centerY = Math.floor(this.gridHeight / 2);
        this.snake = [{ x: centerX, y: centerY }];
        
        // Reset direction
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        
        // Reset game values
        this.score = 0;
        this.level = 1;
        this.gameSpeed = this.INITIAL_SPEED;
        
        // Place food
        this.placeFood();
        this.updateUI();
        
        console.log('Snake initial position:', this.snake[0]);
        console.log('Food position:', this.food);
    }
    
    // Game Loop
    startGameLoop() {
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    stopGameLoop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    gameLoop() {
        if (this.gameState !== 'playing') return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        
        if (deltaTime >= this.gameSpeed) {
            this.update();
            this.lastTime = currentTime;
        }
        
        this.render();
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    // Game Logic
    update() {
        // Apply next direction
        this.direction = { ...this.nextDirection };
        
        // Calculate new head position
        const head = { 
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };
        
        console.log('New head position:', head, 'Grid bounds:', this.gridWidth, 'x', this.gridHeight);
        
        // Check wall collision - Fixed boundary checking
        if (head.x < 0 || head.x >= this.gridWidth || head.y < 0 || head.y >= this.gridHeight) {
            console.log('Wall collision detected');
            this.gameOver();
            return;
        }
        
        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            console.log('Self collision detected');
            this.gameOver();
            return;
        }
        
        // Add new head
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            console.log('Food eaten!');
            this.eatFood();
        } else {
            // Remove tail if no food eaten
            this.snake.pop();
        }
    }
    
    eatFood() {
        this.score += this.POINTS_PER_FOOD;
        this.updateLevel();
        this.placeFood();
        this.updateUI();
        this.playSound('eat');
    }
    
    updateLevel() {
        const newLevel = Math.floor(this.score / this.LEVEL_UP_POINTS) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.gameSpeed = Math.max(this.INITIAL_SPEED - (this.level - 1) * this.SPEED_INCREMENT, 50);
            console.log('Level up! New level:', this.level, 'Speed:', this.gameSpeed);
        }
    }
    
    placeFood() {
        let attempts = 0;
        do {
            this.food = {
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * this.gridHeight)
            };
            attempts++;
        } while (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y) && attempts < 100);
        
        console.log('Food placed at:', this.food);
    }
    
    // Rendering
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw food
        this.drawFood();
        
        // Draw snake
        this.drawSnake();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.gridWidth; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.GRID_SIZE, 0);
            this.ctx.lineTo(x * this.GRID_SIZE, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.gridHeight; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.GRID_SIZE);
            this.ctx.lineTo(this.canvas.width, y * this.GRID_SIZE);
            this.ctx.stroke();
        }
    }
    
    drawSnake() {
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.GRID_SIZE;
            const y = segment.y * this.GRID_SIZE;
            
            // Snake body
            this.ctx.fillStyle = index === 0 ? '#00ff41' : '#00cc33';
            this.ctx.fillRect(x + 1, y + 1, this.GRID_SIZE - 2, this.GRID_SIZE - 2);
            
            // Glow effect for head
            if (index === 0) {
                this.ctx.shadowColor = '#00ff41';
                this.ctx.shadowBlur = 10;
                this.ctx.fillRect(x + 1, y + 1, this.GRID_SIZE - 2, this.GRID_SIZE - 2);
                this.ctx.shadowBlur = 0;
            }
        });
    }
    
    drawFood() {
        const x = this.food.x * this.GRID_SIZE + this.GRID_SIZE / 2;
        const y = this.food.y * this.GRID_SIZE + this.GRID_SIZE / 2;
        
        this.ctx.fillStyle = '#ff0080';
        this.ctx.shadowColor = '#ff0080';
        this.ctx.shadowBlur = 15;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, (this.GRID_SIZE / 2) - 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
    }
    
    // Input Handling
    handleKeydown(e) {
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                if (this.gameState === 'start') {
                    this.startGame();
                } else if (this.gameState === 'playing') {
                    this.pauseGame();
                } else if (this.gameState === 'paused') {
                    this.resumeGame();
                }
                break;
                
            case 'Enter':
                e.preventDefault();
                if (this.gameState === 'gameOver') {
                    this.restartGame();
                } else if (this.gameState === 'start') {
                    this.startGame();
                }
                break;
                
            case 'ArrowUp':
            case 'KeyW':
                e.preventDefault();
                this.handleDirectionInput('up');
                break;
                
            case 'ArrowDown':
            case 'KeyS':
                e.preventDefault();
                this.handleDirectionInput('down');
                break;
                
            case 'ArrowLeft':
            case 'KeyA':
                e.preventDefault();
                this.handleDirectionInput('left');
                break;
                
            case 'ArrowRight':
            case 'KeyD':
                e.preventDefault();
                this.handleDirectionInput('right');
                break;
        }
    }
    
    handleDirectionInput(direction) {
        if (this.gameState === 'start') {
            this.startGame();
            return;
        }
        
        if (this.gameState !== 'playing') return;
        
        const directions = {
            up: { x: 0, y: -1 },
            down: { x: 0, y: 1 },
            left: { x: -1, y: 0 },
            right: { x: 1, y: 0 }
        };
        
        const newDirection = directions[direction];
        if (!newDirection) return;
        
        // Prevent reversing into self
        if (this.snake.length > 1) {
            if (newDirection.x === -this.direction.x && newDirection.y === -this.direction.y) {
                return;
            }
        }
        
        this.nextDirection = newDirection;
        console.log('Direction changed to:', direction, newDirection);
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        if (this.gameState !== 'playing') return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const deltaX = touchEndX - this.touchStartX;
        const deltaY = touchEndY - this.touchStartY;
        
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        
        if (Math.max(absX, absY) < this.minSwipeDistance) return;
        
        if (absX > absY) {
            this.handleDirectionInput(deltaX > 0 ? 'right' : 'left');
        } else {
            this.handleDirectionInput(deltaY > 0 ? 'down' : 'up');
        }
    }
    
    handleOverlayClick() {
        if (this.gameState === 'start') {
            this.startGame();
        } else if (this.gameState === 'paused') {
            this.resumeGame();
        } else if (this.gameState === 'gameOver') {
            this.restartGame();
        }
    }
    
    handleEscapeKey() {
        if (this.gameState === 'playing') {
            this.pauseGame();
        } else if (this.gameState === 'paused') {
            this.resumeGame();
        }
    }
    
    // UI Management
    updateUI() {
        this.elements.currentScore.textContent = this.score;
        this.elements.highScore.textContent = this.highScore;
        this.elements.level.textContent = this.level;
        this.elements.speed.textContent = (this.INITIAL_SPEED / this.gameSpeed).toFixed(1) + 'x';
        this.elements.length.textContent = this.snake.length;
    }
    
    showScreen(screenId) {
        this.hideAllScreens();
        this.elements[screenId]?.classList.remove('hidden');
    }
    
    hideAllScreens() {
        this.elements.startScreen?.classList.add('hidden');
        this.elements.pauseScreen?.classList.add('hidden');
        this.elements.gameOverScreen?.classList.add('hidden');
    }
    
    // Utility Methods
    handleResize() {
        this.render();
    }
    
    handleVisibilityChange() {
        if (document.hidden && this.gameState === 'playing') {
            this.pauseGame();
        }
    }
    
    // Storage
    loadHighScore() {
        try {
            return parseInt(localStorage.getItem('snakeHighScore')) || 0;
        } catch (e) {
            console.warn('Could not load high score:', e);
            return 0;
        }
    }
    
    saveHighScore() {
        try {
            localStorage.setItem('snakeHighScore', this.highScore.toString());
        } catch (e) {
            console.warn('Could not save high score:', e);
        }
    }
    
    // Sound Effects
    playSound(type) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            const now = audioContext.currentTime;
            
            if (type === 'eat') {
                oscillator.frequency.setValueAtTime(800, now);
                oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
                gainNode.gain.setValueAtTime(0.1, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                oscillator.start(now);
                oscillator.stop(now + 0.1);
            }
        } catch (e) {
            // Silently fail if audio context is not available
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});