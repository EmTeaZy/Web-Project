const mongoose = require("mongoose");

const ClassroomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  code: {
    type: String,
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
  },
  membersList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],
  portalsList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "portals",
    },
  ],
  announcementsList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "announcements",
    },
  ],
});

const Classroom = mongoose.model("Classroom", ClassroomSchema);

module.exports = Classroom;
