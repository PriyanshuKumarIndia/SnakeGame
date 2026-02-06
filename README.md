# 🐍 Multiplayer Snake Game

A real-time multiplayer snake game built with Node.js, Socket.IO, and HTML5 Canvas. Play solo or compete with friends! **[Live Demo](https://snakegame-userend.onrender.com)**

## ✨ Features

- **🎮 Solo Mode** - Practice your skills against yourself
- **👥 Multiplayer Mode** - Challenge friends in real-time
- **🔄 Room System** - Create or join game rooms with unique codes
- **⚡ Real-time Sync** - Smooth gameplay powered by WebSockets
- **🎯 Score Tracking** - Keep track of your wins
- **🔁 Rematch Option** - Play again without leaving the room

## 🚀 Quick Start

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MultiplayerSnakeGame/multiplayerSnake
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your configuration:
   ```env
   PORT=3000
   CORS_ALLOWED_ORIGINS=//you can add this but currently I allowed all, just for fun
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open the game**
   - Open `frontend/index.html` in your browser
   - Or use a local server (e.g., Live Server extension in VS Code)

## 🎮 How to Play

### Controls
- **Arrow Keys** - Control snake direction
  - ⬆️ Up Arrow
  - ⬇️ Down Arrow
  - ⬅️ Left Arrow
  - ➡️ Right Arrow

### Game Modes

**Solo Mode**
1. Click "Play Solo"
2. Start playing immediately
3. Avoid walls and your own tail

**Multiplayer Mode**
1. **Create Room**: Click "Create Room" and share the code with a friend
2. **Join Room**: Enter a room code and click "Join Room"
3. Wait for both players to connect
4. First to crash loses!

## 📁 Project Structure

```
Game/
├── frontend/
│   ├── index.html      # Game UI
│   ├── index.js        # Client-side logic
│   └── styles.css      # Styling
├── server/
│   ├── server.js       # WebSocket server
│   ├── game.js         # Game logic
│   ├── constants.js    # Game constants
│   ├── utils.js        # Helper functions
│   ├── package.json    # Dependencies
│   └── .env.example    # Environment template
└── .gitignore
```

## 🛠️ Tech Stack

- **Backend**: Node.js, Socket.IO
- **Frontend**: HTML5 Canvas, Vanilla JavaScript
- **Real-time Communication**: WebSockets

## ⚙️ Configuration

### Server Settings

Edit `server/constants.js` to customize game parameters:

```javascript
FRAME_RATE = 10;  // Game speed (frames per second)
GRID_SIZE = 30;   // Grid dimensions (20x20)
```

### CORS Settings

For production, update `.env` with your domain:
```env
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

## 🐛 Troubleshooting

**Connection Issues**
- Ensure the server is running on the correct port
- Check that `index.js` points to the correct server URL
- Verify CORS settings in `.env`

**Game Not Starting**
- Make sure both players have joined in multiplayer mode
- Check browser console for errors
- Refresh the page and try again

## 📝 License

This project is open source and available for personal and educational use.

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

---

Made By Priyanshu Kumar, Contact: priyanshurazz4@gmail.com
