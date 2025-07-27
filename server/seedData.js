require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Question = require('./models/Question');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding data');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Create default admin user
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (!adminExists) {
      await Admin.create({
        username: 'admin',
        password: 'admin123', // Change this in production!
        role: 'super_admin'
      });
      console.log('Default admin user created: admin/admin123');
    }

    // Create sample questions
    const questionsExist = await Question.countDocuments();
    if (questionsExist === 0) {
      const sampleQuestions = [
        {
          word: 'שלום',
          correctAnswer: 'Peace',
          wrongAnswers: ['War', 'Love', 'Hate']
        },
        {
          word: 'בית',
          correctAnswer: 'House',
          wrongAnswers: ['Car', 'Tree', 'Book']
        },
        {
          word: 'אהבה',
          correctAnswer: 'Love',
          wrongAnswers: ['Anger', 'Fear', 'Joy']
        },
        {
          word: 'חכמה',
          correctAnswer: 'Wisdom',
          wrongAnswers: ['Foolishness', 'Strength', 'Beauty']
        },
        {
          word: 'מלך',
          correctAnswer: 'King',
          wrongAnswers: ['Queen', 'Prince', 'Knight']
        }
      ];

      await Question.insertMany(sampleQuestions);
      console.log('Sample questions created');
    }

    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
