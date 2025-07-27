const { validationResult } = require('express-validator');
const Question = require('../models/Question');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/audio');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// @desc    Get all questions with pagination and filters
// @route   GET /api/admin/questions
// @access  Private (Admin)
const getAllQuestions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      isActive = ''
    } = req.query;

    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
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

    // Get statistics
    const stats = await Question.aggregate([
      {
        $group: {
          _id: null,
          totalQuestions: { $sum: 1 },
          activeQuestions: { $sum: { $cond: ['$isActive', 1, 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      questions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      stats: stats[0] || { totalQuestions: 0, activeQuestions: 0 }
    });
  } catch (error) {
    console.error('Get all questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting questions'
    });
  }
};

// @desc    Create new question
// @route   POST /api/admin/questions
// @access  Private (Admin)
const createQuestion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      word,
      correctAnswer,
      wrongAnswers,
      ashkenaziAudioFile,
      sephardiAudioFile
    } = req.body;

    // Validate wrongAnswers array
    if (!Array.isArray(wrongAnswers) || wrongAnswers.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Must provide exactly 3 wrong answers'
      });
    }

    const question = await Question.create({
      word,
      correctAnswer,
      wrongAnswers,
      ashkenaziAudioFile,
      sephardiAudioFile
    });

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      question
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating question'
    });
  }
};

// @desc    Get single question
// @route   GET /api/admin/questions/:id
// @access  Private (Admin)
const getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      question
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting question'
    });
  }
};

// @desc    Update question
// @route   PUT /api/admin/questions/:id
// @access  Private (Admin)
const updateQuestion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      word,
      correctAnswer,
      wrongAnswers,
      ashkenaziAudioFile,
      sephardiAudioFile,
      isActive
    } = req.body;

    // Validate wrongAnswers array if provided
    if (wrongAnswers && (!Array.isArray(wrongAnswers) || wrongAnswers.length !== 3)) {
      return res.status(400).json({
        success: false,
        message: 'Must provide exactly 3 wrong answers'
      });
    }

    const question = await Question.findByIdAndUpdate(
      req.params.id,
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
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      message: 'Question updated successfully',
      question
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating question'
    });
  }
};

// @desc    Delete question
// @route   DELETE /api/admin/questions/:id
// @access  Private (Admin)
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
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

    await Question.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting question'
    });
  }
};

// @desc    Upload audio file for question
// @route   POST /api/admin/questions/:id/audio
// @access  Private (Admin)
const uploadAudioFile = async (req, res) => {
  try {
    const uploadMiddleware = upload.fields([
      { name: 'ashkenaziAudio', maxCount: 1 },
      { name: 'sephardiAudio', maxCount: 1 }
    ]);

    uploadMiddleware(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      const question = await Question.findById(req.params.id);
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }

      const updateData = {};
      
      if (req.files.ashkenaziAudio) {
        updateData.ashkenaziAudioFile = req.files.ashkenaziAudio[0].filename;
      }
      
      if (req.files.sephardiAudio) {
        updateData.sephardiAudioFile = req.files.sephardiAudio[0].filename;
      }

      const updatedQuestion = await Question.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      res.json({
        success: true,
        message: 'Audio files uploaded successfully',
        question: updatedQuestion,
        uploadedFiles: {
          ashkenazi: req.files.ashkenaziAudio?.[0]?.filename,
          sephardi: req.files.sephardiAudio?.[0]?.filename
        }
      });
    });
  } catch (error) {
    console.error('Upload audio error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading audio'
    });
  }
};

// @desc    Bulk import questions from JSON
// @route   POST /api/admin/questions/bulk-import
// @access  Private (Admin)
const bulkImportQuestions = async (req, res) => {
  try {
    const { questions } = req.body;
    
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Must provide an array of questions'
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
        if (!questionData.word || !questionData.correctAnswer || !Array.isArray(questionData.wrongAnswers) || questionData.wrongAnswers.length !== 3) {
          results.failed++;
          results.errors.push(`Question ${i + 1}: Invalid question format`);
          continue;
        }

        await Question.create(questionData);
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Question ${i + 1}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: `Import completed: ${results.successful} successful, ${results.failed} failed`,
      results
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during bulk import'
    });
  }
};

module.exports = {
  getAllQuestions,
  createQuestion,
  getQuestion,
  updateQuestion,
  deleteQuestion,
  uploadAudioFile,
  bulkImportQuestions,
  upload
};
