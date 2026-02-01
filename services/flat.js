const Flat = require("../models/flat");
async function getAvailableFlats(blockName) {
    return Flat.find({
        blockName: blockName,
        isBooked: false,
    }).sort({ flatNo: 1 });

}
async function getUpdateAvailableFlats(blockName, currentFlatNo) {
    return Flat.find({
        $or: [
            { blockName, isBooked: false },
            { blockName, flatNo: String(currentFlatNo) }
        ]
    }).sort({ flatNo: 1 })
}
module.exports = {
    getAvailableFlats, getUpdateAvailableFlats
}