const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { adminAuth } = require('../middleware/adminAuth');
const {
  getAllGames,
  getGame,
  createGame,
  updateGame,
  deleteGame,
  // New functions for direct question management
  getGameQuestionsNew,
  createGameQuestion,
  updateGameQuestion,
  deleteGameQuestion,
  bulkImportGameQuestions
} = require('../controllers/gameManagementController');

// Validation rules for game creation/update
const gameValidationRules = () => {
  return [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('שם המשחק חייב להיות בין 2-100 תווים'),
    body('description')
      .trim()
      .isLength({ min: 5, max: 500 })
      .withMessage('תיאור המשחק חייב להיות בין 5-500 תווים'),
    body('maxQuestions')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('מספר שאלות חייב להיות בין 1-1000'),
    body('passingScore')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('ציון עובר חייב להיות בין 0-100')
  ];
};

// Validation rules for question creation/update
const questionValidationRules = () => {
  return [
    body('word')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('המילה חייבת להיות בין 1-100 תווים'),
    body('correctAnswer')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('התשובה הנכונה חייבת להיות בין 1-200 תווים'),
    body('wrongAnswers')
      .isArray({ min: 3, max: 3 })
      .withMessage('חייב לספק בדיוק 3 תשובות שגויות'),
    body('wrongAnswers.*')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('כל תשובה שגויה חייבת להיות בין 1-200 תווים'),
    body('ashkenaziAudioFile')
      .optional()
      .isString(),
    body('sephardiAudioFile')
      .optional()
      .isString(),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive חייב להיות ערך בוליאני')
  ];
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Game:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         _id:
 *           type: string
 *           description: מזהה ייחודי של המשחק
 *         name:
 *           type: string
 *           description: שם המשחק
 *         description:
 *           type: string
 *           description: תיאור המשחק
 *         image:
 *           type: string
 *           description: נתיב לתמונת המשחק
 *         isActive:
 *           type: boolean
 *           description: האם המשחק פעיל
 *         maxQuestions:
 *           type: number
 *           description: מספר שאלות מקסימלי בסשן
 *         passingScore:
 *           type: number
 *           description: ציון עובר באחוזים
 *         totalQuestions:
 *           type: number
 *           description: סך השאלות במשחק
 *         totalPlays:
 *           type: number
 *           description: מספר פעמים שנוחק
 *         averageScore:
 *           type: number
 *           description: ציון ממוצע
 */

/**
 * @swagger
 * /admin/games:
 *   get:
 *     summary: קבלת רשימת כל המשחקים
 *     tags: [Games Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: רשימת המשחקים התקבלה בהצלחה
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
 *                     $ref: '#/components/schemas/Game'
 *       401:
 *         description: לא מורשה
 *       500:
 *         description: שגיאת שרת
 */
router.get('/', adminAuth, getAllGames);

/**
 * @swagger
 * /admin/games/{id}:
 *   get:
 *     summary: קבלת פרטי משחק ספציפי
 *     tags: [Games Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: מזהה המשחק
 *     responses:
 *       200:
 *         description: פרטי המשחק התקבלו בהצלחה
 *       404:
 *         description: המשחק לא נמצא
 *       500:
 *         description: שגיאת שרת
 */
router.get('/:id', adminAuth, getGame);

/**
 * @swagger
 * /admin/games:
 *   post:
 *     summary: יצירת משחק חדש
 *     tags: [Games Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               maxQuestions:
 *                 type: number
 *               passingScore:
 *                 type: number
 *     responses:
 *       201:
 *         description: המשחק נוצר בהצלחה
 *       400:
 *         description: נתונים לא תקינים
 *       500:
 *         description: שגיאת שרת
 */
router.post('/', adminAuth, gameValidationRules(), createGame);

/**
 * @swagger
 * /admin/games/{id}:
 *   put:
 *     summary: עדכון משחק
 *     tags: [Games Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: מזהה המשחק
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               maxQuestions:
 *                 type: number
 *               passingScore:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: המשחק עודכן בהצלחה
 *       404:
 *         description: המשחק לא נמצא
 *       500:
 *         description: שגיאת שרת
 */
router.put('/:id', adminAuth, gameValidationRules(), updateGame);

/**
 * @swagger
 * /admin/games/{id}:
 *   delete:
 *     summary: מחיקת משחק
 *     tags: [Games Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: מזהה המשחק
 *     responses:
 *       200:
 *         description: המשחק נמחק בהצלחה
 *       400:
 *         description: לא ניתן למחוק משחק שנוחק בעבר
 *       404:
 *         description: המשחק לא נמצא
 *       500:
 *         description: שגיאת שרת
 */
router.delete('/:id', adminAuth, deleteGame);

// DIRECT QUESTION MANAGEMENT ROUTES

/**
 * @swagger
 * /admin/games/{gameId}/questions-new:
 *   get:
 *     summary: קבלת כל השאלות של משחק ספציפי (גישה חדשה)
 *     tags: [Games Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: string
 *         required: true
 *         description: מזהה המשחק
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: מספר העמוד
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: כמות תוצאות לעמוד
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: חיפוש בשאלות
 *     responses:
 *       200:
 *         description: שאלות המשחק התקבלו בהצלחה
 *       404:
 *         description: המשחק לא נמצא
 *       500:
 *         description: שגיאת שרת
 */
router.get('/:gameId/questions-new', adminAuth, getGameQuestionsNew);

/**
 * @swagger
 * /admin/games/{gameId}/questions-new:
 *   post:
 *     summary: יצירת שאלה חדשה למשחק ספציפי
 *     tags: [Games Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: string
 *         required: true
 *         description: מזהה המשחק
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - word
 *               - correctAnswer
 *               - wrongAnswers
 *             properties:
 *               word:
 *                 type: string
 *                 description: המילה בעברית
 *               correctAnswer:
 *                 type: string
 *                 description: התשובה הנכונה
 *               wrongAnswers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 3 תשובות שגויות
 *               ashkenaziAudioFile:
 *                 type: string
 *                 description: קובץ אודיו אשכנזי (אופציונלי)
 *               sephardiAudioFile:
 *                 type: string
 *                 description: קובץ אודיו ספרדי (אופציונלי)
 *     responses:
 *       201:
 *         description: השאלה נוצרה בהצלחה
 *       400:
 *         description: נתונים לא תקינים
 *       404:
 *         description: המשחק לא נמצא
 *       500:
 *         description: שגיאת שרת
 */
router.post('/:gameId/questions-new', adminAuth, questionValidationRules(), createGameQuestion);

/**
 * @swagger
 * /admin/games/{gameId}/questions-new/{questionId}:
 *   put:
 *     summary: עדכון שאלה במשחק ספציפי
 *     tags: [Games Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: string
 *         required: true
 *         description: מזהה המשחק
 *       - in: path
 *         name: questionId
 *         schema:
 *           type: string
 *         required: true
 *         description: מזהה השאלה
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               word:
 *                 type: string
 *               correctAnswer:
 *                 type: string
 *               wrongAnswers:
 *                 type: array
 *                 items:
 *                   type: string
 *               ashkenaziAudioFile:
 *                 type: string
 *               sephardiAudioFile:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: השאלה עודכנה בהצלחה
 *       400:
 *         description: נתונים לא תקינים
 *       404:
 *         description: השאלה או המשחק לא נמצאו
 *       500:
 *         description: שגיאת שרת
 */
router.put('/:gameId/questions-new/:questionId', adminAuth, questionValidationRules(), updateGameQuestion);

/**
 * @swagger
 * /admin/games/{gameId}/questions-new/{questionId}:
 *   delete:
 *     summary: מחיקת שאלה ממשחק ספציפי
 *     tags: [Games Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: string
 *         required: true
 *         description: מזהה המשחק
 *       - in: path
 *         name: questionId
 *         schema:
 *           type: string
 *         required: true
 *         description: מזהה השאלה
 *     responses:
 *       200:
 *         description: השאלה נמחקה בהצלחה
 *       404:
 *         description: השאלה או המשחק לא נמצאו
 *       500:
 *         description: שגיאת שרת
 */
router.delete('/:gameId/questions-new/:questionId', adminAuth, deleteGameQuestion);

/**
 * @swagger
 * /admin/games/{gameId}/questions-new/bulk-import:
 *   post:
 *     summary: ייבוא מרובה של שאלות למשחק מקובץ
 *     tags: [Games Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         schema:
 *           type: string
 *         required: true
 *         description: מזהה המשחק
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questions
 *             properties:
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - word
 *                     - correctAnswer
 *                     - wrongAnswers
 *                   properties:
 *                     word:
 *                       type: string
 *                     correctAnswer:
 *                       type: string
 *                     wrongAnswers:
 *                       type: array
 *                       items:
 *                         type: string
 *     responses:
 *       200:
 *         description: ייבוא השאלות הושלם
 *       400:
 *         description: נתונים לא תקינים
 *       404:
 *         description: המשחק לא נמצא
 *       500:
 *         description: שגיאת שרת
 */
router.post('/:gameId/questions-new/bulk-import', adminAuth, bulkImportGameQuestions);

module.exports = router;
