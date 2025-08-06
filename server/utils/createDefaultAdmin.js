const Admin = require('../models/Admin');

const createDefaultAdmin = async () => {
  try {
    // בדוק אם כבר יש מנהל במערכת
    const adminCount = await Admin.countDocuments();
    
    if (adminCount === 0) {
      console.log('Creating default admin user...');
      
      const defaultAdmin = await Admin.create({
        username: 'admin',
        password: 'admin123', // יוצפן אוטומטית על ידי המודל
        role: 'super_admin'
      });
      
      console.log('✅ Default admin created successfully:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   Role: super_admin');
      console.log('');
      console.log('🔑 Please change the default password after first login!');
    } else {
      console.log('Admin users already exist in the system');
    }
  } catch (error) {
    console.error('Error creating default admin:', error.message);
  }
};

module.exports = { createDefaultAdmin };
