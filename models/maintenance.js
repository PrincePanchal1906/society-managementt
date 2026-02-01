const mongoose = require("mongoose");

const maintenanceBillGenerationSchema = new mongoose.Schema({
    flatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "flat"
    },
    residentType: {
        type: String,
        enum: ["member", "tenant"]
    },
    residentId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "residentType"
    },
    residentName: {
        type: String,
    },
    month: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    pendingAmount: {
        type: Number,

    },
    status: {
        type: String,
        enum: ["Unpaid", "Paid", "Partially Paid"],
        default: "Unpaid"
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("MainBillGnrt", maintenanceBillGenerationSchema)
