const express = require("express");
const authenticateUser = require("../../authMiddleware.js");
const { create, list, getById, update, remove } = require("../../Controller/Dashboard/customerController.js");

const router = express.Router();

router.post("/customers", authenticateUser, create);
router.get("/customers", authenticateUser, list);
router.get("/customers/:id", authenticateUser, getById);
router.put("/customers/:id", authenticateUser, update);
router.delete("/customers/:id", authenticateUser, remove);

module.exports = router;
