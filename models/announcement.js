const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
  header: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  parentClassroom: {
    type: mongoose.Schema.Types.ObjectId,
  },
  fileNames: [
    {
      type: String,
    },
  ],
});

const Announcement = mongoose.model("Announcement", AnnouncementSchema);

module.exports = Announcement;
