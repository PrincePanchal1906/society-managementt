const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const firstName = req.body.firstName || "newTenant";
        const lastName = req.body.lastName || "";
        const folderName = `${firstName}_${lastName}`.replace(/[^a-zA-Z0-9]/g, "");

        const folderPath = path.join(
            process.cwd(),
            "public",
            "tenantIdProof",
            folderName
        )
        await fs.promises.mkdir(folderPath, { recursive: true })
        cb(null, folderPath)
    },
    filename: function (req, file, cb) {
        const match = file.fieldname.match(/documents\[(\d+)\]/);
        const index = match ? match[1] : "X";
        const documentType = req.body?.documents?.[index]?.documentType || "doc";
        const firstName = req.body.firstName || "newTenant";
        const lastName = req.body.lastName || "";
        const fileName = `${firstName}_${lastName}`.replace(/[^a-zA-Z0-9]/g, "");
        const ext = path.extname(file.originalname);
        const uniqueName = `${documentType}_${fileName}_${Date.now()}${ext}`;
        cb(null, uniqueName)
    }
});

function fileFilter(req, file, cb) {
    const allowTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowTypes.includes(file.mimetype)) {
        cb(new Error("Only JPG, JPEG, PNG files are allowed"), false);
    } else {
        cb(null, true);
    }
}

const idProof = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });

module.exports = idProof;