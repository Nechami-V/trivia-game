const mongoose = require('mongoose');

const gameQuestionSchema = new mongoose.Schema({
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  order: {
    type: Number,
    required: true,
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique game-question pairs
gameQuestionSchema.index({ gameId: 1, questionId: 1 }, { unique: true });

// Index for ordering questions within a game
gameQuestionSchema.index({ gameId: 1, order: 1 });

// Index for faster lookups
gameQuestionSchema.index({ gameId: 1, isActive: 1 });

module.exports = mongoose.model('GameQuestion', gameQuestionSchema);
