async function dashboardHandle(req, res) {
    return res.render("dashboard", {
        users: req.user
    })
}

module.exports = {
    dashboardHandle
}