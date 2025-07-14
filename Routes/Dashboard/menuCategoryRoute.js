const express = require("express");
const {
  create,
  getCategory,
  deleteCategory,
  update,
  getCategoryByID,
} = require("../../Controller/Dashboard/menuCategoryController.js");
const authenticateUser = require("../../authMiddleware.js");
const router = express.Router();

router.post("/menu/category",authenticateUser, create);
router.get("/menu/category",authenticateUser, getCategory);
router.get("/menu/category/:id",authenticateUser, getCategoryByID);
router.delete("/menu/category/:id",authenticateUser, deleteCategory);
router.put("/menu/category/:id",authenticateUser, update);

module.exports = router;