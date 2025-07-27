const express = require('express');
const { body } = require('express-validator');
const {
  adminLogin,
  createAdmin,
  getAdminProfile,
  getAllAdmins,
  deactivateAdmin,
  getStats
} = require('../controllers/adminController');
const { adminAuth, superAdminAuth } = require('../middleware/adminAuth');
const { authLimiter } = require('../middleware/rateLimiter');

// Import user management routes
const userManagementRoutes = require('./userManagement');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin Management
 *   description: Admin authentication and management
 */

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "admin"
 *               password:
 *                 type: string
 *                 example: "admin123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Admin login successful"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 admin:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [admin, super_admin]
 *                     lastLogin:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /admin/profile:
 *   get:
 *     summary: Get admin profile
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 admin:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     role:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     lastLogin:
 *                       type: string
 *                       format: date-time
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 */

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: number
 *                       description: Total active users
 *                     totalQuestions:
 *                       type: number
 *                       description: Total active questions
 *                     totalGames:
 *                       type: number
 *                       description: Total active games
 *                     totalGamesPlayed:
 *                       type: number
 *                       description: Total games played
 *                     activeUsers:
 *                       type: number
 *                       description: Users active in last 30 days
 *                     topGames:
 *                       type: array
 *                       description: Top 5 most played games
 *                     recentActivity:
 *                       type: array
 *                       description: Last 10 games played
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /admin/create:
 *   post:
 *     summary: Create new admin (Super Admin only)
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 example: "newadmin"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [admin, super_admin]
 *                 default: admin
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       403:
 *         description: Super admin access required
 */

/**
 * @swagger
 * /admin/list:
 *   get:
 *     summary: Get all admins (Super Admin only)
 *     tags: [Admin Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Admins list retrieved
 *       403:
 *         description: Super admin access required
 */

// Validation rules
const loginValidation = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const createAdminValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'super_admin'])
    .withMessage('Role must be admin or super_admin')
];

// Routes
// Routes
router.post('/login', authLimiter, loginValidation, adminLogin);
router.get('/profile', adminAuth, getAdminProfile);
router.get('/stats', adminAuth, getStats);
router.post('/create', adminAuth, superAdminAuth, createAdminValidation, createAdmin);
router.get('/list', adminAuth, superAdminAuth, getAllAdmins);
router.put('/:id/deactivate', adminAuth, superAdminAuth, deactivateAdmin);

// User management routes
router.use('/users', userManagementRoutes);

module.exports = router;
