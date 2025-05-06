const bcrypt = require('bcrypt');
const User = require('../models/User');
const ROLES = require('../utils/roles'); // your role constants
require('dotenv').config();
const SALT_ROUNDS = 10;

exports.register = async (req, res) => {
  const { username, email, password, role } = req.body;
  // Allowed roles for registration: admin and transactional.
  const allowedRoles = [ROLES.ADMIN, ROLES.TRANSACTIONAL];

  try {
    // Check if username or email already exists.
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
  console.log("dsfgdsrgs");
  
    // Validate role.
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Allowed roles are admin and transactional.' });
    }

    // Hash the password.
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = new User({ username, email, password: hashedPassword, role });
    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // ✅ 1. Check if it's SuperAdmin login first
    if (username === process.env.SUPERADMIN_EMAIL && password === process.env.SUPERADMIN_PASSWORD) {
      return res.status(200).json({
        message: 'SuperAdmin login successful',
        role: 'superadmin'
      });
    }

    // ✅ 2. Normal User login flow (your old logic below)
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    console.log(user);

    if (user.role === ROLES.ADMIN && user.locked) {
      return res.status(403).json({ message: 'Admin account is locked. Please contact superadmin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      if (user.role === ROLES.ADMIN) {
        user.failedAttempts = 0;
        await user.save();
      }
      return res.status(200).json({ message: 'Login successful', role: user.role });
    } else {
      if (user.role === ROLES.ADMIN) {
        user.failedAttempts += 1;
        if (user.failedAttempts >= 5) {
          user.locked = true;
        }
        await user.save();
        if (user.locked) {
          return res.status(403).json({ message: 'Admin account locked after 5 failed attempts. Please contact superadmin.' });
        }
      }
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


