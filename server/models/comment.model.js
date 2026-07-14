const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    roomId: {
      type: String,
      required: true,
    },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    line: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      required: true,
    },
    suggestion: {
      type: String,
      default: "",
    },
    isAI: {
      type: Boolean,
      default: false,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Comment || mongoose.model("Comment", commentSchema);
