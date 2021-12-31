const express = require("express");
const router = express.Router();

router.get("/:id", async (req, res) => {
    res.render('classroom', { title: req.params.id })
});

module.exports = router;
