const Flat = require("../models/flat");
const maintenance = require("../models/maintenance");
const Member = require("../models/member");
const Tenant = require("../models/tenant");
const FlatStay = require("../models/flatStaySchema");
async function maintenanceController(req, res) {

    const records = await maintenance.find({})
        .populate("flatId").populate("residentId");
    console.log("records sample:", records[0]);

    const flats = await Flat.find({});
    const members = await Member.find({})
    const tenants = await Tenant.find({})
    res.render("maintenance/maintenance", {
        records, flats, members, tenants
    })
}
async function generateBillPage(req, res) {
    res.render("maintenance/generateBill")
}
async function generateMaintenanceBillforAll(req, res) {
    try {
        const { month, amount, details } = req.body;
        const total = await Flat.countDocuments();
        console.log("TOTAL FLATS:", total);

        if (!month || !amount) {
            console.log("Month/Amount missing:", req.body);
            return res.redirect("/maintenance");
        }

        const stays = await FlatStay.find({ isActive: true })
            .populate("member")
            .populate("tenant");

        console.log("STAYS:", stays);
        for (let stay of stays) {
            const exists = await maintenance.findOne({
                flatId: stay.flat,
                month,
            })
            if (exists) {
                continue;
            }

            let resName = "N/A";
            if (stay.residentType === "member" && stay.member) {
                resName = `${stay.member.firstName} ${stay.member.lastName || ""}`.trim();
            } else if (stay.residentType === "tenant" && stay.tenant) {
                resName = `${stay.tenant.firstName} ${stay.tenant.lastName || ""}`.trim();
            }

            await maintenance.create({
                flatId: stay.flat,
                residentType: stay.residentType,
                residentId: stay.resident,
                residentName: resName,
                month,
                amount,
                details,
            })
        }
        res.redirect("/");
    } catch (error) {
        console.log(error);
        res.redirect("/maintenance");
    }
}

async function payMaintenanceBillPage(req, res) {
    try {
        const record = await maintenance.findById(req.params.id)
            .populate("flatId")
            .populate("residentId");

        if (!record) return res.redirect("/maintenance");

        res.render("maintenance/payMaintenance", { record });
    } catch (error) {
        console.log(error);
        res.redirect("/maintenance");
    }
}


module.exports = {
    maintenanceController,
    generateMaintenanceBillforAll,
    generateBillPage,
    payMaintenanceBillPage,

}