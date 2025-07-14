const express = require("express");
const authenticateUser = require("../../authMiddleware.js");
const {addTableinDB, getAllTable,deleteTable, updateTable, deleteSection} = require("../../Controller/Home/addTableController.js");
const router = express.Router();

router.post("/home/addtable", authenticateUser,addTableinDB);
router.get("/home/gettable",authenticateUser, getAllTable);
router.delete("/home/deletetable/:id",authenticateUser, deleteTable);
router.delete("/home/deleteSection/:id",authenticateUser, deleteSection);
router.put("/home/updatetable/:id",authenticateUser, updateTable);

module.exports = router;
