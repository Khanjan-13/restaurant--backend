const express = require("express");
const {
  create,
  getItemById,
  getAllItems,
  update,
  deleteItem,
  updateSwitch,
} = require("../../Controller/Dashboard/menuItemController.js");
const authenticateUser = require("../../authMiddleware.js");
const router = express.Router();

router.post("/menu/item", authenticateUser, create);
router.get("/menu/itemall",authenticateUser, getAllItems);
router.get("/menu/item/:id", authenticateUser, getItemById);
router.put("/menu/itemupdate/:id", authenticateUser, update);
router.put("/menu/itemSwitchUpdate/:id", authenticateUser, updateSwitch);
router.delete("/menu/itemdelete/:id", authenticateUser, deleteItem);

module.exports = router;
