const express = require("express");
const router = express.Router();
const Classroom = require("../models/Classroom");

router.get("/:id", async (req, res) => {
  let isAdmin = false;
  Classroom.findOne({ title: req.params.id }).then((cr) => {
    if (cr.admin.equals(req.user._id)) isAdmin = true;

    console.log(isAdmin);
    Classroom.findOne({ title: req.params.id }).then((cr) => {
      res.render("classroom", {
        classroom: cr,
        admin: isAdmin
      });
    });
  });
});

module.exports = router;
