const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Question = require('../models/Question');
// const Game = require('../models/Game'); // Disabled - not needed for Yiddish learning
const Score = require('../models/Score');

// Generate JWT Token for admin
const generateAdminToken = (id, role) => {
  return jwt.sign({ id, role, type: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const adminLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { username, password } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({ username, isActive: true }).select('+password');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    const token = generateAdminToken(admin._id, admin.role);

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin login'
    });
  }
};

// @desc    Create new admin (super admin only)
// @route   POST /api/admin/create
// @access  Private (Super Admin)
const createAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { username, password, role = 'admin' } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin already exists with this username'
      });
    }

    // Create admin
    const admin = await Admin.create({
      username,
      password,
      role
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        isActive: admin.isActive,
        createdAt: admin.createdAt
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating admin'
    });
  }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private (Admin)
const getAdminProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      admin: {
        id: req.admin._id,
        username: req.admin.username,
        role: req.admin.role,
        isActive: req.admin.isActive,
        lastLogin: req.admin.lastLogin,
        createdAt: req.admin.createdAt
      }
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting admin profile'
    });
  }
};

// @desc    Get all admins (super admin only)
// @route   GET /api/admin/list
// @access  Private (Super Admin)
const getAllAdmins = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const filter = search ? {
      username: { $regex: search, $options: 'i' }
    } : {};

    const admins = await Admin.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Admin.countDocuments(filter);

    res.json({
      success: true,
      admins: admins.map(admin => ({
        id: admin._id,
        username: admin.username,
        role: admin.role,
        isActive: admin.isActive,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting admins'
    });
  }
};

// @desc    Deactivate admin (super admin only)
// @route   PUT /api/admin/:id/deactivate
// @access  Private (Super Admin)
const deactivateAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deactivating self
    if (id === req.admin._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    const admin = await Admin.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      message: 'Admin deactivated successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        isActive: admin.isActive
      }
    });
  } catch (error) {
    console.error('Deactivate admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deactivating admin'
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getStats = async (req, res) => {
  try {
    // Get basic counts for Yiddish learning platform
    const [totalUsers, totalQuestions, totalScores] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Question.countDocuments({ isActive: true }),
      Score.countDocuments()
    ]);

    // Get active users (users who answered questions in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await Score.distinct('userId', {
      createdAt: { $gte: thirtyDaysAgo }
    }).then(userIds => userIds.length);

    // Get recent activity (last 10 question attempts)
    const recentActivity = await Score.find()
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('score questionsAnswered correctAnswers createdAt');

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalQuestions,
        totalScores,
        activeUsers,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בקבלת סטטיסטיקות',
      error: error.message
    });
  }
};

module.exports = {
  adminLogin,
  createAdmin,
  getAdminProfile,
  getAllAdmins,
  deactivateAdmin,
  getStats
};
