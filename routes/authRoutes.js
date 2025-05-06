const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const roleChangeController = require('../controllers/roleChangeController');

// User Registration
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Unlock Admin (by superadmin)
router.post('/unlock', adminController.unlockAdmin);

// Request Role Change (non‑superadmin users)
router.post('/role-change-request', roleChangeController.requestRoleChange);

// Process Role Change Request (by superadmin)
router.put('/role-change-request/:id', roleChangeController.processRoleChangeRequest);
// API to get all role change requests
router.get('/role-change-requests', adminController.getRoleChangeRequests);

// API to get all locked users
router.get('/locked-users', adminController.getLockedUsers);
module.exports = router;
