const express = require("express");
const { create, getAllOrders, getOrderById } = require("../../Controller/Dashboard/orderController.js");
const authenticateUser = require("../../authMiddleware.js");
const router = express.Router();

router.post("/orderSave",authenticateUser, create);
router.get("/orderFetch",authenticateUser, getAllOrders);
router.get("/orderFetchById/:id",authenticateUser, getOrderById);

module.exports = router;
