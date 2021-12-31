const express = require("express");
const router = express.Router();
const { forwardAuthenticated } = require("../config/auth");

// Welcome Page
router.get("/", forwardAuthenticated, (req, res) => res.render("welcome"));

module.exports = router;
