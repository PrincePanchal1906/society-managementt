const mongoose = require("mongoose");
const memberSchema = require("../models/member");
const { string } = require("joi");
const memberSnapshot = new mongoose.Schema({
    name: String,
    mobileNo: String,
    email: String,

    photo: String,
    documents: [String]
}, { _id: false });


const transferMemberHistorySchema = new mongoose.Schema({

}
)

const transferMember = mongoose.model("transferMember", transferMemberSchema);

module.exports = transferMember;