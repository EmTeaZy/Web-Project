const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { ensureAuthenticated } = require("../config/auth");

// Dashboard
router.get("/", ensureAuthenticated, (req, res) => {
  var classrooms = [];
  Classroom.find({ _id: { $in: req.user.classrooms } })
    .exec()
    .then((cs) => {
      classrooms = cs;
      console.log(classrooms);
      res.render("dashboard", {
        user: req.user,
        classrooms: classrooms
      });
    });
});

router.get("/createClassroom", ensureAuthenticated, (req, res) =>
  res.render("createClassroom")
);
router.get("/joinClassroom", ensureAuthenticated, (req, res) =>
  res.render("joinClassroom")
);

const Classroom = require("../models/Classroom");
const User = require("../models/User");

// Creating A Classroom
router.post("/createClassroom", (req, res) => {
  const { title, subject } = req.body;

  let errors = [];

  if (!title || !subject) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (errors.length > 0) {
    res.render("createClassroom", {
      errors,
      title,
      subject,
    });
  } else {
    Classroom.findOne({ title: title }).then((classroom) => {
      if (classroom) {
        errors.push({ msg: "A classroom with that name already exists" });
        res.render("createClassroom", {
          errors,
          title,
          subject,
        });
      } else {
        const newClassroom = new Classroom({
          title,
          subject,
        });

        newClassroom.admin = req.user._id;
        newClassroom.title = title;
        newClassroom.subject = subject;
        newClassroom.code = crypto.randomBytes(3).toString("hex");
        newClassroom
          .save()
          .then(() => {
            console.log("Classroom created successfully");
            Classroom.findOne({ title: title }).then((classroom) => {
              if (classroom) {
                console.log(classroom);
                console.log(req.user._id);
                User.updateOne(
                  { _id: req.user._id },
                  { $push: { classrooms: classroom._id } }
                ).then(() => {
                  console.log("User updated successfully");
                  req.flash("success_msg", "Classroom created successfully");
                  res.redirect("/users/dashboard");
                });
              }
            });
          })
          .catch((err) => console.log(err));
      }
    });
  }
});

// Joining a classroom
router.post("/joinClassroom", (req, res) => {
  const { code } = req.body;
  console.log("User: ", req.user.id);
  Classroom.findOne({ code: code })
    .then((classroom) => {
      if (classroom) {
        Classroom.updateOne(
          { code: code },
          { $push: { membersList: req.user._id } }
        ).then(() => console.log("Classroom updated successfully"));
        console.log(classroom);
        User.updateOne(
          { _id: req.user._id },
          { $push: { classrooms: classroom._id } }
        ).then(() => console.log("User updated successfully"));
      }
    })
    .catch((err) => console.log(err));

  req.flash("success_msg", "Classroom joined successfully");
  res.redirect("/users/dashboard");
});

module.exports = router;
