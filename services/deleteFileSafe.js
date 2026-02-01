const fs = require("fs").promises;

async function deleteFileSafe(filePath) {
    if (!filePath) return;

    try {
        await fs.unlink(filePath);
    } catch (err) {
        // file not found હોય તો ignore
    }
}


module.exports = {
    deleteFileSafe
}
