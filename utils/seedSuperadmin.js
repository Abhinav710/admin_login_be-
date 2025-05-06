// utils/seedSuperadmin.js
const bcrypt = require('bcrypt');
const User = require('../models/User');
const ROLES = require('../utils/roles');

const SALT_ROUNDS = 10;

const seedSuperadmin = async () => {
  try {
    // Check if a superadmin exists
    const existingSuperadmin = await User.findOne({ role: ROLES.SUPERADMIN });
    if (existingSuperadmin) {
      console.log('Superadmin already exists');
      return;
    }
    // If not, create a default superadmin.
    const hashedPassword = await bcrypt.hash('superpassword', SALT_ROUNDS);
    const superadmin = new User({
      username: 'superadmin',
      email: 'superadmin@example.com', // provide a valid email
      password: hashedPassword,
      role: ROLES.SUPERADMIN
    });
    await superadmin.save();
    console.log('Default superadmin created');
  } catch (err) {
    console.error('Error creating superadmin:', err.message);
  }
};

module.exports = seedSuperadmin;
