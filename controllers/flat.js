const Flat = require("../models/flat");
const Block = require("../models/block");
const joiFlatSchema = require("../joiValidation/joiFlatSchema")
async function renderAddFlatPage(req, res) {
    const blocks = await Block.find({
        $expr: { $lt: ["$currentFlats", "$numberOfFlats"] }
    });
    return res.render("flat/addFlat", {
        blocks
    })
}

async function flatadd(req, res) {
    const { blockName, flatNo, flatSize, sizeUnit, numberOfBedroom, numberOfHall, numberOfKitchen, specialization } = req.body;
    const block = await Block.findOne({ blockName });
    const blocks = await Block.find({});

    const { error } = joiFlatSchema.validate(req.body);
    if (error) {
        return res.render("flat/addFlat", {
            error: error.details[0].message,
            oldData: req.body, blocks
        })
    }

    if (!block) {
        return res.render("flat/addFlat", {
            error: `block not found`,
            blocks,
            oldData: req.body
        })
    }
    const alreadyFlat = await Flat.findOne({ blockName, flatNo });
    if (alreadyFlat) {
        return res.render("flat/addFlat", {
            error: `flat no ${blockName}- ${flatNo} is already assigned`,
            blocks,
            oldData: req.body

        })
    }
    const updateBlock = await Block.findOneAndUpdate(
        { blockName, currentFlats: { $lt: block.numberOfFlats } },
        { $inc: { currentFlats: +1 } },
        { new: true }
    );
    if (!updateBlock) {
        return res.render("flat/addFlat", {
            error: `Block ${blockName} is Full`,
            oldData: req.body,
            blocks
        });
    }
    await Flat.create({
        blockName,
        flatNo,
        flatSize,
        sizeUnit,
        numberOfBedroom,
        numberOfHall,
        numberOfKitchen,
        specialization,
        createdBy: req.user._id,

    });

    return res.redirect("/flat/flatsManagement");
}

async function flatsManagement(req, res) {
    const allFlats = await Flat.find({}).populate("createdBy").sort({ blockName: 1, flatNo: 1 });
    const blocks = await Block.find({});
    return res.render("flat/flatsManagement", {
        flats: allFlats,
        blocks
    })
}
async function updateFlatPage(req, res) {
    const flat = await Flat.findById(req.params.id);
    const blocks = await Block.find({});
    return res.render("flat/updateFlat", {
        flat, blocks,
        oldData: req.body,
    })
}
async function updateFlat(req, res) {
    const { blockName, flatNo, flatSize, sizeUnit, numberOfBedroom, numberOfHall, numberOfKitchen, specialization } = req.body;
    const flat = await Flat.findById(req.params.id);
    const blocks = await Block.find({});
    const { error } = joiFlatSchema.validate(req.body)
    if (error) {
        return res.render("flat/updateFlat", {
            error: error.details[0].message,
            oldData: req.body,
            flat,
            blocks,
        })
    }

    if (!flat) {
        return res.redirect("/flat/flatsManagement")
    }
    const alreadyFlat = await Flat.findOne({ blockName, flatNo, _id: { $ne: req.params.id } });
    if (alreadyFlat) {
        return res.render("flat/updateFlat", {
            error: `flatNo ${blockName}-${flatNo} is already assign`,
            flat, blocks,
            oldData: req.body
        })
    }
    const isBlockchanged = flat.blockName !== blockName;
    if (isBlockchanged) {
        const updateBlocked = await Block.findOneAndUpdate(
            {
                blockName: blockName,
                $expr: { $lt: ["$currentFlats", "$numberOfFlats"] }
            },
            { $inc: { currentFlats: +1 } },
            { new: true }
        );
        if (!updateBlocked) {
            return res.render("flat/updateFlat", {
                error: `block ${blockName} is full`,
                blocks, flat,
                oldData: req.body,
            })
        }
        await Block.findOneAndUpdate({
            blockName: flat.blockName
        },
            { $inc: { currentFlats: -1 } }
        )
    }

    try {
        await Flat.findByIdAndUpdate(req.params.id, {
            blockName,
            flatNo,
            flatSize,
            sizeUnit,
            numberOfBedroom,
            numberOfHall,
            numberOfKitchen,
            specialization,
        });

        return res.redirect("/flat/flatsManagement");

    } catch (err) {
        return res.render("flat/updateFlat", {
            error: `flatno ${blockName}-${flatNo} already exists`,
            blocks,
        });

    }
}

async function deleteFlat(req, res) {
    const flat = await Flat.findById(req.params.id);
    if (!flat) {
        return res.redirect("/flat/flatsManagement");
    }
    await Block.findOneAndUpdate(
        { blockName: flat.blockName, currentFlats: { $gt: 0 } },
        { $inc: { currentFlats: -1 } }
    )

    await Flat.findByIdAndDelete(req.params.id);
    return res.redirect("/flat/flatsManagement")
}

module.exports = {
    flatadd, renderAddFlatPage, flatsManagement, deleteFlat, updateFlat, updateFlatPage
}