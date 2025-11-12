const express = require('express');
const { getInventoryAnalysis } = require('../../Controller/Dashboard/inventoryController.js');
const authenticateUser = require('../../authMiddleware.js');
const router = express.Router();

// Protected inventory analysis endpoint
router.get('/inventory/analysis', authenticateUser, getInventoryAnalysis);

module.exports = router;
