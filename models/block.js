const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema({
  blockName: {
    type: String,
    required: true,
  },
  numberOfFlats: {
    type: Number,
    required: true,
    max: [99999, "Number of flats cannot be more than 5 digits"],
    min: [1, "Number of flats must be at least 1"]
  },
  currentFlats: {
    type: Number,
    default: 0,
  },
  numberOfBedroom: {
    type: String,
    required: true
  },
  numberOfHall: {
    type: String,
  },
  numberOfKitchen: {
    type: String,
  },
  sizeOfFlats: {
    type: Number
  },
  sizeUnit: {
    type: String,
    enum: ["SQYD", "SQFT", "SQM"]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  }
}, { timestamps: true });
blockSchema.index({ blockName: 1 }, { unique: true });

const Block = mongoose.model("block", blockSchema);

module.exports = Block;
