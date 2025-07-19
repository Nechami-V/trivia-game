const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  difficulty: {
    type: String,
    enum: ['fast', 'normal'],
    default: 'normal'
  },
  pronunciationType: {
    type: String,
    enum: ['ashkenazi', 'sephardi'],
    default: 'ashkenazi'
  },
  soundEnabled: {
    type: Boolean,
    default: true
  },
  vibrationEnabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Setting', settingSchema);
