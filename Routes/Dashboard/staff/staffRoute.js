const express = require('express');
const router = express.Router();
const authenticateUser = require("../../../authMiddleware.js");
const staffController = require('../../../Controller/Dashboard/staff/staffController.js');

router.post('/register', authenticateUser,staffController.registerStaff);
router.post('/login', staffController.loginStaff);
router.get('/', authenticateUser,staffController.getAllStaff);
router.get('/:id', staffController.getStaffById);
router.put('/:id', staffController.updateStaff);
router.delete('/:id', staffController.deleteStaff);

module.exports = router;
