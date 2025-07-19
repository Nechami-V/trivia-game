const Setting = require('../models/Setting');

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne({ userId: req.user._id });
    
    // If no settings found, create default settings
    if (!settings) {
      settings = await Setting.create({
        userId: req.user._id,
        difficulty: 'normal',
        pronunciationType: 'ashkenazi',
        soundEnabled: true,
        vibrationEnabled: true
      });
    }

    res.json({
      success: true,
      settings: {
        difficulty: settings.difficulty,
        pronunciationType: settings.pronunciationType,
        soundEnabled: settings.soundEnabled,
        vibrationEnabled: settings.vibrationEnabled
      }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting settings'
    });
  }
};

// @desc    Update user settings
// @route   PUT /api/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const { difficulty, pronunciationType, soundEnabled, vibrationEnabled } = req.body;
    const userId = req.user._id;

    const settings = await Setting.findOneAndUpdate(
      { userId },
      {
        difficulty,
        pronunciationType,
        soundEnabled,
        vibrationEnabled
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        difficulty: settings.difficulty,
        pronunciationType: settings.pronunciationType,
        soundEnabled: settings.soundEnabled,
        vibrationEnabled: settings.vibrationEnabled
      }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating settings'
    });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
