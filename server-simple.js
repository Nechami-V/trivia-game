const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client')));

// Mock API routes for demo
app.get('/api/games', (req, res) => {
  const mockGames = [
    {
      _id: '1',
      title: 'טריוויה היסטוריה',
      description: 'שאלות על אירועים היסטוריים חשובים בישראל ובעולם',
      category: 'היסטוריה',
      difficulty: 'medium',
      questionsCount: 25,
      timeLimit: 15,
      isActive: true
    },
    {
      _id: '2',
      title: 'מדע לילדים',
      description: 'שאלות מדע מגניבות המתאימות לילדים',
      category: 'מדע',
      difficulty: 'easy',
      questionsCount: 20,
      timeLimit: 10,
      isActive: true
    },
    {
      _id: '3',
      title: 'ספורט עולמי',
      description: 'שאלות על ספורטאים, תחרויות ושיאים',
      category: 'ספורט',
      difficulty: 'hard',
      questionsCount: 30,
      timeLimit: 20,
      isActive: true
    },
    {
      _id: '4',
      title: 'גיאוגרפיה ישראל',
      description: 'הכרת הארץ - מקומות, ערים ונופים',
      category: 'גיאוגרפיה',
      difficulty: 'medium',
      questionsCount: 18,
      timeLimit: 12,
      isActive: true
    }
  ];
  
  res.json({ success: true, data: mockGames });
});

app.get('/api/questions/:gameId', (req, res) => {
  const mockQuestions = [
    {
      _id: '1',
      question: 'איזה כוכב לכת הוא הקרוב ביותר לשמש?',
      answers: ['נוגה', 'כוכב חמה', 'מאדים', 'צדק'],
      correctAnswer: 1,
      explanation: 'כוכב חמה (מרקורי) הוא הכוכב הקרוב ביותר לשמש',
      difficulty: 'easy'
    },
    {
      _id: '2',
      question: 'באיזה שנה הוקמה מדינת ישראל?',
      answers: ['1947', '1948', '1949', '1950'],
      correctAnswer: 1,
      explanation: 'מדינת ישראל הוקמה ב-14 במאי 1948',
      difficulty: 'easy'
    },
    {
      _id: '3',
      question: 'מהו הר הגבוה ביותר בעולם?',
      answers: ['K2', 'אוורסט', 'אנקונקגוואה', 'מקינלי'],
      correctAnswer: 1,
      explanation: 'הר האוורסט הוא ההר הגבוה ביותר בעולם (8,848 מטר)',
      difficulty: 'medium'
    }
  ];
  
  res.json({ success: true, data: mockQuestions });
});

// Serve the web app
app.get('/', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, 'client', 'trivia-app.html'));
  } catch (error) {
    console.log('Error serving file:', error);
    res.status(404).send('File not found');
  }
});

// Alternative route
app.get('/trivia-app.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'trivia-app.html'));
});

// Debug route
app.get('/debug', (req, res) => {
  res.json({
    message: 'Server is working',
    files: require('fs').readdirSync(path.join(__dirname, 'client')),
    path: path.join(__dirname, 'client')
  });
});

app.listen(PORT, () => {
  console.log(`🚀 שרת רץ על פורט ${PORT}`);
  console.log(`🌐 גרסת דפדפן: http://localhost:${PORT}`);
  console.log(`📱 עבור מובייל - הורידו Expo Go וסרקו QR`);
  console.log(`🔍 דיבוג: http://localhost:${PORT}/debug`);
});
