const express = require("express");
const { create, getKot, getAllKot,getLatestKot, updateKot, deleteKot, getKotByTableNumber, deleteSingleKot } = require("../../Controller/Home/KotController.js");
const authenticateUser = require("../../authMiddleware.js");
const router = express.Router();

router.post("/home/kot",authenticateUser, create);
router.get("/home/getallkot",authenticateUser, getAllKot);
router.get("/home/kot/:id",authenticateUser, getKot);
router.get("/home/getLatestKot",authenticateUser, getLatestKot);
router.get("/home/getKotByTableNumber/:tableNumber",authenticateUser, getKotByTableNumber);
router.put("/home/updateKot",authenticateUser, updateKot);
router.delete("/home/deleteKot",authenticateUser, deleteKot);
router.delete("/home/deleteSingleKot",authenticateUser, deleteSingleKot);

module.exports = router;
