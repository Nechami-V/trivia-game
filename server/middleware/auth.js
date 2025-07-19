const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token or user not found.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

const checkGameLimit = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (user.hasPaid) {
      return next(); // Paid users have unlimited access
    }
    
    if (user.gamesPlayed >= process.env.FREE_GAMES_LIMIT) {
      return res.status(403).json({
        success: false,
        message: 'Free games limit reached. Please upgrade to continue playing.',
        gamesPlayed: user.gamesPlayed,
        limit: process.env.FREE_GAMES_LIMIT
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error checking game limit.' 
    });
  }
};

module.exports = { auth, checkGameLimit };
