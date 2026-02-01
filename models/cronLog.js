
const mongoose = require("mongoose");

const cronLogSchema = new mongoose.Schema({
  jobName: {
    type: String,
    required: true
  },
  stayId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FlatStay"
  },
  flatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Flat"
  },
  status: {
    type: String,
    enum: ["SUCCESS", "FAILED"],
    required: true
  },
  message: String,
  runAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("CronLog", cronLogSchema);
