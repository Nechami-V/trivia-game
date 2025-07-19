const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. Admin token required.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid admin token or admin not found.' 
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid admin token.' 
    });
  }
};

const superAdminAuth = async (req, res, next) => {
  try {
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin privileges required.'
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error checking admin privileges.' 
    });
  }
};

module.exports = { adminAuth, superAdminAuth };
