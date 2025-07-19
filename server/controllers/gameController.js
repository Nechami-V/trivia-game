const Question = require('../models/Question');
const User = require('../models/User');
const Score = require('../models/Score');

// @desc    Get random questions for game
// @route   GET /api/game/questions
// @access  Private
const getRandomQuestions = async (req, res) => {
  try {
    const { count = 10, difficulty } = req.query;
    
    const filter = { isActive: true };
    if (difficulty) {
      filter.difficulty = difficulty;
    }

    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: parseInt(count) } }
    ]);

    // Format questions for game (shuffle answers)
    const gameQuestions = questions.map(question => {
      const answers = [question.correctAnswer, ...question.wrongAnswers];
      
      // Shuffle answers
      for (let i = answers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [answers[i], answers[j]] = [answers[j], answers[i]];
      }

      return {
        id: question._id,
        word: question.word,
        answers: answers,
        correctAnswer: question.correctAnswer,
        ashkenaziAudioFile: question.ashkenaziAudioFile,
        sephardiAudioFile: question.sephardiAudioFile,
        difficulty: question.difficulty
      };
    });

    res.json({
      success: true,
      questions: gameQuestions
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting questions'
    });
  }
};

// @desc    Start a new game
// @route   POST /api/game/start
// @access  Private
const startGame = async (req, res) => {
  try {
    const user = req.user;
    
    // Check if user can play (game limit middleware already checked this)
    
    res.json({
      success: true,
      message: 'Game started',
      canPlay: true,
      gamesRemaining: user.hasPaid ? 'unlimited' : Math.max(0, process.env.FREE_GAMES_LIMIT - user.gamesPlayed)
    });
  } catch (error) {
    console.error('Start game error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error starting game'
    });
  }
};

// @desc    Submit game result
// @route   POST /api/game/result
// @access  Private
const submitGameResult = async (req, res) => {
  try {
    const { score, gameMode, questionsAnswered, correctAnswers, gameDuration } = req.body;
    const userId = req.user._id;

    // Create score record
    const scoreRecord = await Score.create({
      userId,
      score,
      gameMode,
      questionsAnswered,
      correctAnswers,
      gameDuration
    });

    // Update user's game count
    await User.findByIdAndUpdate(userId, { 
      $inc: { gamesPlayed: 1 } 
    });

    // Get user's rank
    const betterScores = await Score.countDocuments({ score: { $gt: score } });
    const rank = betterScores + 1;

    // Get funny title based on score
    const getTitle = (score) => {
      if (score >= 1000) return "מלך הטריוויה! 👑";
      if (score >= 800) return "גאון בשפות! 🧠";
      if (score >= 600) return "מומחה מילים! 📚";
      if (score >= 400) return "חובב שפות! 💪";
      if (score >= 200) return "מתחיל מבטיח! 🌟";
      return "רק מתחיל! 🚀";
    };

    res.json({
      success: true,
      message: 'Game result submitted successfully',
      scoreRecord: {
        id: scoreRecord._id,
        score: scoreRecord.score,
        rank: rank,
        title: getTitle(score)
      },
      gamesPlayed: req.user.gamesPlayed + 1
    });
  } catch (error) {
    console.error('Submit game result error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting game result'
    });
  }
};

// @desc    Get leaderboard
// @route   GET /api/game/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const leaderboard = await Score.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$userId',
          bestScore: { $max: '$score' },
          userName: { $first: '$user.name' },
          totalGames: { $sum: 1 },
          lastPlayed: { $max: '$createdAt' }
        }
      },
      { $sort: { bestScore: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    const total = await Score.distinct('userId').then(userIds => userIds.length);

    res.json({
      success: true,
      leaderboard: leaderboard.map((entry, index) => ({
        rank: skip + index + 1,
        userName: entry.userName,
        bestScore: entry.bestScore,
        totalGames: entry.totalGames,
        lastPlayed: entry.lastPlayed
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting leaderboard'
    });
  }
};

module.exports = {
  getRandomQuestions,
  startGame,
  submitGameResult,
  getLeaderboard
};
