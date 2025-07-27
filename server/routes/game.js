const express = require('express');
const { 
  getAllActiveGames,
  getGameDetails,
  startGameSession,
  submitGameResults,
  getUserGameHistory
} = require('../controllers/userGameController');
const { 
  getLeaderboard
} = require('../controllers/gameController'); // Keep the old leaderboard function
const { auth, checkGameLimit } = require('../middleware/auth');
const { gameLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Games
 *   description: Game selection and gameplay
 */

/**
 * @swagger
 * /game/list:
 *   get:
 *     summary: Get all active games
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: List of active games
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 games:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       image:
 *                         type: string
 *                       totalQuestions:
 *                         type: number
 *                       totalPlays:
 *                         type: number
 *                       averageScore:
 *                         type: number
 */

/**
 * @swagger
 * /game/{id}/details:
 *   get:
 *     summary: Get game details with leaderboard
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Game ID
 *     responses:
 *       200:
 *         description: Game details with leaderboard
 *       404:
 *         description: Game not found
 */

/**
 * @swagger
 * /game/{id}/start:
 *   post:
 *     summary: Start a game session
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Game ID
 *     responses:
 *       200:
 *         description: Game session started with questions
 *       400:
 *         description: No active questions in game
 *       404:
 *         description: Game not found
 */

/**
 * @swagger
 * /game/{id}/submit:
 *   post:
 *     summary: Submit game results
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Game ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *               answers:
 *                 type: object
 *               gameDuration:
 *                 type: number
 *     responses:
 *       200:
 *         description: Results saved and returned
 */

/**
 * @swagger
 * /game/history:
 *   get:
 *     summary: Get user's game history
 *     tags: [Games]
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
 *         name: gameId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User's game history
 */

// Routes
router.get('/list', getAllActiveGames);
router.get('/:id/details', auth, getGameDetails);
router.post('/:id/start', auth, checkGameLimit, gameLimiter, startGameSession);
router.post('/:id/submit', auth, submitGameResults);
router.get('/history', auth, getUserGameHistory);
router.get('/leaderboard', getLeaderboard); // Keep old global leaderboard

module.exports = router;
