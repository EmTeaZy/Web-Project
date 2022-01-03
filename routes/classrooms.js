const express = require("express");
const router = express.Router();
const multer = require("multer");
const uuid = require("uuid").v4;
const Classroom = require("../models/Classroom");
const Portal = require("../models/Portal");
const Announcement = require("../models/Announcement");
const { ensureAuthenticated } = require("../config/auth");
var path = require('path');


router.get("/:id/createPortal", ensureAuthenticated, (req, res) =>
  res.render("createPortal", { title: req.params.id })
);
router.get("/:id/createAnnouncement", ensureAuthenticated, (req, res) =>
  res.render("createAnnouncement", { title: req.params.id })
);

router.get("/:id", ensureAuthenticated, async (req, res) => {
  let isAdmin = false;

  // Checking if the user is the admin or not
  Classroom.findOne({ title: req.params.id }).then((cr) => {
    if (cr.admin.equals(req.user._id)) isAdmin = true;

    Portal.find({ _id: { $in: cr.portalsList } })
      .exec()
      .then((portals) => {
        Announcement.find({ _id: { $in: cr.announcementsList } })
          .exec()
          .then((announcements) => {
            res.render("classroom", {
              classroom: cr,
              portals: portals,
              announcements: announcements,
              admin: isAdmin,
            });
          });
      });
  });
});

let filePaths = [];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "adminUploads");
  },
  filename: (req, file, cb) => {

    const ext = path.extname(file.originalname)
    const id = uuid()
    const filePath = `${id}${ext}`;
    filePaths.push(filePath)
    req.filePaths = filePaths
    cb(null, filePath);
  },
});

const upload = multer({ storage });

router.post("/:id/createPortal", upload.array("file"), (req, res) => {
  const { header, desc, deadline, file } = req.body;

  let errors = [];

  if (!header || !desc || !deadline) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (errors.length > 0) {
    res.render("createPortal", {
      errors,
      header,
      desc,
      deadline,
      file,
      title: req.params.id,
    });
  } else {
    Classroom.findOne({ title: req.params.id })
      .exec()
      .then((cr) => {
        const newPortal = new Portal();

        newPortal.header = header;
        newPortal.description = desc;
        newPortal.parentClassroom = cr._id;
        newPortal.dueDate = Date(deadline);
        newPortal.fileNames = req.filePaths;

        newPortal.save().then(() => {
          console.log("Portal created successfully");
          Portal.findOne({ header: header }).then((portal) => {
            Classroom.updateOne(
              { title: req.params.id },
              { $push: { portalsList: portal._id } }
            ).then(() => console.log(console.log('Classroom updated successfully')));
          });
        });

        req.flash("success_msg", "Submission Portal Created Successfullly");
        res.redirect(`/users/classrooms/${req.params.id}`);
      });
  }
});

router.post("/:id/createAnnouncement", upload.array("file"), (req, res) => {
  const { header, desc } = req.body;

  let errors = [];

  if (!header || !desc) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (errors.length > 0) {
    res.render("createAnnouncement", {
      errors,
      header,
      desc,
      file,
      title: req.params.id,
    });
  } else {
    Classroom.findOne({ title: req.params.id })
      .exec()
      .then((cr) => {
        const newAnnouncement = new Announcement();

        newAnnouncement.header = header;
        newAnnouncement.description = desc;
        newAnnouncement.parentClassroom = cr._id;
        newAnnouncement.fileNames = req.filePaths;

        newAnnouncement.save().then(() => {
          console.log("Announcement created successfully");
          Announcement.findOne({ header: header }).then((announcement) => {
            Classroom.updateOne(
              { title: req.params.id },
              { $push: { announcementsList: announcement._id } }
            ).then((cr) => console.log(cr));
          });
        });

        req.flash("success_msg", "Announcement Created Successfullly");
        res.redirect(`/users/classrooms/${req.params.id}`);
      });
  }
});

module.exports = router;
