const { addVisitorSchema } = require("../joiValidation/joiVisitorSchema");
const Visitor = require("../models/visitor");

async function visitorManagement(req, res) {
    return res.render("visitor/visitorManagement")
}

async function addVisitorsPage(req, res) {
    const pendingVisitors = await Visitor.find({
        exitTime: null
    })
    return res.render("visitor/addVisitor", {
        pendingVisitors,
        error: null,
        oldData: req.body,
    })
}


async function addVisitor(req, res) {
    const { date, flatNo, relation,
        purpose, entryTime, exitTime, visitorName, exitDate } = req.body
    const { error } = addVisitorSchema.validate(req.body);
    if (error) {
        return res.render("visitor/addVisitor", {
            error: error.message,
            oldData: req.body,
            pendingVisitors: [] // Ensure this is passed if the view expects it
        })
    }
    try {
        await Visitor.create({
            date: date || Date.now(),
            visitorName,
            flatNo,
            relation,
            purpose,
            entryTime,
            exitTime: exitTime || null,
            exitDate: exitDate || null,
        })
        return res.redirect("/visitor/visitorManagement")
    } catch (err) {
        return res.render("visitor/addVisitor", {
            error: err.message,
            oldData: req.body,
            pendingVisitors: [] // Ensure this is passed if the view expects it
        })
    }
}
async function pendingVisitors(req, res) {
    const pendingVisitors = await Visitor.find({
        exitTime: null,
        exitDate: null,
    });

    return res.render("visitor/pendingVisitors", { pendingVisitors })
}
async function exitVisitors(req, res) {
    const visitorId = req.params.id;
    const visitor = await Visitor.findById(visitorId)
    const now = new Date();
    const exitTime = now.toTimeString().slice(0, 5);

    await Visitor.findByIdAndUpdate(visitorId,
        {
            exitTime: exitTime,
            exitDate: now,
        })
    return res.redirect("/visitor/visitorManagement")
}
async function visitorsHistory(req, res) {
    const allVisitors = await Visitor.find({
        exitTime: { $ne: null }
    })
    return res.render("visitor/visitorsHistory", { allVisitors })
}

module.exports = {
    addVisitorsPage, addVisitor, pendingVisitors,
    visitorManagement, pendingVisitors, exitVisitors, visitorsHistory
}