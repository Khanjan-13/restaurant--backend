const express = require("express");
const { createCustomerKot } = require("../../Controller/Customer/customerKotController.js");

const router = express.Router();

// Public route - no authentication required
router.post("/customer/kot", createCustomerKot);

module.exports = router;
