const mongoose = require("mongoose");

const flatSchema = new mongoose.Schema({
    blockName: {
        type: String
    },
    flatNo: {
        type: String,
        required: true,
        max: [99999, "Number of flats cannot be more than 5 digits"],
        min: [1, "Number of flats must be at least 1"]
    },
    numberOfBedroom: {
        type: String,
        required: true
    },
    numberOfHall: {
        type: String,
        required: true
    },
    numberOfKitchen: {
        type: String,
        required: true
    },
    specialization: {
        type: String,
    },
    isAssigned: {
        type: Boolean,
        default: false,
    },
    isBooked: {
        type: Boolean,
        default: false
    },
    flatSize: {
        type: String,
    },
    sizeUnit: {
        type: String,
        enum: ["SQYD", "SQFT", "SQM"],
        required: true,
    },
    residentType: {
        type: String,
        enum: ["member", "tenant"],
        default: null   // ✅ NOT "Tenant"
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "residentType",
        default: null,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    currentFlatNo: {
        type: String,
    }

})
flatSchema.pre("save", function (next) {
    if (!this.currentFlatNo) {
        this.currentFlatNo = this.flatNo;
    }
});
const Flat = mongoose.model("flat", flatSchema);

module.exports = Flat;