const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  gameMode: {
    type: String,
    enum: ['fast', 'normal'],
    default: 'normal'
  },
  questionsAnswered: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  gameDuration: {
    type: Number, // in seconds
    default: 0
  }
}, {
  timestamps: true
});

// Index for leaderboard queries
scoreSchema.index({ score: -1, createdAt: -1 });
scoreSchema.index({ userId: 1, createdAt: -1 });
scoreSchema.index({ gameId: 1, score: -1 }); // For game-specific leaderboards
scoreSchema.index({ gameId: 1, userId: 1, createdAt: -1 }); // For user's game history

module.exports = mongoose.model('Score', scoreSchema);
