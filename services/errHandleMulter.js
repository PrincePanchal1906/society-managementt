const multer = require("multer");
const Member = require("../models/member");
const Block = require("../models/block");
const { deleteFileSafe } = require("./deleteFileSafe");

async function errHandleMulter(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        if (req.file) {
            await deleteFileSafe(req.file.path)
        }
        if (req.files) {
            const allFiles = Array.isArray(req.files) ? req.files
                : Object.values(req.files).flat();

            for (const file of allFiles) {
                await deleteFileSafe(file.path)
            }
        }
        const member = await Member.findById(req.params.id);
        const members = await Member.find({});
        const blocks = await Block.find({});

        return res.render("member/updateMember", {
            error: err.message,
            oldData: req.body,
            member,
            members,
            blocks,
            flats: [],
            blockName: req.body.blockName
        });
    }

    return next(err);
}

module.exports = { errHandleMulter };
