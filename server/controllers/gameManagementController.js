const Game = require('../models/Game');
const GameQuestion = require('../models/GameQuestion');
const Question = require('../models/Question');
const Score = require('../models/Score');
const path = require('path');
const fs = require('fs').promises;

// Get all games
const getAllGames = async (req, res) => {
  try {
    const games = await Game.find()
      .populate('createdBy', 'username')
      .populate('questionCount')
      .sort({ createdAt: -1 });

    // Calculate question count for each game
    for (let game of games) {
      const questionCount = await GameQuestion.countDocuments({ gameId: game._id, isActive: true });
      game.totalQuestions = questionCount;
    }

    res.json({
      success: true,
      games
    });
  } catch (error) {
    console.error('Get all games error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בקבלת רשימת המשחקים',
      error: error.message
    });
  }
};

// Get single game
const getGame = async (req, res) => {
  try {
    const { id } = req.params;

    const game = await Game.findById(id)
      .populate('createdBy', 'username');

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'המשחק לא נמצא'
      });
    }

    // Get question count
    const questionCount = await GameQuestion.countDocuments({ gameId: id, isActive: true });
    game.totalQuestions = questionCount;

    res.json({
      success: true,
      game
    });
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בקבלת פרטי המשחק',
      error: error.message
    });
  }
};

// Create new game
const createGame = async (req, res) => {
  try {
    const {
      name,
      description,
      image,
      maxQuestions,
      passingScore
    } = req.body;

    // Check if game with same name exists
    const existingGame = await Game.findOne({ name: name.trim() });
    if (existingGame) {
      return res.status(400).json({
        success: false,
        message: 'משחק עם השם הזה כבר קיים'
      });
    }

    const game = new Game({
      name: name.trim(),
      description: description.trim(),
      image,
      maxQuestions,
      passingScore,
      createdBy: req.admin.id
    });

    await game.save();

    const populatedGame = await Game.findById(game._id)
      .populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      message: 'המשחק נוצר בהצלחה',
      game: populatedGame
    });
  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה ביצירת המשחק',
      error: error.message
    });
  }
};

// Update game
const updateGame = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.createdBy;
    delete updates.totalPlays;
    delete updates.averageScore;

    // Check if name is being updated and if it conflicts
    if (updates.name) {
      const existingGame = await Game.findOne({ 
        name: updates.name.trim(),
        _id: { $ne: id }
      });
      
      if (existingGame) {
        return res.status(400).json({
          success: false,
          message: 'משחק עם השם הזה כבר קיים'
        });
      }
      updates.name = updates.name.trim();
    }

    const game = await Game.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username');

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'המשחק לא נמצא'
      });
    }

    res.json({
      success: true,
      message: 'המשחק עודכן בהצלחה',
      game
    });
  } catch (error) {
    console.error('Update game error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון המשחק',
      error: error.message
    });
  }
};

// Delete game
const deleteGame = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if game exists
    const game = await Game.findById(id);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'המשחק לא נמצא'
      });
    }

    // Check if game has scores (played games)
    const scoresCount = await Score.countDocuments({ gameId: id });
    if (scoresCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'לא ניתן למחוק משחק שנמחק בעבר. ניתן להפוך אותו ללא פעיל.'
      });
    }

    // Delete all game questions associations
    await GameQuestion.deleteMany({ gameId: id });

    // Delete the game
    await Game.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'המשחק נמחק בהצלחה'
    });
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה במחיקת המשחק',
      error: error.message
    });
  }
};

// Get all questions for a specific game (new direct approach)
const getGameQuestionsNew = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { 
      page = 1, 
      limit = 20, 
      search = '',
      isActive = ''
    } = req.query;

    const skip = (page - 1) * limit;

    // Verify game exists
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'המשחק לא נמצא'
      });
    }

    // Build filter
    const filter = { gameId };
    
    if (search) {
      filter.$or = [
        { word: { $regex: search, $options: 'i' } },
        { correctAnswer: { $regex: search, $options: 'i' } },
        { wrongAnswers: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (isActive !== '') filter.isActive = isActive === 'true';

    const questions = await Question.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Question.countDocuments(filter);

    res.json({
      success: true,
      questions,
      game: {
        id: game._id,
        name: game.name
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get game questions error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בקבלת שאלות המשחק',
      error: error.message
    });
  }
};

// Create new question for a specific game
const createGameQuestion = async (req, res) => {
  try {
    const { gameId } = req.params;
    const {
      word,
      correctAnswer,
      wrongAnswers,
      ashkenaziAudioFile,
      sephardiAudioFile
    } = req.body;

    // Verify game exists
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'המשחק לא נמצא'
      });
    }

    // Validate wrongAnswers array
    if (!Array.isArray(wrongAnswers) || wrongAnswers.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'חייב לספק בדיוק 3 תשובות שגויות'
      });
    }

    const question = await Question.create({
      gameId,
      word,
      correctAnswer,
      wrongAnswers,
      ashkenaziAudioFile,
      sephardiAudioFile
    });

    // Update game's total questions count
    const totalQuestions = await Question.countDocuments({ gameId, isActive: true });
    await Game.findByIdAndUpdate(gameId, { totalQuestions });

    res.status(201).json({
      success: true,
      message: 'השאלה נוצרה בהצלחה',
      question
    });
  } catch (error) {
    console.error('Create game question error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה ביצירת השאלה',
      error: error.message
    });
  }
};

// Update question for a specific game
const updateGameQuestion = async (req, res) => {
  try {
    const { gameId, questionId } = req.params;
    const {
      word,
      correctAnswer,
      wrongAnswers,
      ashkenaziAudioFile,
      sephardiAudioFile,
      isActive
    } = req.body;

    // Verify game exists
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'המשחק לא נמצא'
      });
    }

    // Validate wrongAnswers array if provided
    if (wrongAnswers && (!Array.isArray(wrongAnswers) || wrongAnswers.length !== 3)) {
      return res.status(400).json({
        success: false,
        message: 'חייב לספק בדיוק 3 תשובות שגויות'
      });
    }

    const question = await Question.findOneAndUpdate(
      { _id: questionId, gameId },
      {
        word,
        correctAnswer,
        wrongAnswers,
        ashkenaziAudioFile,
        sephardiAudioFile,
        isActive
      },
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'השאלה לא נמצאה במשחק זה'
      });
    }

    // Update game's total questions count
    const totalQuestions = await Question.countDocuments({ gameId, isActive: true });
    await Game.findByIdAndUpdate(gameId, { totalQuestions });

    res.json({
      success: true,
      message: 'השאלה עודכנה בהצלחה',
      question
    });
  } catch (error) {
    console.error('Update game question error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בעדכון השאלה',
      error: error.message
    });
  }
};

// Delete question from a specific game
const deleteGameQuestion = async (req, res) => {
  try {
    const { gameId, questionId } = req.params;

    // Verify game exists
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'המשחק לא נמצא'
      });
    }

    const question = await Question.findOneAndDelete({ _id: questionId, gameId });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'השאלה לא נמצאה במשחק זה'
      });
    }

    // Delete associated audio files
    const audioFiles = [question.ashkenaziAudioFile, question.sephardiAudioFile].filter(Boolean);
    
    for (const audioFile of audioFiles) {
      try {
        const filePath = path.join(__dirname, '../uploads/audio', audioFile);
        await fs.unlink(filePath);
      } catch (fileError) {
        console.warn(`Could not delete audio file: ${audioFile}`, fileError.message);
      }
    }

    // Update game's total questions count
    const totalQuestions = await Question.countDocuments({ gameId, isActive: true });
    await Game.findByIdAndUpdate(gameId, { totalQuestions });

    res.json({
      success: true,
      message: 'השאלה נמחקה בהצלחה'
    });
  } catch (error) {
    console.error('Delete game question error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה במחיקת השאלה',
      error: error.message
    });
  }
};

// Bulk import questions for a specific game from Excel/CSV
const bulkImportGameQuestions = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { questions } = req.body;

    // Verify game exists
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'המשחק לא נמצא'
      });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'חייב לספק מערך של שאלות'
      });
    }

    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < questions.length; i++) {
      try {
        const questionData = questions[i];
        
        // Validate required fields
        if (!questionData.word || !questionData.correctAnswer || 
            !Array.isArray(questionData.wrongAnswers) || 
            questionData.wrongAnswers.length !== 3) {
          results.failed++;
          results.errors.push(`שאלה ${i + 1}: פורמט שאלה לא תקין`);
          continue;
        }

        await Question.create({
          gameId,
          ...questionData
        });
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push(`שאלה ${i + 1}: ${error.message}`);
      }
    }

    // Update game's total questions count
    const totalQuestions = await Question.countDocuments({ gameId, isActive: true });
    await Game.findByIdAndUpdate(gameId, { totalQuestions });

    res.json({
      success: true,
      message: `ייבוא הושלם: ${results.successful} הצליחו, ${results.failed} נכשלו`,
      results
    });
  } catch (error) {
    console.error('Bulk import game questions error:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בייבוא השאלות',
      error: error.message
    });
  }
};

module.exports = {
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
};
