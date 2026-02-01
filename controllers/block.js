const { joiBlockSchema } = require("../joiValidation/joiBlockSchema");
const { pattern } = require("../joiValidation/joiFlatSchema");
const Block = require("../models/block");
const Flat = require("../models/flat");
const User = require("../models/user")

async function addBlockPage(req, res) {
    return res.render("block/addBlock");
}
async function addBlock(req, res) {
    const { blockName, sizeOfFlats,
        sizeUnit, numberOfBedroom, numberOfKitchen, numberOfHall, numberOfFlats } = req.body;
    if (!numberOfFlats || isNaN(numberOfFlats)) {
        return res.render("block/addBlock", {
            error: "Number of flats must be a number"
        });
    }
    if (numberOfFlats.toString().length > 5) {
        return res.render("block/addBlock", {
            error: "Number of flats cannot exceed 5 digits"
        });
    }
    const { error } = joiBlockSchema.validate(req.body);
    if (error) {
        return res.render("block/addBlock", {
            error: error.details[0].message,
            oldData: req.body,

        })
    }
    try {
        await Block.create({
            blockName,
            numberOfFlats,
            sizeOfFlats,
            sizeUnit,
            numberOfBedroom, numberOfHall, numberOfKitchen,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.render("block/addBlock", {
                oldData: req.body,
                error: `${blockName} Block is already exists`
            })
        }
    }

    return res.redirect("/block/blockManagement")
}
async function blockManagement(req, res) {
    const blocks = await Block.find({});
    const users = await User.find({});
    const flats = await Flat.find({});
    const totalBlocks = blocks.length;
    const totalFlats = flats.length;
    return res.render("block/blocksManagement", {
        blocks, users, totalBlocks, totalFlats,
    });
}
async function renderUpdateBlockPage(req, res) {
    const blocks = await Block.find({});
    const block = await Block.findById(req.params.id);
    return res.render("block/updateBlockPage", {
        blocks,
        block,
        oldData: req.body,
    });
}
async function updateBlock(req, res) {
    const { blockName, numberOfFlats, sizeOfFlats, sizeUnit,
        numberOfBedroom, numberOfHall, numberOfKitchen
    } = req.body;
    const block = await Block.findById(req.params.id);
    const { error } = joiBlockSchema.validate(req.body)
    if (error) {
        return res.render("block/updateBlockPage", {
            error: error.details[0].message,
            oldDate: req.body,
            block,
        })
    }
    let updateData = {
        blockName, numberOfFlats, sizeOfFlats, sizeUnit,
        numberOfBedroom, numberOfHall, numberOfKitchen
    };
    try {
        await Block.findByIdAndUpdate(req.params.id, updateData);
        res.redirect("/block/blockManagement")
    } catch (error) {
        if (error.code === 11000) {
            return res.render("updateBlockPage", {
                oldData: req.body,
                error: `${blockName} is already exists`,
                block,
            })
        }
    }


}

async function deleteBlock(req, res) {
    await Block.findByIdAndDelete(req.params.id);
    return res.redirect("/block/blockManagement")
}

module.exports = {
    addBlockPage, addBlock, blockManagement, renderUpdateBlockPage, updateBlock, deleteBlock
}