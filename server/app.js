require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const connectDB = require('./config/database');
const { apiLimiter } = require('./middleware/rateLimiter');
const { createDefaultAdmin } = require('./utils/createDefaultAdmin');

// Import routes
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game'); // Back to normal game routes
const settingsRoutes = require('./routes/settings');
const adminRoutes = require('./routes/admin');
const gameManagementRoutes = require('./routes/gameManagement'); // Re-enabled

// Import models to ensure they are registered with Mongoose
require('./models/User');
require('./models/Question');
require('./models/Score');
require('./models/Admin');
require('./models/Game');
require('./models/GameQuestion');
require('./models/Setting');
require('./models/Payment');

const app = express();

// Connect to database
connectDB();

// Create default admin if none exists
createDefaultAdmin();

// Security middleware
app.use(helmet());
// 
app.use(cors());

// Rate limiting
app.use('/api', apiLimiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin/games', gameManagementRoutes); // Re-enabled - Specific route first
app.use('/api/admin', adminRoutes); // General route second

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Trivia Game API Documentation'
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Trivia Game API is running',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to check models and DB connection
app.get('/api/debug', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    success: true,
    models: mongoose.modelNames(),
    connectionState: mongoose.connection.readyState,
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    connectionStatus: {
      0: 'disconnected',
      1: 'connected', 
      2: 'connecting',
      3: 'disconnecting'
    }[mongoose.connection.readyState],
    dbName: mongoose.connection.name
  });
});

// Static files for audio
app.use('/audio', express.static('uploads/audio'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📚 API Documentation available at: http://localhost:${PORT}/api-docs`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
