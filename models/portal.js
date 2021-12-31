const mongoose = require("mongoose");

const PortalSchema = new mongoose.Schema({
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
  dueDate: {
    type: Date,
  },
  filePath: {
    type: String,
  },
});

const Portal = mongoose.model("Portal", PortalSchema);

module.exports = Portal;
