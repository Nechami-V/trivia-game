const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  word: {
    type: String,
    required: [true, 'Word is required'],
    trim: true
  },
  correctAnswer: {
    type: String,
    required: [true, 'Correct answer is required'],
    trim: true
  },
  wrongAnswers: {
    type: [String],
    required: [true, 'Wrong answers are required'],
    validate: {
      validator: function(array) {
        return array.length === 3;
      },
      message: 'Must have exactly 3 wrong answers'
    }
  },
  ashkenaziAudioFile: {
    type: String,
    required: false
  },
  sephardiAudioFile: {
    type: String,
    required: false
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  category: {
    type: String,
    required: false,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
questionSchema.index({ difficulty: 1, isActive: 1 });

module.exports = mongoose.model('Question', questionSchema);
