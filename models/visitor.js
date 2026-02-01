const { date } = require("joi");
const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema({
    entryDate: {
        type: Date,
        default: Date.now()
    },
    visitorName: {
        type: String,
        required: true
    },
    flatNo: {
        type: String
    },
    relation: {
        type: String
    },
    purpose: {
        type: String
    },
    entryTime: {
        type: String,
        required: true,
    },
    exitTime: {
        type: String,
        default: null,
    },
    exitDate: {
        type: String,
        default: null,
    }

})

const Visitor = mongoose.model("visitor", visitorSchema);

module.exports = Visitor;