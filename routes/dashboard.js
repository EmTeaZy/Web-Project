const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { ensureAuthenticated } = require("../config/auth");

const Classroom = require("../models/Classroom");
const User = require("../models/User");

// Dashboard
router.get("/", ensureAuthenticated, (req, res) => {
  Classroom.find({ _id: { $in: req.user.classrooms } })
    .exec()
    .then((cs) => {
      cs.reverse();
      res.render("dashboard", {
        user: req.user,
        classrooms: cs,
      });
    });
});

// Routing
router.get("/createClassroom", ensureAuthenticated, (req, res) =>
  res.render("createClassroom")
);
router.get("/joinClassroom", ensureAuthenticated, (req, res) =>
  res.render("joinClassroom")
);

// Creating A Classroom
router.post("/createClassroom", ensureAuthenticated, (req, res) => {
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

// Function that checks for the id in the users classrooms
function findId(classrooms, id) {
  return new Promise((resolve, reject) => {
    for (i = 0; i < classrooms.length; i++) {
      if (id.equals(classrooms[i]._id)) {
        resolve(true);
        break;
      }
    }
    reject();
  });
}

// Joining a classroom
router.post("/joinClassroom", ensureAuthenticated, (req, res) => {
  const { code } = req.body;

  let errors = [];

  if (!code) {
    errors.push({ msg: "Please enter all fields" });
  }
  if (errors.length > 0) {
    res.render("joinClassroom", {
      errors,
      code: code,
    });
  } else {
    // Finding the classroom based on the code provided by the user
    Classroom.findOne({ code: code }).then((classroom) => {
      if (classroom) {
        User.findOne({ _id: req.user._id }).then((theUser) => {
          // Checking to see if the user has already joined the classroom
          findId(theUser.classrooms, classroom._id)
            .then((joined) => {
              if (joined) {
                req.flash("error_msg", "Classroom is already joined");
                res.render("joinClassroom", { code: code });
              }
            })
            .catch(() => {
              // Updating the classroom to have the user registered as a member in the database
              Classroom.updateOne(
                { code: code },
                { $push: { membersList: req.user._id } }
              ).then(() => console.log("Classroom updated successfully"));
              // Updating the user to have the classroom in the database
              User.updateOne(
                { _id: req.user._id },
                { $push: { classrooms: classroom._id } }
              ).then(() => {
                console.log("User updated successfully");
                req.flash("success_msg", "Classroom joined successfully");
                res.redirect("/users/dashboard");
              });
            });
        });
      } else {
        // If no classroom was found, we send the user back to the join page
        req.flash("error_msg", "No classroom with that code was found");
        res.render("joinClassroom", { code: code });
      }
    });
  }
});

module.exports = router;
