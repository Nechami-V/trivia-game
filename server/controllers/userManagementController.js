const User = require('../models/User');
const Score = require('../models/Score');
const Payment = require('../models/Payment');

// @desc    Get all users with pagination and filters
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      hasPaid = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (hasPaid !== '') {
      filter.hasPaid = hasPaid === 'true';
    }

    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const users = await User.find(filter)
      .select('-password')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    // Get user statistics
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          paidUsers: { $sum: { $cond: ['$hasPaid', 1, 0] } },
          freeUsers: { $sum: { $cond: ['$hasPaid', 0, 1] } },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
          totalGamesPlayed: { $sum: '$gamesPlayed' },
          avgGamesPerUser: { $avg: '$gamesPlayed' }
        }
      }
    ]);

    res.json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        hasPaid: user.hasPaid,
        gamesPlayed: user.gamesPlayed,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      stats: stats[0] || {
        totalUsers: 0,
        paidUsers: 0,
        freeUsers: 0,
        activeUsers: 0,
        totalGamesPlayed: 0,
        avgGamesPerUser: 0
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting users'
    });
  }
};

// @desc    Get single user details
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's scores
    const scores = await Score.find({ userId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's payments
    const payments = await Payment.find({ userId: req.params.id })
      .sort({ createdAt: -1 });

    // Get user statistics
    const userStats = await Score.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: null,
          totalGames: { $sum: 1 },
          bestScore: { $max: '$score' },
          avgScore: { $avg: '$score' },
          totalCorrectAnswers: { $sum: '$correctAnswers' },
          totalQuestionsAnswered: { $sum: '$questionsAnswered' },
          totalGameTime: { $sum: '$gameDuration' }
        }
      }
    ]);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hasPaid: user.hasPaid,
        gamesPlayed: user.gamesPlayed,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      recentScores: scores,
      payments,
      stats: userStats[0] || {
        totalGames: 0,
        bestScore: 0,
        avgScore: 0,
        totalCorrectAnswers: 0,
        totalQuestionsAnswered: 0,
        totalGameTime: 0
      }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting user details'
    });
  }
};

// @desc    Update user status or details
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
  try {
    const { name, email, hasPaid, isActive, gamesPlayed } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (hasPaid !== undefined) updateData.hasPaid = hasPaid;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (gamesPlayed !== undefined) updateData.gamesPlayed = gamesPlayed;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hasPaid: user.hasPaid,
        gamesPlayed: user.gamesPlayed,
        isActive: user.isActive,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error updating user'
    });
  }
};

// @desc    Toggle user active status
// @route   PATCH /api/admin/users/:id/toggle-active
// @access  Private (Admin)
const toggleUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling user status'
    });
  }
};

// @desc    Delete/Deactivate user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const { permanently = false } = req.query;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (permanently === 'true') {
      // Permanently delete user and all associated data
      await Promise.all([
        User.findByIdAndDelete(req.params.id),
        Score.deleteMany({ userId: req.params.id }),
        Payment.deleteMany({ userId: req.params.id })
      ]);

      res.json({
        success: true,
        message: 'User and all associated data deleted permanently'
      });
    } else {
      // Just deactivate user
      user.isActive = false;
      await user.save();

      res.json({
        success: true,
        message: 'User deactivated successfully'
      });
    }
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting user'
    });
  }
};

// @desc    Reset user games count (give free games)
// @route   PUT /api/admin/users/:id/reset-games
// @access  Private (Admin)
const resetUserGames = async (req, res) => {
  try {
    const { newCount = 0 } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { gamesPlayed: newCount },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User games count reset successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gamesPlayed: user.gamesPlayed,
        hasPaid: user.hasPaid
      }
    });
  } catch (error) {
    console.error('Reset user games error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error resetting user games'
    });
  }
};

// @desc    Get user activity analytics
// @route   GET /api/admin/users/analytics
// @access  Private (Admin)
const getUserAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // New user registrations
    const newUsers = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Games played over time
    const gamesOverTime = await Score.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          gamesCount: { $sum: 1 },
          avgScore: { $avg: '$score' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Payment conversion
    const conversionStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          paidUsers: { $sum: { $cond: ['$hasPaid', 1, 0] } },
          highGameUsers: { $sum: { $cond: [{ $gte: ['$gamesPlayed', 20] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      analytics: {
        period: parseInt(period),
        newUserRegistrations: newUsers,
        gamesOverTime,
        conversionRate: conversionStats[0] ? {
          total: conversionStats[0].totalUsers,
          paid: conversionStats[0].paidUsers,
          rate: conversionStats[0].totalUsers > 0 ? 
            (conversionStats[0].paidUsers / conversionStats[0].totalUsers * 100).toFixed(2) : 0,
          highEngagement: conversionStats[0].highGameUsers
        } : null
      }
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting user analytics'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById: getUserDetails,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetUserGames,
  getUserAnalytics
};
