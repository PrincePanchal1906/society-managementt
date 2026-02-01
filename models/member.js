const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
    blockName: {
        type: String,
        required: true,
    },
    flatNo: {
        type: Number,
        required: true,
    },
    firstName: {
        type: String
    },
    middleName: {
        type: String
    },
    lastName: {
        type: String
    },
    firstMobileNo: {
        type: String,
        required: true,
        match: [/^[0-9]{10}$/, "Mobile number must be 10 digits"],
    },
    secondMobileNo: {
        type: String,
        match: [/^[0-9]{10}$/, "Mobile number must be 10 digits"],
    },
    email: {
        type: String
    },
    purchaseDate: {
        type: Date,
        required: true,
    },
    documents: [
        {
            documentType: {
                type: String,
                enum: ["AADHAR", "PAN", "PASSPORT", "DL", "TRANSFER DOCUMENT"],
                required: true,
            },
            filesPath: [{
                type: String,
                required: true
            }]
        },
    ],
    status: {
        type: String,
        enum: ["ACTIVE", "TRANSFER"],
        default: "ACTIVE"
    },
    transferDate: {
        type: Date,
    },
    transferReason: {
        type: String,

    },
}, { timestamps: true }
)



const Member = mongoose.model("member", memberSchema);

module.exports = Member;