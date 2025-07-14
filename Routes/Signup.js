const express = require("express");
const authenticateUser = require(".././authMiddleware.js");
const { create, login, getUserByToken } = require("../Controller/Signup.js");
const router = express.Router();

router.post("/signup/create", create);
router.post("/signup/login",login);
router.get("/signup/getUser",authenticateUser,getUserByToken);

module.exports = router;
