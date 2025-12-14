

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const distanceEl = document.getElementById('distance');
const startBtn = document.getElementById('startBtn');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreEl = document.getElementById('finalScore');
const finalDistanceEl = document.getElementById('finalDistance');
const restartBtn = document.getElementById('restartBtn');

let running = false;
let gameOver = false;
let score = 0;
let distance = 0;
let gameSpeed = 1;
let animationFrame = 0;

const CONFIG = {
  canvasWidth: 800,
  canvasHeight: 500,
  gravity: 1.2,
  jumpPower: 22,
  lanes: 3,
  laneWidth: 200,
  baseSpeed: 1,
  speedIncrease: 0.001,
  maxSpeed: 12
};

const LANES = [
  CONFIG.canvasWidth / 2 - CONFIG.laneWidth,
  CONFIG.canvasWidth / 2,
  CONFIG.canvasWidth / 2 + CONFIG.laneWidth
];

function resizeCanvas() {
  canvas.width = CONFIG.canvasWidth;
  canvas.height = CONFIG.canvasHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const keys = {
  left: false, 
  right: false, 
  up: false
};

let keyPressedLeft = false;
let keyPressedRight = false;

window.addEventListener('keydown', (e) => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
    if (!keys.left) keyPressedLeft = true;
    keys.left = true;
  }
  if (e.code === 'ArrowRight' || e.code === 'KeyD') {
    if (!keys.right) keyPressedRight = true;
    keys.right = true;
  }
  if (e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') {
    keys.up = true;
    e.preventDefault();
  }
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
    keys.left = false;
    keyPressedLeft = false;
  }
  if (e.code === 'ArrowRight' || e.code === 'KeyD') {
    keys.right = false;
    keyPressedRight = false;
  }
  if (e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') {
    keys.up = false;
  }
});

class Player {
  constructor() {
    this.lane = 1; 
    this.x = LANES[this.lane];
    this.y = 320;
    this.targetX = this.x;
    this.w = 40;
    this.h = 60;
    this.velocityY = 0;
    this.isJumping = false;
    this.groundY = 320;
    this.animFrame = 0;
    this.animSpeed = 0.2;
  }

  update() {

    if (keyPressedLeft && this.lane > 0) {
      this.lane--;
      this.targetX = LANES[this.lane];
      keyPressedLeft = false;
    }
    if (keyPressedRight && this.lane < 2) {
      this.lane++;
      this.targetX = LANES[this.lane];
      keyPressedRight = false;
    }

    
    this.x += (this.targetX - this.x) * 0.2;

    if (keys.up && !this.isJumping) {
      this.velocityY = -CONFIG.jumpPower;
      this.isJumping = true;
    }

    this.velocityY += CONFIG.gravity;
    this.y += this.velocityY;

    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.velocityY = 0;
      this.isJumping = false;
    }

    this.animFrame += this.animSpeed * gameSpeed;
  }

  draw(ctx) {
    const bobOffset = this.isJumping ? 0 : Math.sin(this.animFrame) * 3;
    
    ctx.save();
    ctx.translate(this.x, this.y + bobOffset);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.ellipse(0, this.h + 5, this.w * 0.4, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    const gradient = ctx.createLinearGradient(-this.w/2, -this.h, this.w/2, 0);
    gradient.addColorStop(0, '#00d4ff');
    gradient.addColorStop(1, '#00ffaa');
    ctx.fillStyle = gradient;
    
    roundRect(ctx, -this.w/2, -this.h, this.w, this.h * 0.6, 8);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, -this.h + 8, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#ffcc77';
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.fillRect(-5, -this.h + 6, 3, 3);
    ctx.fillRect(2, -this.h + 6, 3, 3);

    const legSwing = Math.sin(this.animFrame) * 10;
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(-8, -this.h * 0.4);
    ctx.lineTo(-8 + legSwing, 0);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(8, -this.h * 0.4);
    ctx.lineTo(8 - legSwing, 0);
    ctx.stroke();

    const armSwing = Math.sin(this.animFrame + Math.PI) * 8;
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    ctx.moveTo(-this.w/2 + 4, -this.h + 20);
    ctx.lineTo(-this.w/2 - 6, -this.h + 30 + armSwing);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(this.w/2 - 4, -this.h + 20);
    ctx.lineTo(this.w/2 + 6, -this.h + 30 - armSwing);
    ctx.stroke();

    ctx.restore();
  }

  getBounds() {
    return {
      x: this.x - this.w/2,
      y: this.y - this.h,
      w: this.w,
      h: this.h
    };
  }
}

class Obstacle {
  constructor(lane, type = 'box') {
    this.lane = lane;
    this.x = LANES[lane];
    this.y = CONFIG.canvasHeight;
    this.w = 50;
    this.h = 60;
    this.type = type;
    this.passed = false;
  }

  update() {
    this.y -= gameSpeed;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.type === 'box') {
      const gradient = ctx.createLinearGradient(-this.w/2, -this.h, this.w/2, 0);
      gradient.addColorStop(0, '#ff6b6b');
      gradient.addColorStop(1, '#ff4444');
      ctx.fillStyle = gradient;
      roundRect(ctx, -this.w/2, -this.h, this.w, this.h, 5);
      ctx.fill();
      
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-this.w/2 + 5, -this.h + 10);
      ctx.lineTo(this.w/2 - 5, -this.h + 10);
      ctx.moveTo(-this.w/2 + 5, -20);
      ctx.lineTo(this.w/2 - 5, -20);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#ff4466';
      ctx.beginPath();
      ctx.moveTo(0, -this.h);
      ctx.lineTo(-this.w/2, 0);
      ctx.lineTo(this.w/2, 0);
      ctx.closePath();
      ctx.fill();
      
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
  }

  getBounds() {
    return {
      x: this.x - this.w/2,
      y: this.y - this.h,
      w: this.w,
      h: this.h
    };
  }

  isOffScreen() {
    return this.y < -100;
  }
}

class Coin {
  constructor(lane, yOffset = 0) {
    this.lane = lane;
    this.x = LANES[lane];
    this.y = CONFIG.canvasHeight + yOffset;
    this.radius = 15;
    this.collected = false;
    this.rotation = 0;
  }

  update() {
    this.y -= gameSpeed;
    this.rotation += 0.1;
  }

  draw(ctx) {
    if (this.collected) return;
    
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    const glow = ctx.createRadialGradient(0, 0, this.radius * 0.5, 0, 0, this.radius * 1.5);
    glow.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
    glow.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    const gradient = ctx.createRadialGradient(-3, -3, 0, 0, 0, this.radius);
    gradient.addColorStop(0, '#fff9c4');
    gradient.addColorStop(0.6, '#ffd700');
    gradient.addColorStop(1, '#ffb300');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffb300';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 0.6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ff6f00';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 0);

    ctx.restore();
  }

  getBounds() {
    return {
      x: this.x - this.radius,
      y: this.y - this.radius,
      w: this.radius * 2,
      h: this.radius * 2
    };
  }

  isOffScreen() {
    return this.y < -50;
  }
}
class Game {
  constructor() {
    this.player = new Player();
    this.obstacles = [];
    this.coins = [];
    this.backgroundOffset = 0;
    this.nextObstacleDistance = 0;
    this.nextCoinDistance = 0;
  }

  reset() {
    this.player = new Player();
    this.obstacles = [];
    this.coins = [];
    this.backgroundOffset = 0;
    this.nextObstacleDistance = 0;
    this.nextCoinDistance = 0;
    gameSpeed = CONFIG.baseSpeed;
    score = 0;
    distance = 0;
    gameOver = false;
  }

  update() {
    if (gameOver) return;

    this.player.update();

    if (gameSpeed < CONFIG.maxSpeed) {
      gameSpeed += CONFIG.speedIncrease;
    }

    distance += gameSpeed * 0.1;

    this.backgroundOffset += gameSpeed;
    if (this.backgroundOffset > 100) this.backgroundOffset = 0;

    this.nextObstacleDistance -= gameSpeed;
    if (this.nextObstacleDistance <= 0) {
      const lane = Math.floor(Math.random() * 3);
      const type = Math.random() > 0.5 ? 'box' : 'spike';
      this.obstacles.push(new Obstacle(lane, type));
      this.nextObstacleDistance = 100 + Math.random() * 150;
    }

    this.nextCoinDistance -= gameSpeed;
    if (this.nextCoinDistance <= 0) {
      const pattern = Math.random();
      if (pattern < 0.3) {
        const lane = Math.floor(Math.random() * 3);
        this.coins.push(new Coin(lane));
      } else if (pattern < 0.7) {
        const lane = Math.floor(Math.random() * 3);
        for (let i = 0; i < 5; i++) {
          this.coins.push(new Coin(lane, -i * 40));
        }
      } else {
        for (let i = 0; i < 3; i++) {
          this.coins.push(new Coin(i));
        }
      }
      this.nextCoinDistance = 80 + Math.random() * 120;
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      this.obstacles[i].update();
      
      if (this.checkCollision(this.player.getBounds(), this.obstacles[i].getBounds())) {
        this.gameOver();
      }

      if (!this.obstacles[i].passed && this.obstacles[i].y < this.player.y - 100) {
        this.obstacles[i].passed = true;
        score += 10;
      }
      if (this.obstacles[i].isOffScreen()) {
        this.obstacles.splice(i, 1);
      }
    }

    for (let i = this.coins.length - 1; i >= 0; i--) {
      this.coins[i].update();
      
      if (!this.coins[i].collected && 
          this.checkCollision(this.player.getBounds(), this.coins[i].getBounds())) {
        this.coins[i].collected = true;
        score += 5;
      }

      if (this.coins[i].isOffScreen() || this.coins[i].collected) {
        this.coins.splice(i, 1);
      }
    }

    scoreEl.textContent = `Score: ${score}`;
    distanceEl.textContent = `Distance: ${Math.floor(distance)}m`;
  }

  checkCollision(a, b) {
    return a.x < b.x + b.w &&
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
  }

  gameOver() {
    gameOver = true;
    running = false;
    gameOverScreen.classList.remove('hidden');
    finalScoreEl.textContent = score;
    finalDistanceEl.textContent = Math.floor(distance);
    startBtn.textContent = 'Start Game';
  }

  draw(ctx) {
    ctx.clearRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);

    const bgGradient = ctx.createLinearGradient(0, 0, 0, CONFIG.canvasHeight);
    bgGradient.addColorStop(0, '#0a0a1e');
    bgGradient.addColorStop(0.5, '#1a1a3e');
    bgGradient.addColorStop(1, '#2a2a4e');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);

    drawStars(ctx, this.backgroundOffset);

    drawRoad(ctx, this.backgroundOffset);

    drawLaneMarkers(ctx, this.backgroundOffset);

    this.coins.forEach(coin => coin.draw(ctx));

    this.obstacles.forEach(obstacle => obstacle.draw(ctx));

    this.player.draw(ctx);


    ctx.fillStyle = 'rgba(0, 212, 255, 0.3)';
    ctx.fillRect(10, CONFIG.canvasHeight - 30, 200, 20);
    ctx.fillStyle = '#00d4ff';
    const speedPercent = (gameSpeed / CONFIG.maxSpeed) * 200;
    ctx.fillRect(10, CONFIG.canvasHeight - 30, speedPercent, 20);
    ctx.strokeStyle = '#00ffaa';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, CONFIG.canvasHeight - 30, 200, 20);
    
    ctx.fillStyle = '#00ffaa';
    ctx.font = '12px Arial';
    ctx.fillText('SPEED', 15, CONFIG.canvasHeight - 16);
  }
}
function roundRect(ctx, x, y, w, h, r = 6) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawStars(ctx, offset) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  const stars = [
    {x: 50, y: 30, size: 2},
    {x: 150, y: 60, size: 1.5},
    {x: 300, y: 40, size: 2},
    {x: 450, y: 80, size: 1},
    {x: 600, y: 50, size: 2},
    {x: 700, y: 70, size: 1.5},
    {x: 100, y: 100, size: 1},
    {x: 400, y: 120, size: 1.5},
    {x: 650, y: 110, size: 2}
  ];
  
  stars.forEach(star => {
    const twinkle = Math.sin(offset * 0.1 + star.x) * 0.3 + 0.7;
    ctx.globalAlpha = twinkle;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawRoad(ctx, offset) {
  const roadWidth = 500;
  const roadX = CONFIG.canvasWidth / 2;
  const roadTop = 150;
  const roadBottom = CONFIG.canvasHeight;
  
  const roadGradient = ctx.createLinearGradient(0, roadTop, 0, roadBottom);
  roadGradient.addColorStop(0, '#2a2a4e');
  roadGradient.addColorStop(0.5, '#3a3a5e');
  roadGradient.addColorStop(1, '#4a4a6e');
  
  ctx.fillStyle = roadGradient;
  ctx.beginPath();
  ctx.moveTo(roadX - 100, roadTop);
  ctx.lineTo(roadX + 100, roadTop);
  ctx.lineTo(roadX + roadWidth/2, roadBottom);
  ctx.lineTo(roadX - roadWidth/2, roadBottom);
  ctx.closePath();
  ctx.fill();
  
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#00d4ff';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(roadX - 100, roadTop);
  ctx.lineTo(roadX - roadWidth/2, roadBottom);
  ctx.moveTo(roadX + 100, roadTop);
  ctx.lineTo(roadX + roadWidth/2, roadBottom);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawLaneMarkers(ctx, offset) {
  const markerHeight = 40;
  const markerWidth = 8;
  const spacing = 60;
  
  ctx.fillStyle = '#00ffaa';
  ctx.shadowColor = '#00ffaa';
  ctx.shadowBlur = 5;
  for (let y = CONFIG.canvasHeight; y > 150; y -= spacing) {
    const adjustedY = (y + offset % spacing);
    if (adjustedY > 150 && adjustedY < CONFIG.canvasHeight) {
      const scale = (adjustedY - 150) / (CONFIG.canvasHeight - 150);
      const width = markerWidth * scale;
      const height = markerHeight * scale;
      const x1 = CONFIG.canvasWidth / 2 - CONFIG.laneWidth / 2;
      ctx.fillRect(x1 - width/2, adjustedY - height, width, height);
    }
  }
  
  for (let y = CONFIG.canvasHeight; y > 150; y -= spacing) {
    const adjustedY = (y + offset % spacing);
    if (adjustedY > 150 && adjustedY < CONFIG.canvasHeight) {
      const scale = (adjustedY - 150) / (CONFIG.canvasHeight - 150);
      const width = markerWidth * scale;
      const height = markerHeight * scale;
      const x2 = CONFIG.canvasWidth / 2 + CONFIG.laneWidth / 2;
      ctx.fillRect(x2 - width/2, adjustedY - height, width, height);
    }
  }
  
  ctx.shadowBlur = 0;
}
const game = new Game();

function gameLoop() {
  if (!running) return;
  
  game.update();
  game.draw(ctx);
  animationFrame++;
  
  requestAnimationFrame(gameLoop);
}
startBtn.addEventListener('click', () => {
  if (!running && !gameOver) {
    running = true;
    startBtn.textContent = 'Running...';
    gameOverScreen.classList.add('hidden');
    requestAnimationFrame(gameLoop);
  }
});

restartBtn.addEventListener('click', () => {
  game.reset();
  gameOverScreen.classList.add('hidden');
  running = true;
  startBtn.textContent = 'Running...';
  requestAnimationFrame(gameLoop);
});

(function init() {
  canvas.style.maxWidth = '900px';
  canvas.style.width = '100%';
  game.reset();
  game.draw(ctx);
})();