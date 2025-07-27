const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Game name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Game description is required'],
    trim: true
  },
  image: {
    type: String,
    required: false // URL or path to game image
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxQuestions: {
    type: Number,
    default: 100, // Maximum questions per game session
    min: 1
  },
  passingScore: {
    type: Number,
    default: 70, // Percentage needed to pass
    min: 0,
    max: 100
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  totalQuestions: {
    type: Number,
    default: 0 // Will be calculated based on GameQuestion associations
  },
  totalPlays: {
    type: Number,
    default: 0 // Track how many times this game was played
  },
  averageScore: {
    type: Number,
    default: 0 // Average score of all players
  }
}, {
  timestamps: true
});

// Index for faster queries
gameSchema.index({ name: 1 });
gameSchema.index({ isActive: 1 });

// Virtual for question count (will be populated from GameQuestion model)
gameSchema.virtual('questionCount', {
  ref: 'GameQuestion',
  localField: '_id',
  foreignField: 'gameId',
  count: true
});

// Ensure virtual fields are included in JSON output
gameSchema.set('toJSON', { virtuals: true });
gameSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Game', gameSchema);
