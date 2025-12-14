# 🏃 Endless Runner Game

A fully animated endless runner game inspired by Temple Run 2, built with vanilla HTML5, CSS3, and JavaScript.

![Game Type](https://img.shields.io/badge/Type-Endless%20Runner-blue)
![Tech Stack](https://img.shields.io/badge/Tech-HTML%20%7C%20CSS%20%7C%20JavaScript-green)

## 🎮 Game Features

### Core Mechanics
- **Auto-running character** with smooth animations
- **3-lane system** for strategic gameplay
- **Jump mechanics** with realistic gravity
- **Endless procedural generation** of obstacles and collectibles
- **Progressive difficulty** - speed increases over time
- **Score and distance tracking**

### Visual Effects
- **Animated character** with running legs and swinging arms
- **Rotating coins** with glow effects
- **Parallax background** with twinkling stars
- **Perspective road** with animated lane markers
- **Neon/cyberpunk theme** with glowing UI elements
- **Smooth transitions** between lanes

### Game Elements
- **Obstacles**: Two types (boxes and spikes) that spawn randomly
- **Coins**: Appear in various patterns (single, lines, all lanes)
- **Speed meter**: Visual indicator of current game speed
- **Game over screen**: Shows final score and distance

## 🎯 How to Play

### Controls
- **← Left Arrow** - Move to left lane
- **→ Right Arrow** - Move to right lane
- **↑ Up Arrow** or **Space** - Jump over obstacles

### Objective
- Avoid obstacles by switching lanes or jumping
- Collect coins to increase your score
- Survive as long as possible as the game speeds up
- Beat your high score!

### Scoring
- **+5 points** for each coin collected
- **+10 points** for each obstacle passed
- Distance traveled is tracked in meters

## 🚀 Getting Started

### Installation
1. Download or clone all files to a folder
2. Ensure you have these files:
   - `index.html`
   - `style.css`
   - `script.js`

### Running the Game
1. Open `index.html` in any modern web browser
2. Click **"Start Game"** button
3. Use arrow keys to play
4. Press **"Play Again"** after game over to restart

### Requirements
- Modern web browser (Chrome, Firefox, Edge, Safari)
- No additional dependencies or installations needed
- Works offline - no internet connection required

## 📁 Project Structure

```
game dev/
│
├── index.html          # Main HTML structure
├── style.css           # Styling and animations
├── script.js           # Game logic and mechanics
└── README.md           # Documentation (this file)
```

## 🛠️ Technical Details

### Technologies Used
- **HTML5 Canvas** for rendering graphics
- **CSS3** for UI styling and effects
- **Vanilla JavaScript** for game logic
- **RequestAnimationFrame** for smooth 60fps gameplay

### Key Classes
- `Player` - Character with lane switching and jumping
- `Obstacle` - Randomly spawned hazards
- `Coin` - Collectible items with animations
- `Game` - Main game loop and collision detection

### Configuration
Game settings can be adjusted in `script.js`:
```javascript
const CONFIG = {
  canvasWidth: 800,
  canvasHeight: 500,
  gravity: 1.2,
  jumpPower: 22,
  lanes: 3,
  baseSpeed: 5,
  maxSpeed: 12
};
```

## 🎨 Customization

### Change Colors
Edit the gradient colors in `style.css` and `script.js` to customize the theme.

### Adjust Difficulty
Modify these values in `script.js`:
- `CONFIG.baseSpeed` - Starting speed
- `CONFIG.speedIncrease` - How fast the game accelerates
- `CONFIG.maxSpeed` - Maximum speed cap

### Spawn Rates
Adjust obstacle and coin generation:
- `nextObstacleDistance` - Distance between obstacles
- `nextCoinDistance` - Distance between coin spawns

## 🐛 Troubleshooting

**Game not starting?**
- Check browser console for errors
- Ensure all three files are in the same folder
- Try a different browser

**Performance issues?**
- Close other browser tabs
- Update your browser to the latest version
- Check if hardware acceleration is enabled

## 📝 License

This project is free to use for learning and personal projects.

## 🤝 Contributing

Feel free to fork, modify, and improve the game!

### Ideas for Enhancement
- Add power-ups (shield, magnet, speed boost)
- Multiple character skins
- Different environments/themes
- Sound effects and music
- High score leaderboard
- Mobile touch controls

## 👨‍💻 Author

Built with HTML, CSS, and vanilla JavaScript

---

**Enjoy the game! 🎮✨**

Try to beat your high score and see how far you can run!
