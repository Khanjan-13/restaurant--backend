// const express = require("express");
// const authenticateUser = require(".././authMiddleware.js");
// const { create, login, getUserByToken } = require("../Controller/Signup.js");
// const router = express.Router();

// router.post("/signup/create", create);
// router.post("/signup/login",login);
// router.get("/signup/getUser",authenticateUser,getUserByToken);

// module.exports = router;

const express = require("express");
const authenticateUser = require(".././authMiddleware.js");
const { create, login, getUserByToken, updateProfile, changePassword } = require("../Controller/Signup.js");
const router = express.Router();

router.post("/signup/create", create);
router.post("/signup/login", login);
router.get("/signup/getUser", authenticateUser, getUserByToken);
router.put("/signup/updateProfile", authenticateUser, updateProfile);
router.put("/signup/changePassword", authenticateUser, changePassword);

module.exports = router;