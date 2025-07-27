const express = require('express');
const { body } = require('express-validator');
const { adminAuth } = require('../middleware/adminAuth');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetUserGames,
  getUserAnalytics
} = require('../controllers/userManagementController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User Management
 *   description: Admin user management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique user identifier
 *         username:
 *           type: string
 *           description: User's username
 *         email:
 *           type: string
 *           description: User's email address
 *         isActive:
 *           type: boolean
 *           description: Whether the user is active
 *         totalScore:
 *           type: number
 *           description: User's total score across all games
 *         gamesPlayed:
 *           type: number
 *           description: Number of games played
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           description: Last login timestamp
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by username or email
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', adminAuth, getAllUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/:id', adminAuth, getUserById);

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/:id', 
  adminAuth,
  [
    body('username').optional().trim().isLength({ min: 3, max: 30 }),
    body('email').optional().isEmail(),
    body('isActive').optional().isBoolean()
  ],
  updateUser
);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', adminAuth, deleteUser);

/**
 * @swagger
 * /admin/users/{id}/toggle-active:
 *   patch:
 *     summary: Toggle user active status
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/toggle-active', 
  adminAuth,
  [body('isActive').isBoolean()],
  toggleUserStatus
);

/**
 * @swagger
 * /admin/users/{id}/reset-games:
 *   put:
 *     summary: Reset user's game progress
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User games reset successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/:id/reset-games', adminAuth, resetUserGames);

/**
 * @swagger
 * /admin/users/analytics:
 *   get:
 *     summary: Get user analytics
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User analytics retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/analytics', adminAuth, getUserAnalytics);

module.exports = router;
