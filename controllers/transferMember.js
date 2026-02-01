const Member = require("../models/member");
const Flat = require("../models/flat");
async function renderTransferMember(req, res) {
    try {
        const memberId = req.params.id;
        const oldMember = await Member.findById(memberId);
        if (!oldMember || oldMember.status !== "ACTIVE") {
            return res.redirect("/memberManagement")
        }
        res.render("member/transferMember", { oldMember });
    } catch (error) {
        console.log(error);
        return res.redirect("/memberManagement")
    }
}

async function transferMember(req, res) {
    try {
        const member = await Member.findById(req.params.id);
        if (!member || member.status !== "ACTIVE") {
            return res.redirect("/memberManagement")
        }
        const { transferDate, transferReason, } = req.body
        if (!transferDate) {
            return res.render("member/transferMember", {
                oldMember: member,
                error: "Please select transfer date"
            });
        }

        const sellDate = new Date(req.body.transferDate);
        const buyDate = new Date(member.purchaseDate);
        if (sellDate < buyDate) {
            return res.render("member/transferMember",
                {
                    oldMember: member,
                    error: "Transfer date cannot be before purchase date"
                })
        }
        member.transferDate = sellDate;
        member.transferReason = req.body.transferReason;
        member.status = "TRANSFER";

        await member.save();
        await Flat.findOneAndUpdate({
            flatNo: member.flatNo,
            blockName: member.blockName
        }, {
            isBooked: false
        })
        return res.redirect("/member/addMember")
    } catch (error) {
        console.log(error);
        return res.redirect("/memberManagement");
    }
}
async function renderTransferMemberHistory(req, res) {
    const member = await Member.findById(req.params.id);
    const members = await Member.find({
        blockName: member.blockName,
        flatNo: member.flatNo,
        status: "TRANSFER"
    })
    return res.render("member/memberHistory", {
        members,
        blockName: req.params.blockName,
    })
}
module.exports = {
    transferMember, renderTransferMember, renderTransferMemberHistory
}