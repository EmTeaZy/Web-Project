const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
  portalId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  fileNames: [
    {
      type: String,
    },
  ],
});

const Submission = mongoose.model("Submission", SubmissionSchema);

module.exports = Submission;
