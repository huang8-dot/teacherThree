// Game Constants
const GRID_SIZE = 10;
const CELL_SIZE = 80;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;

// Directions
const DIRECTIONS = {
    NORTH: { name: 'North ↑', dx: 0, dy: -1, angle: 0 },
    EAST: { name: 'East →', dx: 1, dy: 0, angle: 90 },
    SOUTH: { name: 'South ↓', dx: 0, dy: 1, angle: 180 },
    WEST: { name: 'West ←', dx: -1, dy: 0, angle: 270 }
};

const DIRECTION_ORDER = ['NORTH', 'EAST', 'SOUTH', 'WEST'];

// Daily Rewards System
const DAILY_REWARD_LIMIT = 3;
let REWARDS = [
    { name: '免作业1次', emoji: '📝', color: '#ff6b6b' },
    { name: '糖果1个', emoji: '🍬', color: '#feca57' },
    { name: '一支笔', emoji: '✏️', color: '#48dbfb' }
];

// Load custom rewards from localStorage
function loadCustomRewards() {
    const saved = localStorage.getItem('customRewards');
    if (saved) {
        try {
            REWARDS = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to load custom rewards:', e);
        }
    }
}

// Save custom rewards to localStorage
function saveCustomRewards() {
    localStorage.setItem('customRewards', JSON.stringify(REWARDS));
}

const PRAISE_MESSAGES = [
    '你真棒！继续加油！ You are amazing!',
    '太厉害了！真聪明！ So clever!',
    '做得很好！你是最棒的！ Great job!',
    '真是个小天才！ You are a genius!',
    '表现优秀！继续努力！ Excellent work!',
    '你学得真快！ You learn so fast!',
    '太出色了！ Outstanding!',
    '你是我们的小明星！ You are our star!'
];

// Map tile types
const TILE_TYPES = {
    GRASS: 0,      // 草地 - 不可通行
    ROAD: 1,       // 道路 - 可通行
    BUILDING: 2    // 建筑 - 不可通行
};

// Road types for visual variety
const ROAD_TYPES = [
    { name: 'Road 道路', color: '#95a5a6' },
    { name: 'Street 街道', color: '#7f8c8d' },
    { name: 'Avenue 大道', color: '#6c7a89' }
];

// Building types for obstacles
const BUILDING_TYPES = [
    { name: 'Office 办公楼', emoji: '🏢', color: '#95a5a6' },
    { name: 'Apartment 公寓', emoji: '🏘️', color: '#7f8c8d' },
    { name: 'House 住宅', emoji: '🏠', color: '#bdc3c7' },
    { name: 'Hotel 酒店', emoji: '🏨', color: '#95a5a6' },
    { name: 'Bank 银行', emoji: '🏦', color: '#7f8c8d' },
    { name: 'Tower 塔楼', emoji: '🗼', color: '#95a5a6' },
    { name: 'Factory 工厂', emoji: '🏭', color: '#7f8c8d' },
    { name: 'Station 车站', emoji: '🚉', color: '#bdc3c7' }
];

// Places with colors and emojis
const PLACES = {
    easy: [
        { name: 'Hospital 医院', emoji: '🏥', color: '#ff6b6b' },
        { name: 'School 学校', emoji: '🏫', color: '#4ecdc4' },
        { name: 'Park 公园', emoji: '🌳', color: '#95e1d3' },
        { name: 'Shop 商店', emoji: '🏪', color: '#f9ca24' }
    ],
    medium: [
        { name: 'Hospital 医院', emoji: '🏥', color: '#ff6b6b' },
        { name: 'School 学校', emoji: '🏫', color: '#4ecdc4' },
        { name: 'Park 公园', emoji: '🌳', color: '#95e1d3' },
        { name: 'Shop 商店', emoji: '🏪', color: '#f9ca24' },
        { name: 'Museum 博物馆', emoji: '🏛️', color: '#a29bfe' },
        { name: 'Library 图书馆', emoji: '📚', color: '#fd79a8' }
    ],
    hard: [
        { name: 'Hospital 医院', emoji: '🏥', color: '#ff6b6b' },
        { name: 'School 学校', emoji: '🏫', color: '#4ecdc4' },
        { name: 'Park 公园', emoji: '🌳', color: '#95e1d3' },
        { name: 'Shop 商店', emoji: '🏪', color: '#f9ca24' },
        { name: 'Museum 博物馆', emoji: '🏛️', color: '#a29bfe' },
        { name: 'Library 图书馆', emoji: '📚', color: '#fd79a8' },
        { name: 'Mall 购物中心', emoji: '🏬', color: '#ffeaa7' },
        { name: 'Restaurant 餐厅', emoji: '🍽️', color: '#fab1a0' }
    ]
};

// Game State
let gameState = {
    player: { x: 0, y: 0, direction: 'NORTH' },
    player2: { x: 9, y: 9, direction: 'SOUTH' },
    currentPlayer: 1,
    destination: null,
    score: 0,
    bestScore: 0,
    steps: 0,
    difficulty: 'medium',
    gameMode: 'single',
    map: [],
    roadTypes: [],
    places: [],
    buildings: [],
    hoveredBuilding: null,
    hoveredRoad: null,
    startTime: Date.now(),
    dailyRewards: {
        date: new Date().toDateString(),
        count: 0
    }
};

// Load daily rewards from localStorage
function loadDailyRewards() {
    const saved = localStorage.getItem('dailyRewards');
    if (saved) {
        const data = JSON.parse(saved);
        const today = new Date().toDateString();
        if (data.date === today) {
            gameState.dailyRewards = data;
        } else {
            // New day, reset count
            gameState.dailyRewards = {
                date: today,
                count: 0
            };
            saveDailyRewards();
        }
    }
}

// Save daily rewards to localStorage
function saveDailyRewards() {
    localStorage.setItem('dailyRewards', JSON.stringify(gameState.dailyRewards));
}

// Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Initialize Game
function initGame() {
    // Load best score
    const savedBestScore = localStorage.getItem('bestScore');
    if (savedBestScore) {
        gameState.bestScore = parseInt(savedBestScore);
        document.getElementById('best-score').textContent = gameState.bestScore;
    }
    
    // Load daily rewards
    loadDailyRewards();
    
    // Load custom rewards
    loadCustomRewards();

    // Generate map
    generateMap();
    
    // Set random destination
    setRandomDestination();
    
    // Reset player positions
    resetPlayers();
    
    // Reset game stats
    gameState.score = 0;
    gameState.steps = 0;
    gameState.startTime = Date.now();
    gameState.currentPlayer = 1;
    
    updateDisplay();
    drawGame();
}

// Generate Map with road network
function generateMap() {
    // Create empty map (all grass initially)
    gameState.map = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(TILE_TYPES.GRASS));
    gameState.buildings = [];
    gameState.roadTypes = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(null));
    
    // Generate road network
    generateRoadNetwork();
    
    // Place buildings on grass areas
    const difficulty = gameState.difficulty;
    let buildingCount = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 12 : 16;
    
    let placedBuildings = 0;
    let attempts = 0;
    const maxAttempts = 1000;
    
    while (placedBuildings < buildingCount && attempts < maxAttempts) {
        const x = Math.floor(Math.random() * GRID_SIZE);
        const y = Math.floor(Math.random() * GRID_SIZE);
        
        // Can only place buildings on grass
        if (gameState.map[y][x] === TILE_TYPES.GRASS) {
            gameState.map[y][x] = TILE_TYPES.BUILDING;
            
            // Assign random building type
            const buildingType = BUILDING_TYPES[Math.floor(Math.random() * BUILDING_TYPES.length)];
            gameState.buildings.push({
                ...buildingType,
                x: x,
                y: y
            });
            placedBuildings++;
        }
        attempts++;
    }
    
    // Place named places on roads
    const placesArray = PLACES[difficulty];
    gameState.places = [];
    
    for (let i = 0; i < placesArray.length; i++) {
        let x, y;
        let attempts = 0;
        do {
            x = Math.floor(Math.random() * GRID_SIZE);
            y = Math.floor(Math.random() * GRID_SIZE);
            attempts++;
        } while ((gameState.map[y][x] !== TILE_TYPES.ROAD || 
                 gameState.places.some(p => p.x === x && p.y === y)) && 
                 attempts < 100);
        
        // If found a valid road position
        if (gameState.map[y][x] === TILE_TYPES.ROAD) {
            gameState.places.push({
                ...placesArray[i],
                x: x,
                y: y
            });
        }
    }
}

// Generate connected road network
function generateRoadNetwork() {
    const difficulty = gameState.difficulty;
    
    // Create main roads (horizontal and vertical)
    const roadSpacing = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;
    
    // Vertical roads
    for (let x = 1; x < GRID_SIZE; x += roadSpacing) {
        for (let y = 0; y < GRID_SIZE; y++) {
            gameState.map[y][x] = TILE_TYPES.ROAD;
            gameState.roadTypes[y][x] = ROAD_TYPES[Math.floor(Math.random() * ROAD_TYPES.length)];
        }
    }
    
    // Horizontal roads
    for (let y = 1; y < GRID_SIZE; y += roadSpacing) {
        for (let x = 0; x < GRID_SIZE; x++) {
            gameState.map[y][x] = TILE_TYPES.ROAD;
            if (!gameState.roadTypes[y][x]) {
                gameState.roadTypes[y][x] = ROAD_TYPES[Math.floor(Math.random() * ROAD_TYPES.length)];
            }
        }
    }
    
    // Add some random connecting roads for more complexity
    const extraRoads = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 12;
    for (let i = 0; i < extraRoads; i++) {
        const isHorizontal = Math.random() > 0.5;
        if (isHorizontal) {
            const y = Math.floor(Math.random() * GRID_SIZE);
            for (let x = 0; x < GRID_SIZE; x++) {
                if (gameState.map[y][x] !== TILE_TYPES.ROAD) {
                    gameState.map[y][x] = TILE_TYPES.ROAD;
                    gameState.roadTypes[y][x] = ROAD_TYPES[0];
                }
            }
        } else {
            const x = Math.floor(Math.random() * GRID_SIZE);
            for (let y = 0; y < GRID_SIZE; y++) {
                if (gameState.map[y][x] !== TILE_TYPES.ROAD) {
                    gameState.map[y][x] = TILE_TYPES.ROAD;
                    gameState.roadTypes[y][x] = ROAD_TYPES[0];
                }
            }
        }
    }
}

// Reset Players
function resetPlayers() {
    // Find valid starting positions on roads
    do {
        gameState.player.x = Math.floor(Math.random() * GRID_SIZE);
        gameState.player.y = Math.floor(Math.random() * GRID_SIZE);
    } while (gameState.map[gameState.player.y][gameState.player.x] !== TILE_TYPES.ROAD);
    
    gameState.player.direction = 'NORTH';
    
    if (gameState.gameMode === 'two-player') {
        do {
            gameState.player2.x = Math.floor(Math.random() * GRID_SIZE);
            gameState.player2.y = Math.floor(Math.random() * GRID_SIZE);
        } while (gameState.map[gameState.player2.y][gameState.player2.x] !== TILE_TYPES.ROAD || 
                 (gameState.player2.x === gameState.player.x && gameState.player2.y === gameState.player.y));
        
        gameState.player2.direction = 'SOUTH';
    }
}

// Set Random Destination
function setRandomDestination() {
    const randomIndex = Math.floor(Math.random() * gameState.places.length);
    gameState.destination = gameState.places[randomIndex];
    document.getElementById('destination').textContent = gameState.destination.name;
}

// Draw Game
function drawGame() {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Draw grid and map
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const tileType = gameState.map[y][x];
            
            // Draw cell background based on tile type
            if (tileType === TILE_TYPES.BUILDING) {
                // Building - with shadow
                const building = gameState.buildings.find(b => b.x === x && b.y === y);
                
                // Draw shadow first
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(x * CELL_SIZE + 4, y * CELL_SIZE + 4, CELL_SIZE, CELL_SIZE);
                
                // Draw building
                if (building) {
                    ctx.fillStyle = building.color;
                } else {
                    ctx.fillStyle = '#95a5a6';
                }
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                
                // Draw building border for depth
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.lineWidth = 2;
                ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                
                // Draw building emoji
                if (building) {
                    ctx.font = 'bold 28px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    // Add text shadow for emoji
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                    ctx.shadowBlur = 2;
                    ctx.shadowOffsetX = 1;
                    ctx.shadowOffsetY = 1;
                    
                    ctx.fillText(building.emoji, x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2);
                    
                    // Reset shadow
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                }
            } else if (tileType === TILE_TYPES.ROAD) {
                // Road - realistic asphalt texture
                const roadType = gameState.roadTypes[y][x];
                ctx.fillStyle = roadType ? roadType.color : '#4a4a4a';
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                
                // Add subtle road texture (random dots)
                ctx.fillStyle = 'rgba(80, 80, 80, 0.3)';
                for (let i = 0; i < 5; i++) {
                    const px = x * CELL_SIZE + Math.random() * CELL_SIZE;
                    const py = y * CELL_SIZE + Math.random() * CELL_SIZE;
                    ctx.fillRect(px, py, 1, 1);
                }
                
                // Draw edge lines only at road boundaries
                const hasNonRoadUp = (y > 0 && gameState.map[y-1][x] !== TILE_TYPES.ROAD);
                const hasNonRoadDown = (y < GRID_SIZE-1 && gameState.map[y+1][x] !== TILE_TYPES.ROAD);
                const hasNonRoadLeft = (x > 0 && gameState.map[y][x-1] !== TILE_TYPES.ROAD);
                const hasNonRoadRight = (x < GRID_SIZE-1 && gameState.map[y][x+1] !== TILE_TYPES.ROAD);
                
                ctx.strokeStyle = '#2a2a2a';
                ctx.lineWidth = 2;
                ctx.beginPath();
                if (hasNonRoadUp) {
                    ctx.moveTo(x * CELL_SIZE, y * CELL_SIZE);
                    ctx.lineTo((x + 1) * CELL_SIZE, y * CELL_SIZE);
                }
                if (hasNonRoadDown) {
                    ctx.moveTo(x * CELL_SIZE, (y + 1) * CELL_SIZE);
                    ctx.lineTo((x + 1) * CELL_SIZE, (y + 1) * CELL_SIZE);
                }
                if (hasNonRoadLeft) {
                    ctx.moveTo(x * CELL_SIZE, y * CELL_SIZE);
                    ctx.lineTo(x * CELL_SIZE, (y + 1) * CELL_SIZE);
                }
                if (hasNonRoadRight) {
                    ctx.moveTo((x + 1) * CELL_SIZE, y * CELL_SIZE);
                    ctx.lineTo((x + 1) * CELL_SIZE, (y + 1) * CELL_SIZE);
                }
                ctx.stroke();
            } else {
                // Grass - natural look with base color and vegetation overlay
                ctx.fillStyle = '#d4d4d4'; // Light gray base
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                
                // Semi-transparent green vegetation overlay
                ctx.fillStyle = 'rgba(149, 225, 211, 0.4)';
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                
                // Add grass texture dots
                ctx.fillStyle = 'rgba(125, 211, 192, 0.3)';
                for (let i = 0; i < 8; i++) {
                    const px = x * CELL_SIZE + Math.random() * CELL_SIZE;
                    const py = y * CELL_SIZE + Math.random() * CELL_SIZE;
                    ctx.fillRect(px, py, 2, 2);
                }
            }
        }
    }
    
    // Draw places
    gameState.places.forEach(place => {
        const isDestination = place === gameState.destination;
        const x = place.x;
        const y = place.y;
        
        // Draw shadow for place
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(x * CELL_SIZE + 9, y * CELL_SIZE + 9, CELL_SIZE - 10, CELL_SIZE - 10);
        
        // Draw place background
        ctx.fillStyle = place.color;
        ctx.globalAlpha = isDestination ? 1 : 0.7;
        ctx.fillRect(x * CELL_SIZE + 5, y * CELL_SIZE + 5, CELL_SIZE - 10, CELL_SIZE - 10);
        ctx.globalAlpha = 1;
        
        // Draw place border for depth
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x * CELL_SIZE + 5, y * CELL_SIZE + 5, CELL_SIZE - 10, CELL_SIZE - 10);
        
        // Draw emoji with shadow
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillText(place.emoji, x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw destination marker
        if (isDestination) {
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 4;
            ctx.strokeRect(x * CELL_SIZE + 2, y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
            
            // Add pulsing glow effect for destination
            ctx.strokeStyle = 'rgba(231, 76, 60, 0.3)';
            ctx.lineWidth = 8;
            ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    });
    
    // Draw hovered building/place tooltip
    if (gameState.hoveredBuilding) {
        const item = gameState.hoveredBuilding;
        const tooltipX = item.x * CELL_SIZE + CELL_SIZE / 2;
        const tooltipY = item.y * CELL_SIZE - 10;
        
        drawTooltip(tooltipX, tooltipY, item.name);
    }
    
    // Draw hovered road tooltip
    if (gameState.hoveredRoad && !gameState.hoveredBuilding) {
        // Draw at top of canvas
        ctx.font = 'bold 14px Arial';
        const text = gameState.hoveredRoad.name;
        const textWidth = ctx.measureText(text).width;
        const padding = 8;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(
            CANVAS_SIZE / 2 - textWidth / 2 - padding,
            5,
            textWidth + padding * 2,
            24
        );
        
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, CANVAS_SIZE / 2, 17);
    }
    
    // Draw players
    drawPlayer(gameState.player, '#3498db', 1);
    if (gameState.gameMode === 'two-player') {
        drawPlayer(gameState.player2, '#e74c3c', 2);
    }
}

// Helper function to draw tooltip
function drawTooltip(x, y, text) {
    ctx.font = 'bold 14px Arial';
    const textWidth = ctx.measureText(text).width;
    const padding = 8;
    const tooltipWidth = textWidth + padding * 2;
    const tooltipHeight = 24;
    
    // Draw tooltip background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.beginPath();
    ctx.roundRect(
        x - tooltipWidth / 2,
        y - tooltipHeight,
        tooltipWidth,
        tooltipHeight,
        5
    );
    ctx.fill();
    
    // Draw tooltip text
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y - tooltipHeight / 2);
    
    // Draw arrow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.beginPath();
    ctx.moveTo(x, y - 2);
    ctx.lineTo(x - 5, y - 8);
    ctx.lineTo(x + 5, y - 8);
    ctx.closePath();
    ctx.fill();
}

// Draw Player
function drawPlayer(player, color, playerNum) {
    const centerX = player.x * CELL_SIZE + CELL_SIZE / 2;
    const centerY = player.y * CELL_SIZE + CELL_SIZE / 2;
    
    // Draw player circle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw player number
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(playerNum, centerX, centerY);
    
    // Draw direction arrow
    const dir = DIRECTIONS[player.direction];
    const arrowLength = 20;
    const arrowX = centerX + dir.dx * 30;
    const arrowY = centerY + dir.dy * 30;
    
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(arrowX, arrowY);
    ctx.stroke();
    
    // Draw arrowhead
    const headlen = 10;
    const angle = Math.atan2(dir.dy, dir.dx);
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(arrowX - headlen * Math.cos(angle - Math.PI / 6), arrowY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(arrowX - headlen * Math.cos(angle + Math.PI / 6), arrowY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

// Player Actions
function turnLeft() {
    const player = getCurrentPlayer();
    const currentIndex = DIRECTION_ORDER.indexOf(player.direction);
    player.direction = DIRECTION_ORDER[(currentIndex + 3) % 4];
    updateDisplay();
    drawGame();
    nextTurn();
}

function turnRight() {
    const player = getCurrentPlayer();
    const currentIndex = DIRECTION_ORDER.indexOf(player.direction);
    player.direction = DIRECTION_ORDER[(currentIndex + 1) % 4];
    updateDisplay();
    drawGame();
    nextTurn();
}

function goForward() {
    const player = getCurrentPlayer();
    const dir = DIRECTIONS[player.direction];
    const newX = player.x + dir.dx;
    const newY = player.y + dir.dy;
    
    // Check boundaries
    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
        showMessage('Cannot go outside the map! 不能越界！');
        return;
    }
    
    // Check if can move to this position (must be on road)
    if (gameState.map[newY][newX] !== TILE_TYPES.ROAD) {
        if (gameState.map[newY][newX] === TILE_TYPES.BUILDING) {
            showMessage('Cannot walk through buildings! 不能穿过建筑！');
        } else {
            showMessage('Must stay on the road! 必须在道路上行走！');
        }
        return;
    }
    
    // Move player
    player.x = newX;
    player.y = newY;
    gameState.steps++;
    
    updateDisplay();
    drawGame();
    
    // Check if reached destination
    checkDestination();
    
    nextTurn();
}

function getCurrentPlayer() {
    if (gameState.gameMode === 'single') {
        return gameState.player;
    } else {
        return gameState.currentPlayer === 1 ? gameState.player : gameState.player2;
    }
}

function nextTurn() {
    if (gameState.gameMode === 'two-player') {
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
        updateDisplay();
    }
}

// Check Destination
function checkDestination() {
    const player = getCurrentPlayer();
    if (player.x === gameState.destination.x && player.y === gameState.destination.y) {
        // Calculate score
        const timeTaken = (Date.now() - gameState.startTime) / 1000; // seconds
        const timeScore = Math.max(0, 100 - Math.floor(timeTaken));
        const stepScore = Math.max(0, 100 - gameState.steps * 5);
        const totalScore = timeScore + stepScore;
        
        gameState.score += totalScore;
        
        // Update best score
        if (gameState.score > gameState.bestScore) {
            gameState.bestScore = gameState.score;
            localStorage.setItem('bestScore', gameState.bestScore);
        }
        
        // Show treasure chest with reward
        showTreasureChest();
        
        // Set new destination after delay
        setTimeout(() => {
            setRandomDestination();
            gameState.steps = 0;
            gameState.startTime = Date.now();
            updateDisplay();
            drawGame();
        }, 4000);
    }
}

// Show Treasure Chest Animation
function showTreasureChest() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'treasure-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    // Check if can get reward today
    const canGetReward = gameState.dailyRewards.count < DAILY_REWARD_LIMIT;
    let rewardContent;
    
    if (canGetReward) {
        // Random reward
        const reward = REWARDS[Math.floor(Math.random() * REWARDS.length)];
        gameState.dailyRewards.count++;
        saveDailyRewards();
        
        rewardContent = `
            <div class="reward-item">
                <div class="reward-emoji">${reward.emoji}</div>
                <div class="reward-name">${reward.name}</div>
                <div class="reward-count">今日奖励: ${gameState.dailyRewards.count}/${DAILY_REWARD_LIMIT}</div>
            </div>
        `;
    } else {
        // Praise message only
        const praise = PRAISE_MESSAGES[Math.floor(Math.random() * PRAISE_MESSAGES.length)];
        rewardContent = `
            <div class="reward-item">
                <div class="reward-emoji">🌟</div>
                <div class="praise-message">${praise}</div>
                <div class="reward-count">今日奖励已达上限 (${DAILY_REWARD_LIMIT}/${DAILY_REWARD_LIMIT})</div>
            </div>
        `;
    }
    
    // Create treasure chest
    const chest = document.createElement('div');
    chest.className = 'treasure-chest';
    chest.innerHTML = `
        <div class="chest-animation">
            <div class="chest-box closed" id="chestBox">
                <div class="chest-top">🎁</div>
            </div>
        </div>
        <div class="reward-display" id="rewardDisplay" style="display: none;">
            ${rewardContent}
        </div>
    `;
    
    overlay.appendChild(chest);
    document.body.appendChild(overlay);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        @keyframes shake {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-5deg); }
            75% { transform: rotate(5deg); }
        }
        
        @keyframes openChest {
            0% { transform: rotateX(0deg); }
            100% { transform: rotateX(-120deg); }
        }
        
        @keyframes slideUp {
            from { 
                opacity: 0;
                transform: translateY(50px);
            }
            to { 
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .treasure-chest {
            text-align: center;
        }
        
        .chest-animation {
            margin-bottom: 30px;
        }
        
        .chest-box {
            font-size: 120px;
            cursor: pointer;
            animation: bounce 1s infinite;
            transition: all 0.5s;
            display: inline-block;
        }
        
        .chest-box:hover {
            transform: scale(1.15);
        }
        
        .chest-box.opening {
            animation: shake 0.5s;
        }
        
        .chest-box.opened .chest-top {
            animation: openChest 0.5s forwards;
        }
        
        .reward-display {
            animation: slideUp 0.5s ease;
        }
        
        .reward-item {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            color: white;
            min-width: 300px;
        }
        
        .reward-emoji {
            font-size: 100px;
            margin-bottom: 20px;
            animation: bounce 1s infinite;
        }
        
        .reward-name {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 15px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .praise-message {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 15px;
            line-height: 1.5;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .reward-count {
            font-size: 16px;
            opacity: 0.9;
            margin-top: 10px;
        }
    `;
    document.head.appendChild(style);
    
    // Open chest on click
    const chestBox = document.getElementById('chestBox');
    const rewardDisplay = document.getElementById('rewardDisplay');
    
    chestBox.addEventListener('click', () => {
        chestBox.classList.add('opening');
        setTimeout(() => {
            chestBox.classList.add('opened');
            setTimeout(() => {
                chestBox.style.display = 'none';
                rewardDisplay.style.display = 'block';
            }, 500);
        }, 500);
    });
    
    // Click anywhere to close after opening
    setTimeout(() => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay || rewardDisplay.style.display === 'block') {
                overlay.style.animation = 'fadeIn 0.3s reverse';
                setTimeout(() => overlay.remove(), 300);
            }
        });
    }, 1000);
}

// Update Display
function updateDisplay() {
    document.getElementById('current-score').textContent = gameState.score;
    document.getElementById('best-score').textContent = gameState.bestScore;
    document.getElementById('steps').textContent = gameState.steps;
    
    const player = getCurrentPlayer();
    document.getElementById('current-direction').textContent = DIRECTIONS[player.direction].name;
    
    if (gameState.gameMode === 'two-player') {
        document.getElementById('turn-display').style.display = 'block';
        document.getElementById('current-turn').textContent = `Player ${gameState.currentPlayer}`;
    } else {
        document.getElementById('turn-display').style.display = 'none';
    }
}

// Show Message
function showMessage(message, isSuccess = false) {
    const existingMsg = document.querySelector('.game-message');
    if (existingMsg) existingMsg.remove();
    
    const msgDiv = document.createElement('div');
    msgDiv.className = 'game-message';
    msgDiv.textContent = message;
    msgDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${isSuccess ? '#2ecc71' : '#e74c3c'};
        color: white;
        padding: 20px 40px;
        border-radius: 10px;
        font-size: 20px;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        animation: fadeInOut 2s forwards;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(msgDiv);
    setTimeout(() => msgDiv.remove(), 2000);
}

// Event Listeners
document.getElementById('turn-left').addEventListener('click', turnLeft);
document.getElementById('turn-right').addEventListener('click', turnRight);
document.getElementById('go-forward').addEventListener('click', goForward);

document.getElementById('restart-btn').addEventListener('click', () => {
    initGame();
    showMessage('Game restarted! 游戏重新开始！');
});

document.getElementById('difficulty').addEventListener('change', (e) => {
    gameState.difficulty = e.target.value;
    initGame();
});

document.getElementById('game-mode-select').addEventListener('change', (e) => {
    gameState.gameMode = e.target.value;
    document.getElementById('game-mode').textContent = 
        e.target.value === 'single' ? 'Single Player 单人' : 'Two Players 双人';
    initGame();
});

// Admin button - password protected
document.getElementById('admin-btn').addEventListener('click', () => {
    showAdminLogin();
});

// Show admin login dialog
function showAdminLogin() {
    const overlay = document.createElement('div');
    overlay.className = 'admin-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    const loginBox = document.createElement('div');
    loginBox.innerHTML = `
        <div class="admin-login-box">
            <h2>🔒 管理员登录 Admin Login</h2>
            <div class="login-form">
                <input type="password" id="admin-password" placeholder="请输入密码 Enter Password" />
                <div class="login-buttons">
                    <button id="login-confirm-btn" class="login-btn confirm">登录 Login</button>
                    <button id="login-cancel-btn" class="login-btn cancel">取消 Cancel</button>
                </div>
                <div id="login-error" class="login-error" style="display: none;">密码错误！Password incorrect!</div>
            </div>
        </div>
    `;
    
    overlay.appendChild(loginBox);
    document.body.appendChild(overlay);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .admin-login-box {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            min-width: 350px;
            text-align: center;
        }
        
        .admin-login-box h2 {
            color: #333;
            margin-bottom: 30px;
            font-size: 24px;
        }
        
        .login-form {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        #admin-password {
            padding: 12px 20px;
            border: 2px solid #ffd93d;
            border-radius: 10px;
            font-size: 16px;
            text-align: center;
            transition: border-color 0.3s;
        }
        
        #admin-password:focus {
            outline: none;
            border-color: #ff6b9d;
        }
        
        .login-buttons {
            display: flex;
            gap: 10px;
        }
        
        .login-btn {
            flex: 1;
            padding: 12px 20px;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .login-btn.confirm {
            background: linear-gradient(135deg, #ffd93d 0%, #ff6b9d 100%);
            color: white;
        }
        
        .login-btn.confirm:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 107, 157, 0.4);
        }
        
        .login-btn.cancel {
            background: #95a5a6;
            color: white;
        }
        
        .login-btn.cancel:hover {
            background: #7f8c8d;
        }
        
        .login-error {
            color: #e74c3c;
            font-weight: bold;
            animation: shake 0.5s;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
        
        .admin-panel {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            min-width: 450px;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
        }
        
        .admin-panel h2 {
            color: #333;
            margin-bottom: 30px;
            text-align: center;
            font-size: 24px;
        }
        
        .admin-info {
            background: linear-gradient(135deg, #fff9e6 0%, #ffe5ec 100%);
            padding: 20px;
            border-radius: 15px;
            margin-bottom: 20px;
            border: 2px solid #ffd93d;
        }
        
        .admin-info-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #ffd93d;
        }
        
        .admin-info-item:last-child {
            border-bottom: none;
        }
        
        .admin-info-label {
            font-weight: bold;
            color: #666;
        }
        
        .admin-info-value {
            color: #ff6b9d;
            font-weight: bold;
        }
        
        .admin-actions {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .admin-action-btn {
            padding: 15px 20px;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            color: white;
        }
        
        .admin-action-btn.reset {
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
        }
        
        .admin-action-btn.reset:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
        }
        
        .admin-action-btn.close {
            background: #95a5a6;
        }
        
        .admin-action-btn.close:hover {
            background: #7f8c8d;
        }
        
        .rewards-config-section {
            margin: 20px 0;
            padding: 20px;
            background: linear-gradient(135deg, #f5f7fa 0%, #e8f4f8 100%);
            border-radius: 15px;
            border: 2px solid #ffd93d;
        }
        
        .rewards-config-section h3 {
            color: #333;
            margin-bottom: 20px;
            font-size: 18px;
            text-align: center;
        }
        
        .rewards-config-list {
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .reward-config-item {
            display: flex;
            align-items: center;
            gap: 10px;
            background: white;
            padding: 12px;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .reward-number {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #ffd93d 0%, #ff6b9d 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 16px;
            flex-shrink: 0;
        }
        
        .reward-emoji-input {
            width: 60px;
            padding: 8px;
            border: 2px solid #ffd93d;
            border-radius: 8px;
            font-size: 24px;
            text-align: center;
            transition: border-color 0.3s;
        }
        
        .reward-emoji-input:focus {
            outline: none;
            border-color: #ff6b9d;
        }
        
        .reward-name-input {
            flex: 1;
            padding: 10px 15px;
            border: 2px solid #ffd93d;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        
        .reward-name-input:focus {
            outline: none;
            border-color: #ff6b9d;
        }
        
        .admin-action-btn.save {
            background: linear-gradient(135deg, #48dbfb 0%, #0abde3 100%);
            width: 100%;
        }
        
        .admin-action-btn.save:hover {
            background: linear-gradient(135deg, #0abde3 0%, #00a8cc 100%);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(72, 219, 251, 0.4);
        }
    `;
    document.head.appendChild(style);
    
    // Focus on password input
    setTimeout(() => document.getElementById('admin-password').focus(), 100);
    
    // Login confirm
    const confirmLogin = () => {
        const password = document.getElementById('admin-password').value;
        if (password === '678678') {
            overlay.remove();
            showAdminPanel();
        } else {
            const errorDiv = document.getElementById('login-error');
            errorDiv.style.display = 'block';
            document.getElementById('admin-password').value = '';
            document.getElementById('admin-password').focus();
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 2000);
        }
    };
    
    document.getElementById('login-confirm-btn').addEventListener('click', confirmLogin);
    
    // Enter key to login
    document.getElementById('admin-password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            confirmLogin();
        }
    });
    
    // Cancel
    document.getElementById('login-cancel-btn').addEventListener('click', () => {
        overlay.remove();
    });
    
    // Click overlay to close
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

// Show admin panel
function showAdminPanel() {
    const overlay = document.createElement('div');
    overlay.className = 'admin-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
        overflow-y: auto;
    `;
    
    const today = new Date().toLocaleDateString('zh-CN');
    
    // Generate rewards list HTML
    const rewardsListHTML = REWARDS.map((reward, index) => `
        <div class="reward-config-item">
            <div class="reward-number">${index + 1}</div>
            <input type="text" class="reward-emoji-input" id="reward-emoji-${index}" value="${reward.emoji}" maxlength="2" placeholder="表情" />
            <input type="text" class="reward-name-input" id="reward-name-${index}" value="${reward.name}" placeholder="奖励名称" />
        </div>
    `).join('');
    
    const panel = document.createElement('div');
    panel.innerHTML = `
        <div class="admin-panel">
            <h2>⚙️ 管理员面板 Admin Panel</h2>
            <div class="admin-info">
                <div class="admin-info-item">
                    <span class="admin-info-label">📅 当前日期 Date:</span>
                    <span class="admin-info-value">${today}</span>
                </div>
                <div class="admin-info-item">
                    <span class="admin-info-label">🎁 今日奖励次数 Daily Rewards:</span>
                    <span class="admin-info-value">${gameState.dailyRewards.count} / ${DAILY_REWARD_LIMIT}</span>
                </div>
                <div class="admin-info-item">
                    <span class="admin-info-label">🏆 当前分数 Current Score:</span>
                    <span class="admin-info-value">${gameState.score}</span>
                </div>
                <div class="admin-info-item">
                    <span class="admin-info-label">⭐ 最高分 Best Score:</span>
                    <span class="admin-info-value">${gameState.bestScore}</span>
                </div>
            </div>
            
            <div class="rewards-config-section">
                <h3>🎁 宝箱奖励配置 Rewards Configuration</h3>
                <div class="rewards-config-list">
                    ${rewardsListHTML}
                </div>
                <button id="save-rewards-btn" class="admin-action-btn save">
                    💾 保存奖励配置 Save Rewards
                </button>
            </div>
            
            <div class="admin-actions">
                <button id="reset-rewards-btn" class="admin-action-btn reset">
                    🔄 重置每日奖励 Reset Daily Rewards
                </button>
                <button id="close-admin-btn" class="admin-action-btn close">
                    ✖️ 关闭 Close
                </button>
            </div>
        </div>
    `;
    
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    
    // Save rewards configuration
    document.getElementById('save-rewards-btn').addEventListener('click', () => {
        let hasError = false;
        const newRewards = REWARDS.map((reward, index) => {
            const emoji = document.getElementById(`reward-emoji-${index}`).value.trim();
            const name = document.getElementById(`reward-name-${index}`).value.trim();
            
            if (!emoji || !name) {
                hasError = true;
                return reward;
            }
            
            return {
                ...reward,
                emoji: emoji,
                name: name
            };
        });
        
        if (hasError) {
            alert('❌ 请填写完整的表情和名称！\nPlease fill in all emoji and names!');
            return;
        }
        
        REWARDS = newRewards;
        saveCustomRewards();
        overlay.remove();
        showMessage('✅ 奖励配置已保存！Rewards configuration saved!', true);
    });
    
    // Reset rewards button
    document.getElementById('reset-rewards-btn').addEventListener('click', () => {
        if (confirm('确定要重置今日奖励次数吗？\nReset daily rewards count?')) {
            gameState.dailyRewards.count = 0;
            saveDailyRewards();
            overlay.remove();
            showMessage('✅ 每日奖励已重置！Daily rewards reset!', true);
        }
    });
    
    // Close button
    document.getElementById('close-admin-btn').addEventListener('click', () => {
        overlay.remove();
    });
    
    // Click overlay to close
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            turnLeft();
            break;
        case 'ArrowRight':
            e.preventDefault();
            turnRight();
            break;
        case 'ArrowUp':
            e.preventDefault();
            goForward();
            break;
    }
});

// Mouse move handler for hover effect
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    const gridX = Math.floor(mouseX / CELL_SIZE);
    const gridY = Math.floor(mouseY / CELL_SIZE);
    
    let hoveredItem = null;
    let needsRedraw = false;
    
    // Check if hovering over a building
    hoveredItem = gameState.buildings.find(b => b.x === gridX && b.y === gridY);
    
    // If not a building, check if it's a place (destination)
    if (!hoveredItem) {
        hoveredItem = gameState.places.find(p => p.x === gridX && p.y === gridY);
    }
    
    // If not a building or place, check if it's a road
    if (!hoveredItem && gameState.map[gridY] && gameState.map[gridY][gridX] === TILE_TYPES.ROAD) {
        const roadType = gameState.roadTypes[gridY][gridX];
        if (roadType && roadType !== gameState.hoveredRoad) {
            gameState.hoveredRoad = roadType;
            needsRedraw = true;
        }
    } else if (gameState.hoveredRoad) {
        gameState.hoveredRoad = null;
        needsRedraw = true;
    }
    
    if (hoveredItem !== gameState.hoveredBuilding) {
        gameState.hoveredBuilding = hoveredItem || null;
        needsRedraw = true;
    }
    
    if (needsRedraw) {
        drawGame();
    }
});

canvas.addEventListener('mouseleave', () => {
    if (gameState.hoveredBuilding) {
        gameState.hoveredBuilding = null;
        drawGame();
    }
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            turnLeft();
            break;
        case 'ArrowRight':
            e.preventDefault();
            turnRight();
            break;
        case 'ArrowUp':
            e.preventDefault();
            goForward();
            break;
    }
});

// Polyfill for roundRect if not supported
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
    };
}

// Initialize game on load
initGame();
