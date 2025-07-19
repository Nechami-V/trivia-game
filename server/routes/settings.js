const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: User settings management
 */

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Get user settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 settings:
 *                   $ref: '#/components/schemas/Settings'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /settings:
 *   put:
 *     summary: Update user settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Settings'
 *     responses:
 *       200:
 *         description: Settings updated successfully
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
 *                   example: "Settings updated successfully"
 *                 settings:
 *                   $ref: '#/components/schemas/Settings'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

// @route   GET /api/settings
router.get('/', auth, getSettings);

// @route   PUT /api/settings
router.put('/', auth, updateSettings);

module.exports = router;
