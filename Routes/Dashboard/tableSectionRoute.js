const express = require("express");
const {
  createTableSection,
  getAllTableSection,
  deleteTable,
  updateTableSection,
} = require("../../Controller/Dashboard/TableSectionController.js");
const authenticateUser = require("../../authMiddleware.js");

const router = express.Router();

router.post("/table/addsection",authenticateUser, createTableSection);
router.get("/table/addsection",authenticateUser, getAllTableSection);
router.delete("/table/deleteSection/:id",authenticateUser, deleteTable);
router.put("/table/updateSection/:id",authenticateUser, updateTableSection);

module.exports = router;