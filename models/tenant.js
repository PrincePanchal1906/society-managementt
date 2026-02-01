const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema({
    firstName: {
        type: String,
    },
    middleName: {
        type: String
    },
    lastName: {
        type: String
    },
    firstMobileNo: {
        type: Number,
        required: true,
        match: [/^[0-9]{10}$/, "Mobile number must be 10 digits"],
    },
    secondMobileNo: {
        type: Number,
        match: [/^[0-9]{10}$/, "Mobile number must be 10 digits"],
    },
    email: {
        type: String
    },
    state: {
        type: String
    },
    pincode: {
        type: String,
        match: [/^[1-9][0-9]{5}$/, "Invalid PIN code"]
    },
    documents: [
        {
            documentType: {
                type: String,
                enum: ["AADHAR", "PAN", "DL", "PASSPORT", "VOTER ID", "POLICE VERIFICATION", "RENTAL AGREEMENT"],
                required: true
            },
            filesPath: [
                {
                    type: String,
                    required: true
                }
            ]
        }
    ]

})

tenantSchema.index({ email: 1 }, { unique: true });
tenantSchema.index({ firstMobileNo: 1 }, { unique: true });

const Tenant = mongoose.model("tenant", tenantSchema);

module.exports = Tenant;
