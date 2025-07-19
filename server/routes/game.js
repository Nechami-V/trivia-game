const express = require('express');
const { 
  getRandomQuestions,
  startGame,
  submitGameResult,
  getLeaderboard
} = require('../controllers/gameController');
const { auth, checkGameLimit } = require('../middleware/auth');
const { gameLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Game
 *   description: Game functionality and scoring
 */

/**
 * @swagger
 * /game/questions:
 *   get:
 *     summary: Get random questions for game
 *     tags: [Game]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of questions to retrieve
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard]
 *         description: Filter questions by difficulty
 *     responses:
 *       200:
 *         description: Questions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 questions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Question'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Game limit reached
 */

/**
 * @swagger
 * /game/start:
 *   post:
 *     summary: Start a new game
 *     tags: [Game]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Game started successfully
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
 *                   example: "Game started"
 *                 canPlay:
 *                   type: boolean
 *                   example: true
 *                 gamesRemaining:
 *                   oneOf:
 *                     - type: string
 *                       example: "unlimited"
 *                     - type: number
 *                       example: 25
 *       403:
 *         description: Game limit reached
 */

/**
 * @swagger
 * /game/result:
 *   post:
 *     summary: Submit game result
 *     tags: [Game]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - score
 *               - gameMode
 *               - questionsAnswered
 *               - correctAnswers
 *               - gameDuration
 *             properties:
 *               score:
 *                 type: number
 *                 example: 850
 *               gameMode:
 *                 type: string
 *                 enum: [fast, normal]
 *                 example: "normal"
 *               questionsAnswered:
 *                 type: number
 *                 example: 10
 *               correctAnswers:
 *                 type: number
 *                 example: 8
 *               gameDuration:
 *                 type: number
 *                 description: Game duration in seconds
 *                 example: 120
 *     responses:
 *       200:
 *         description: Game result submitted successfully
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
 *                   example: "Game result submitted successfully"
 *                 scoreRecord:
 *                   $ref: '#/components/schemas/Score'
 *                 gamesPlayed:
 *                   type: number
 *                   example: 5
 */

/**
 * @swagger
 * /game/leaderboard:
 *   get:
 *     summary: Get game leaderboard
 *     tags: [Game]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of top players to retrieve
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 leaderboard:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       rank:
 *                         type: number
 *                         example: 1
 *                       userName:
 *                         type: string
 *                         example: "יוסי כהן"
 *                       bestScore:
 *                         type: number
 *                         example: 1250
 *                       totalGames:
 *                         type: number
 *                         example: 15
 *                       lastPlayed:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     total:
 *                       type: number
 *                     pages:
 *                       type: number
 */

// @route   GET /api/game/questions
router.get('/questions', auth, checkGameLimit, gameLimiter, getRandomQuestions);

// @route   POST /api/game/start
router.post('/start', auth, checkGameLimit, startGame);

// @route   POST /api/game/result
router.post('/result', auth, submitGameResult);

// @route   GET /api/game/leaderboard
router.get('/leaderboard', getLeaderboard);

module.exports = router;
