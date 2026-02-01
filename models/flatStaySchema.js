const mongoose = require("mongoose");

const flatStayMasterSchema = new mongoose.Schema({
  flat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "flat",
    required: true
  },
  resident: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    refPath: "residentType"
  },
  residentType: {
    type: String,
    enum: ["member", "tenant", null],
    required: true
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "member",
    default: null
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tenant",
    default: null
  },
  stayFrom: {
    type: Date,
    default: Date.now
  },
  stayTo: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  endedBy: {
    type: String,
    enum: ["MANUAL", "CRON"],
    default: "MANUAL"
  },
  documentType: {
    type: String,
  },
  filePath: {
    type: String,
  },

}, { timestamps: true });


const FlatStay = mongoose.model("flatStay", flatStayMasterSchema);

module.exports = FlatStay;