const bcrypt = require('bcrypt');
const User = require('../models/User');
const ROLES = require('../utils/roles');
const RoleChangeRequest = require('../models/RoleChangeRequest');
// const User = require('../models/User');
// const ROLES = require('../utils/roles');

// Load env variables
const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL;
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD;

exports.unlockAdmin = async (req, res) => {
  const { superadminUsername, superadminPassword, adminUsername } = req.body;

  try {
    //  Verify superadmin credentials
    if (superadminUsername !== SUPERADMIN_EMAIL || superadminPassword !== SUPERADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Invalid superadmin credentials' });
    }

    //  Find the user by username only (any role)
    const user = await User.findOne({ username: adminUsername });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    //  Check if user is locked
    if (!user.locked) {
      return res.status(400).json({ message: 'User is not locked' });
    }

    //  Unlock the user
    user.locked = false;
    user.failedAttempts = 0;
    await user.save();

    return res.status(200).json({ message: `User '${adminUsername}' unlocked successfully` });
  } catch (err) {
    console.error('Unlock User Error:', err);
    return res.status(500).json({ message: err.message });
  }
};

exports.getRoleChangeRequests = async (req, res) => {
  try {
    console.log("Fetching role change requests...");

    const requests = await RoleChangeRequest.find({ status: 'pending' }).populate('userId', 'username');

    res.status(200).json({ requests });
  } catch (err) {
    console.error('Error fetching role change requests:', err);
    res.status(500).json({ message: err.message });
  }
};
// 2. Get all users whose account is locked
exports.getLockedUsers = async (req, res) => {
  try {
    const lockedUsers = await User.find({ locked: true }).select('username role failedAttempts');
    res.status(200).json({ lockedUsers });
  } catch (err) {
    console.error('Error fetching locked users:', err);
    res.status(500).json({ message: err.message });
  }
};