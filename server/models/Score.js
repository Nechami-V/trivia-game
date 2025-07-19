const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

module.exports = mongoose.model('Score', scoreSchema);
