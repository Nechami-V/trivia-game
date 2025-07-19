# Trivia Game - Educational Platform

Cross-platform trivia game platform for learning vocabulary in different languages, designed for children.

## Key Features

- 🎮 Interactive trivia game with timer
- 🔊 Word pronunciation support (Ashkenazi/Sephardic)
- 📊 Scoring and leaderboard system
- 💰 Freemium business model (30 free games)
- 🔐 Secure authentication system
- 📱 Mobile and web browser support
- 🎛️ Advanced admin panel

## Technologies

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Swagger API Documentation
- Stripe Payment Integration

**Frontend (Planned):**
- React Native + Expo
- React.js (Admin Panel)

## Installation and Setup

### Prerequisites
- Node.js (v18+)
- MongoDB
- npm or yarn

### Installation

```bash
# Clone the project
git clone https://github.com/your-username/trivia-game.git
cd trivia-game

# Install server dependencies
cd server
npm install

# Set up environment variables
cp .env.example .env
# Edit the .env file with your data

# Start the server
npm start
```

### Development Setup

```bash
# Run with nodemon
npm run dev

# Load sample data
node seedData.js
```

## API Documentation

After starting the server, API documentation is available at:
- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/api/health

## Project Structure

```
trivia-game/
├── server/                 # Backend (Node.js)
│   ├── config/            # Database and Swagger configuration
│   ├── controllers/       # Business logic
│   ├── middleware/        # Authentication and security
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   └── uploads/          # Audio files
├── client/               # React Native app (planned)
├── admin-dashboard/      # Admin panel (planned)
└── assets/               # Media files
```

## Features

### Users
- [x] Registration and login
- [x] User profile
- [x] Personal settings
- [x] Game count tracking

### Game
- [x] Multiple choice questions
- [x] Timer (fast/normal)
- [x] Scoring system
- [x] Personal and global leaderboards
- [x] Audio pronunciation

### Payment System
- [x] Freemium model
- [x] Stripe integration
- [ ] Israeli payment providers support

### Administration
- [x] Questions CRUD
- [ ] Audio file upload
- [ ] User management
- [ ] Reports and statistics

## Environment Variables

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/trivia_game
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=24h
STRIPE_SECRET_KEY=sk_test_your_stripe_key
FREE_GAMES_LIMIT=30
```

## Contributing

1. Fork the project
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Developer Name - nech397@gmail.com
