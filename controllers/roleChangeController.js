const User = require('../models/User');
const RoleChangeRequest = require('../models/RoleChangeRequest');
const ROLES = require('../utils/roles');

exports.requestRoleChange = async (req, res) => {
  const { username, requestedRole } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Superadmin is not allowed to request a role change.
    if (user.role === ROLES.SUPERADMIN) {
      return res.status(403).json({ message: 'Superadmin cannot request a role change' });
    }
    const request = new RoleChangeRequest({
      userId: user._id,
      requestedRole
    });
    await request.save();
    return res.status(200).json({ message: 'Role change request submitted', request });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
// Load env variables
const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL;
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD;

exports.processRoleChangeRequest = async (req, res) => {
  const { id } = req.params;
  const { superadminUsername, superadminPassword, decision } = req.body;

  try {
    // ✅ Verify superadmin credentials from environment variables
    if (superadminUsername !== SUPERADMIN_EMAIL || superadminPassword !== SUPERADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Invalid superadmin credentials' });
    }

    const roleRequest = await RoleChangeRequest.findById(id);
    if (!roleRequest) {
      return res.status(404).json({ message: 'Role change request not found' });
    }
    if (roleRequest.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been processed' });
    }

    // ✅ Accept or Reject logic
    if (decision === 'accepted') {
      const User = require('../models/User');
      const user = await User.findById(roleRequest.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      user.role = roleRequest.requestedRole;
      await user.save();
      roleRequest.status = 'accepted';
      await roleRequest.save();
      return res.status(200).json({ message: 'Role change request accepted; user role updated' });
    } else if (decision === 'rejected') {
      roleRequest.status = 'rejected';
      await roleRequest.save();
      return res.status(200).json({ message: 'Role change request rejected' });
    } else {
      return res.status(400).json({ message: "Invalid decision. Use 'accepted' or 'rejected'." });
    }

  } catch (err) {
    console.error('Error while processing role request:', err);
    return res.status(500).json({ message: err.message });
  }
};
