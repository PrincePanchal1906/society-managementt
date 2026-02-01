const Block = require("../models/block");
const Flat = require("../models/flat");
const Member = require("../models/member")
const { memberValidationSchema, memberUpdateValidationSchema } = require("../joiValidation/joiMemberSchema");
const fs = require("fs");
const path = require("path");
const { getAvailableFlats, getUpdateAvailableFlats } = require("../services/flat");
const { flatadd } = require("./flat");
const { deleteFileSafe } = require("../services/deleteFileSafe");
const { object } = require("joi");
const { errHandleMulter } = require("../services/errHandleMulter");

async function deleteUploadFiles(files = []) {
    files.forEach(file => {
        let filePath;
        if (typeof file === 'string') {
            filePath = file;
        } else if (file.path) {
            filePath = file.path;
        } else {
            return;
        }

        const clean = filePath
            .replace(process.cwd(), "")
            .replace(/\\/g, "/")
            .replace(/^\/+/, "")
            .replace(/^public\//, "");

        const fullPath = path.join(process.cwd(), "public", clean);

        if (fs.existsSync(fullPath)) {
            fs.unlink(fullPath, error => {
                if (error) {
                    console.log("Error deleting file:", fullPath, error);
                }
            });
        }
    });
}

async function availableFlats(req, res) {
    const blockName = req.params.blockName;
    const flats = await getAvailableFlats(blockName);
    return res.json(flats);
}

async function renderAddMemberPage(req, res) {
    const blocks = await Block.find({});
    const selectedBlock = req.query.blockName || null;
    const flats = selectedBlock ? await getAvailableFlats(selectedBlock) : [];
    return res.render("member/addMember", {
        blocks,
        flats,
        selectedBlock,
        // members 
    })
}
async function addMember(req, res) {
    const blocks = await Block.find({});
    const selectedBlock = req.query.blockName || null;
    const flats = selectedBlock ? await getAvailableFlats(selectedBlock) : [];
    const members = await Member.find({});
    const { blockName, flatNo, firstName, middleName
        , lastName, firstMobileNo,
        secondMobileNo, email, purchaseDate } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let finalData;
    try {

        const alreadyAssignFlat = await Member.findOne({ blockName, flatNo, isBooked: true });
        if (alreadyAssignFlat) {
            if (req.files?.length) {
                deleteUploadFiles(req.files)
            }
            return res.render("member/addMember", {
                error: "flat-blockName is already exists",
                oldData: req.body,
                blocks,
                flats,
                members
            })
        }
        const newPurchaseDate = new Date(purchaseDate);
        newPurchaseDate.setHours(0, 0, 0, 0);
        const memberHistory = await Member.find({
            blockName,
            flatNo,
            status: "TRANSFER"
        }).sort({ transferDate: -1 });
        if (memberHistory.length > 0) {
            const lastTransferDate = new Date(memberHistory[0].transferDate);

            if (newPurchaseDate < lastTransferDate) {
                if (req.files?.length) {
                    deleteUploadFiles(req.files)
                }
                return res.render("member/addMember", {
                    error: "Purchase date cannot be before last transfer date",
                    oldData: req.body,
                    blocks,
                    flats,
                    members
                });
            }
        }
        if (newPurchaseDate > today) {
            if (req.files?.length) {
                deleteUploadFiles(req.files)
            }
            return res.render("member/addMember", {
                error: "Purchase date cannot be a future date",
                oldData: req.body,
                blocks,
                flats,
                members
            });
        }


        let documents = [];
        if (req.body.documents) {
            Object.keys(req.body.documents).forEach(index => {
                const documentType = req.body.documents[index].documentType
                const relatedFiles = req.files.filter(
                    file => file.fieldname === `documents[${index}][files]`
                );
                if (relatedFiles.length > 0) {
                    documents.push({
                        documentType,
                        filesPath: relatedFiles.map(file => {
                            return file.path.split("public")[1].replace(/\\/g, "/");
                        }
                        )
                    })
                }
            })
        }

        if (documents.length === 0) {
            if (req.files?.length) {
                deleteUploadFiles(req.files)
            }
            return res.render("member/addMember", {

                error: `documents is required`,
                oldData: req.body,
                blocks,
                flats,
            })
        }

        finalData = { ...req.body, documents };
        const { error } = memberValidationSchema.validate(finalData, {
            allowUnknown: true
        });
        if (error) {
            if (req.files?.length) {
                deleteUploadFiles(req.files)
            }
            return res.render("member/addMember", {
                error: error.details[0].message,
                oldData: finalData,
                blocks,
                flats,
                members
            })
        }


        await Member.create({
            blockName,
            flatNo,
            firstName,
            middleName,
            lastName,
            firstMobileNo,
            secondMobileNo,
            email,
            purchaseDate, documents
        })
        await Flat.findOneAndUpdate({ blockName, flatNo }, { isBooked: true })
        return res.redirect("/member/memberManagement");
    } catch (error) {
        if (error.code === 11000) {
            if (req.files?.length) {
                deleteUploadFiles(req.files)
            }
            if (error.keyValue?.email) {
                return res.render("member/addMember", {
                    error: "email is already exists",
                    oldData: finalData,
                    blocks,
                    flats,
                })
            }
            if (error.keyValue?.firstMobileNo) {
                return res.render("member/addMember", {
                    error: "firstMobileNo is already exists",
                    oldData: finalData,
                    blocks,
                    flats,
                })
            }
        }
    }
    return res.render("member/addMember", {
        error: "Something went wrong. Please try again.",
        oldData: req.body,
        blocks,
        flats,
        members
    });
}
async function renderMemberUpdate(req, res) {

    const members = await Member.find({});
    const member = await Member.findById(req.params.id);
    const blocks = await Block.find({});
    const blockName = member.blockName;
    const flats = blockName ? await getUpdateAvailableFlats(blockName, member.flatNo) : [];
    const filePath =
        member.documents?.[0]?.filesPath?.[0] || null;
    return res.render("member/updateMember", {
        members, member, blocks, flats, blockName, filePath
    })
}

async function memberUpdate(req, res) {

    const { blockName, flatNo, firstName, middleName
        , lastName, firstMobileNo,
        secondMobileNo, email, purchaseDate } = req.body;

    const members = await Member.find({});
    const member = await Member.findById(req.params.id);
    const blocks = await Block.find({});
    const flats = blockName ? await getUpdateAvailableFlats(blockName, member.flatNo) : [];

    if (flatNo !== member.flatNo) {
        const alreadyExist = await Member.findOne({ blockName, flatNo, _id: { $ne: req.params.id } });
        if (alreadyExist) {
            return res.render("member/updateMember", {
                error: "flat-blockName is already exists",
                oldData: req.body,
                members, member, blocks, flats, blockName
            })
        }
    }

    if (blockName !== member.blockName) {
        const blockCheck = await Block.findOne({
            blockName,
            $expr: { $lt: ["$currentFlats", "$numberOfFlats"] }
        });
        if (!blockCheck) {
            return res.render("member/updateMember", {
                error: "selected block is full",
                oldData: req.body,
                members, member, blocks, flats: [], blockName
            })
        }
    }
    try {
        const clean = (p) => (p || "").replace(/\\/g, "/").replace(/^\/+/, "").replace(/^public\//, "");
        let deleteFilesList = [];

        // Handle files from specific rows
        Object.keys(req.body.documents || {}).forEach((index) => {
            let delFiles = req.body.documents[index].deleteFiles || [];
            if (!Array.isArray(delFiles))
                delFiles = [delFiles];
            deleteFilesList.push(...delFiles)
        });

        // Handle global delete files (from removed rows)
        if (req.body.globalDeleteFiles) {
            let globalDels = req.body.globalDeleteFiles;
            if (!Array.isArray(globalDels)) globalDels = [globalDels];
            deleteFilesList.push(...globalDels);
        }

        deleteFilesList = [...new Set(deleteFilesList.map(clean))];



        let updateDocs = [];
        Object.keys(req.body.documents || {}).forEach((index) => {
            const documentType = req.body.documents[index].documentType;

            let keepFiles = req.body.documents[index].existingFiles || [];
            if (!Array.isArray(keepFiles))
                keepFiles = [keepFiles];

            keepFiles = keepFiles.filter(file => !deleteFilesList.includes(clean(file)));
            if (keepFiles.length > 0) {
                updateDocs.push({
                    documentType: documentType,
                    filesPath: keepFiles
                })
            }

        })
        if (req.files && req.files.length > 0) {
            Object.keys(req.body.documents || {}).forEach((index) => {
                const docType = req.body.documents[index].documentType;
                const relatedFiles = req.files.filter(file =>
                    file.fieldname === `documents[${index}][files]`
                );
                if (relatedFiles.length === 0) return;

                const newPaths = relatedFiles.map(file =>
                    file.path.split("public")[1].replace(/\\/g, "/")
                );
                const matched = updateDocs.find(doc => doc.documentType ===
                    docType
                )
                if (matched) {
                    matched.filesPath.push(...newPaths)
                } else {
                    updateDocs.push({
                        documentType: docType,
                        filesPath: newPaths
                    })
                }
            })
        }
        const data = { ...req.body, documents: updateDocs };


        const { error } = memberUpdateValidationSchema.validate(data, {
            allowUnknown: true
        });
        if (error) {
            if (req.files?.length) {
                deleteUploadFiles(req.files)
            }
            return res.render("member/updateMember", {
                error: error.details[0].message,
                oldData: req.body,
                members, member, blocks, flats, blockName
            })
        }
        if (blockName !== member.blockName || flatNo !== member.flatNo) {
            await Block.findOneAndUpdate({ blockName: member.blockName },
                { $inc: { currentFlats: -1 } }
            )
            await Block.findOneAndUpdate({ blockName: blockName },
                { $inc: { currentFlats: +1 } }
            )
            await Flat.findOneAndUpdate(
                {
                    blockName: member.blockName,
                    flatNo: member.flatNo,
                },
                { isBooked: false }
            )
            await Flat.findOneAndUpdate(
                { blockName, flatNo },
                { isBooked: true }
            )
        }
        if (deleteFilesList.length > 0) {
            deleteUploadFiles(deleteFilesList);
        }

        const updateData = { ...req.body, documents: updateDocs };
        await Member.findByIdAndUpdate(req.params.id, updateData);
        console.log("deleteFilesList:", deleteFilesList);
        console.log("existingFiles:", req.body.documents?.[0]?.existingFiles);
        console.log("deleteFiles from body:", req.body.documents?.[0]?.deleteFiles);

        return res.redirect("/member/memberManagement");


    } catch (error) {
        console.log(error);
        if (req.files?.length) {
            deleteUploadFiles(req.files);
        }
        return res.send(`something is wrong`)
    }

}
async function getDocumentMember(req, res) {
    const { id } = req.params;
    const member = await Member.findById(id);
    if (!member || !member.idProof) {
        return res.status(404).send("document not found")
    }
    const filePath = path.join(
        process.cwd(),
        "public",
        member.filePath
    );
    return res.sendFile(filePath);

}
async function memberManagement(req, res) {
    const blocks = await Block.find({});
    const flats = await Flat.find({});
    const members = await Member.find({ status: "ACTIVE" });
    return res.render("member/memberManagement", {
        members,
        blocks,
        flats
    })
}

async function deleteMember(req, res) {
    const member = await Member.findById(req.params.id);

    if (!member) {
        return res.redirect("/member/memberManagement");
    }

    // ✅ CORRECT CHECK
    if (member.filePath) {
        const cleanPath = member.filePath.replace(/\\/g, "/");
        const fullPath = path.join(process.cwd(), "public", cleanPath);

        if (fs.existsSync(fullPath)) {
            fs.unlink(fullPath);

        } else {
            console.log("File not found on disk");
        }
    } else {
        console.log("No filePath in DB, skipping file delete");
    }
    await Flat.findOneAndUpdate({
        blockName: member.blockName,
        flatNo: member.flatNo,

    }, {
        isBooked: false,
        owner: null,
    }

    )
    await Block.findOneAndUpdate(
        { blockName: member.blockName },
        { $inc: { $currentFlats: -1 } }
    )

    await Member.findByIdAndDelete(req.params.id);
    return res.redirect("/member/memberManagement");
}


module.exports = {
    renderAddMemberPage, addMember, memberManagement, renderMemberUpdate,
    memberUpdate, deleteMember, availableFlats, getDocumentMember, deleteFileSafe,

}
