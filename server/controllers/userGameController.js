const Game = require('../models/Game');
const Question = require('../models/Question');
const Score = require('../models/Score');
const User = require('../models/User');

// Get all active games for users
const getAllActiveGames = async (req, res) => {
  try {
    const games = await Game.find({ isActive: true })
      .select('name description image maxQuestions passingScore totalQuestions totalPlays averageScore')
      .sort({ totalPlays: -1 }); // Sort by popularity

    // Add question count for each game (direct approach)
    for (let game of games) {
      const questionCount = await Question.countDocuments({ gameId: game._id, isActive: true });
      game.totalQuestions = questionCount;
    }

    res.json({
      success: true,
      games
    });
  } catch (error) {
    console.error('Get active games error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בקבלת רשימת המשחקים',
      error: error.message
    });
  }
};

// Get single game details for users
const getGameDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const game = await Game.findOne({ _id: id, isActive: true })
      .select('name description image maxQuestions passingScore totalQuestions totalPlays averageScore');

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'המשחק לא נמצא או לא פעיל'
      });
    }

    // Get question count (direct approach)
    const questionCount = await Question.countDocuments({ gameId: id, isActive: true });
    
    // Get user's best score for this game (if authenticated)
    let userBestScore = null;
    if (req.user) {
      const bestScore = await Score.findOne({ gameId: id, userId: req.user.id })
        .sort({ score: -1 })
        .select('score correctAnswers questionsAnswered gameDuration createdAt');
      userBestScore = bestScore;
    }

    // Get top 10 scores for leaderboard
    const topScores = await Score.find({ gameId: id })
      .populate('userId', 'username')
      .sort({ score: -1, gameDuration: 1 }) // Best score, then fastest time
      .limit(10)
      .select('score correctAnswers questionsAnswered gameDuration createdAt');

    res.json({
      success: true,
      game: {
        ...game.toObject(),
        totalQuestions: questionCount,
        userBestScore,
        topScores
      }
    });
  } catch (error) {
    console.error('Get game details error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בקבלת פרטי המשחק',
      error: error.message
    });
  }
};

// Start a game session
const startGameSession = async (req, res) => {
  try {
    const { id } = req.params; // game id
    const userId = req.user.id;

    // Check if game exists and is active
    const game = await Game.findOne({ _id: id, isActive: true });
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'המשחק לא נמצא או לא פעיל'
      });
    }

    // Get game questions randomly (direct approach)
    const allQuestions = await Question.find({ gameId: id, isActive: true });

    if (allQuestions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'אין שאלות פעילות במשחק זה'
      });
    }

    // Limit to maxQuestions and shuffle
    let questionsToSend = allQuestions;
    if (game.maxQuestions && allQuestions.length > game.maxQuestions) {
      // Shuffle and take maxQuestions
      questionsToSend = allQuestions
        .sort(() => 0.5 - Math.random())
        .slice(0, game.maxQuestions);
    }

    // Prepare questions (mix answers randomly)
    const sessionQuestions = questionsToSend.map((question, index) => {
      const allAnswers = [question.correctAnswer, ...question.wrongAnswers];
      const shuffledAnswers = allAnswers.sort(() => 0.5 - Math.random());

      return {
        questionNumber: index + 1,
        questionId: question._id,
        word: question.word,
        answers: shuffledAnswers,
        ashkenaziAudioFile: question.ashkenaziAudioFile,
        sephardiAudioFile: question.sephardiAudioFile
      };
    });

    // Create game session (we'll store this temporarily in memory or Redis in production)
    // For now, we'll return the session data and let the client manage it
    const sessionData = {
      sessionId: `${userId}_${id}_${Date.now()}`,
      gameId: id,
      userId,
      questions: sessionQuestions,
      totalQuestions: sessionQuestions.length,
      passingScore: game.passingScore,
      startedAt: new Date()
    };

    // Update game play count
    await Game.findByIdAndUpdate(id, { $inc: { totalPlays: 1 } });

    res.json({
      success: true,
      message: 'המשחק התחיל בהצלחה',
      session: {
        sessionId: sessionData.sessionId,
        gameId: id,
        gameName: game.name,
        totalQuestions: sessionData.totalQuestions,
        passingScore: game.passingScore,
        questions: sessionQuestions.map(q => ({
          questionNumber: q.questionNumber,
          questionId: q.questionId,
          word: q.word,
          answers: q.answers,
          ashkenaziAudioFile: q.ashkenaziAudioFile,
          sephardiAudioFile: q.sephardiAudioFile
        }))
      }
    });
  } catch (error) {
    console.error('Start game session error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בהתחלת המשחק',
      error: error.message
    });
  }
};

// Submit game answers and get results
const submitGameResults = async (req, res) => {
  try {
    const { id } = req.params; // game id
    const { sessionId, answers, gameDuration } = req.body;
    const userId = req.user.id;

    // Validate session
    if (!sessionId.startsWith(`${userId}_${id}_`)) {
      return res.status(400).json({
        success: false,
        message: 'מזהה המשחק לא תקין'
      });
    }

    // Check if game exists
    const game = await Game.findById(id);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'המשחק לא נמצא'
      });
    }

    // Get correct answers (direct approach)
    const questions = await Question.find({ gameId: id, isActive: true }, 'correctAnswer');

    const correctAnswersMap = {};
    questions.forEach(question => {
      correctAnswersMap[question._id.toString()] = question.correctAnswer;
    });

    // Calculate score
    let correctAnswers = 0;
    let totalQuestions = Object.keys(answers).length;

    for (const [questionId, userAnswer] of Object.entries(answers)) {
      if (correctAnswersMap[questionId] === userAnswer) {
        correctAnswers++;
      }
    }

    const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = scorePercentage >= game.passingScore;

    // Save score to database
    const score = new Score({
      userId,
      gameId: id,
      score: scorePercentage,
      questionsAnswered: totalQuestions,
      correctAnswers,
      gameDuration: gameDuration || 0,
      gameMode: 'normal'
    });

    await score.save();

    // Update game average score
    const allScores = await Score.find({ gameId: id });
    const averageScore = allScores.reduce((sum, s) => sum + s.score, 0) / allScores.length;
    await Game.findByIdAndUpdate(id, { averageScore: Math.round(averageScore) });

    // Update user total score
    const userTotalScore = await Score.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: null, totalScore: { $sum: '$score' } } }
    ]);

    if (userTotalScore.length > 0) {
      await User.findByIdAndUpdate(userId, { totalScore: userTotalScore[0].totalScore });
    }

    // Get user's rank in this game
    const betterScores = await Score.countDocuments({
      gameId: id,
      $or: [
        { score: { $gt: scorePercentage } },
        { score: scorePercentage, gameDuration: { $lt: gameDuration || 999999 } }
      ]
    });
    const rank = betterScores + 1;

    res.json({
      success: true,
      results: {
        score: scorePercentage,
        correctAnswers,
        totalQuestions,
        passed,
        rank,
        gameDuration: gameDuration || 0,
        answers: Object.entries(answers).map(([questionId, userAnswer]) => ({
          questionId,
          userAnswer,
          correctAnswer: correctAnswersMap[questionId],
          isCorrect: correctAnswersMap[questionId] === userAnswer
        }))
      }
    });
  } catch (error) {
    console.error('Submit game results error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בשמירת תוצאות המשחק',
      error: error.message
    });
  }
};

// Get user's game history
const getUserGameHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, gameId } = req.query;

    const filter = { userId };
    if (gameId) {
      filter.gameId = gameId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const scores = await Score.find(filter)
      .populate('gameId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('score correctAnswers questionsAnswered gameDuration createdAt gameMode');

    const totalScores = await Score.countDocuments(filter);

    res.json({
      success: true,
      history: scores,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalScores / parseInt(limit)),
        totalScores,
        hasNext: skip + scores.length < totalScores,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get user game history error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בקבלת היסטוריית המשחקים',
      error: error.message
    });
  }
};
module.exports = {
    getAllActiveGames,
    getGameDetails,
    startGameSession,
    submitGameResults,
    getUserGameHistory
};
