const Member = require("../models/member");
const Tenant = require("../models/tenant");

async function renderDocumentPage(req, res) {
    try {
        const { type, id } = req.params;
        let data;

        if (type === "member") {
            data = await Member.findById(id);
        } else if (type === "tenant") {
            data = await Tenant.findById(id);
        } else {
            return res.status(400).send("Invalid type");
        }

        if (!data) {
            return res.status(404).send(`${type} not found`);
        }

        return res.render("documentViewer/document", {
            entity: data,
            type: type,
            documents: data.documents || []
        });
    } catch (error) {
        console.error("Error rendering document page:", error);
        return res.status(500).send("Server Error");
    }
}

module.exports = {
    renderDocumentPage
};
