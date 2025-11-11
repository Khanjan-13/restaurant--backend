const express = require("express");
const router = express.Router();
const authenticateUser = require("../../authMiddleware.js");
const customerController = require("../../Controller/CRM/customerController");
// CRUD Routes for Customers
router.post("/", authenticateUser, customerController.createCustomer);
router.get("/", authenticateUser, customerController.getCustomers);
router.get("/:id", authenticateUser, customerController.getCustomerById);
router.put("/:id", authenticateUser, customerController.updateCustomer);
router.delete("/:id", authenticateUser, customerController.deleteCustomer);
module.exports = router;
