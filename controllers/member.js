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
const {errHandleMulter} = require("../services/errHandleMulter")
async function deleteUploadFiles(files = []) {
    
    files.forEach(file => {
        if(!file.path) return ;
        const clean = file.path
        .replace(process.cwd(), "")
        .replace(/\\/g, "/")
        .replace(/^\/+/, "");

        const fullPath =  path.join(process.cwd(),clean);

        fs.unlink(fullPath, err => {
            if (err) {
                console.log(err)
            }
        })
    })
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
    try {

    const alreadyAssignFlat = await Member.findOne({ blockName, flatNo });
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
                    filesPath: relatedFiles.map(file =>{
                        return file.path.split("public")[1].replace(/\\/g,"/");
                    }
                    )
                })
            }
        })
    }

    if (documents.length === 0) {
        if (req.files?.lenght) {
            deleteUploadFiles(req.files)
        }
        return res.render("member/addMember", {
            
            error: `documents is required`,
            oldData: req.body,
            blocks,
            flats,
        })
    }
    const finalData = { ...req.body, documents };
    const { error } = memberValidationSchema.validate(finalData,{
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
            if (req.files?.lenght) {
                deleteUploadFiles(req.files)
            }
            if (error.keyvalue?.email) {
                return res.render("member/addMember", {
                    error: "email is already exists",
                    oldData: finalData,
                    blocks,
                    flats,
                })
            }
            if (error.keyvalue?.firstMobileNo) {
                return res.render("member/addMember", {
                    error: "firstMobileNo is already exists",
                    oldData: finalData,
                    blocks,
                    flats,
                })
            }
        }
    }
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
        members, member, blocks, flats, blockName,filePath
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
        const alreadyExist = await Member.findOne({ blockName, flatNo ,_id:{$ne:req.params.id}});
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

        let oldList = member.documents.Map(oldL=>({
            documentType:oldL.documentType,
            filePath:[oldL.filesPath]
        }))
        const normalize =(p) => (p || "").replace(/\\/g, "/").replace(/^\/+/, "");
        const formDocs = req.body.documents || [];

        const newList = formDocs.map((fd)=>{
            const files = fd.existingFiles || []
        })

        oldDocuments.forEach((oldDoc)=>{
            const matched = formDocs.find((fd)=>{
                fd.documentType === oldDoc.documentType
            })
            let keepFiles = matched?.filesPath ||[];
            if(!Array.isArray(keepFiles)) keepFiles= [keepFiles];
            keepFiles = keepFiles.map(normalize);
            oldDoc.filesPath = oldDoc.filesPath.filter((oldPath)=>{
                const cleanOld = normalize(oldPath);
                if(!keepFiles.include(cleanOld)){

                }
            })
        
        })


        // documents = documents.filter(doc => doc.filesPath.length > 0);

        if (req.files && req.files.length > 0 && req.body.documents) {
            Object.keys(req.body.documents).forEach(index => {
                const documentType = req.body.documents[index].documentType;
                const relatedFiles = req.files.filter(
                    file => file.fieldname === `documents[${index}][files]`
                );
                if(relatedFiles.length === 0) return;
                const newPaths = relatedFiles.map(file => 
                    `/memberIdProof/${file.filename}`
                );
                const existingDoc = oldDocuments.find(oldDoc =>oldDoc.documentType === documentType);
                if(existingDoc){
                    existingDoc.filesPath.push(...newPaths)
                }else {
                    oldDocuments.push({
                        documentType,
                        filesPath:newPaths
                    })
                }
            })
        }


        const data = { ...req.body ,documents:oldDocuments};
    errHandleMulter

    const { error } = memberUpdateValidationSchema.validate(data,{
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
           if(blockName !== member.blockName || flatNo !== member.flatNo){
            await Block.findOneAndUpdate({blockName:member.blockName},
                {$inc: {currentFlats:-1}}
            )
            await Block.findOneAndUpdate({blockName:blockName},
                {$inc: {currentFlats:+1}}
            )
            await Flat.findOneAndUpdate(
                {
                    blockName:member.blockName,
                    flatNo:member.flatNo,
                },
                {isBooked:false}
            )
            await Flat.findOneAndUpdate(
                {blockName,flatNo},
                {isBooked:true}
            )
           }
        
        const updateData = {...req.body,documents};
        await Member.findByIdAndUpdate(req.params.id, updateData);
        return res.redirect("/member/memberManagement")
 
    }catch (error) {
        console.log(error);
        if (req.files?.length) {
        deleteUploadFiles(req.files);
    }
        return res.send(`somwthing is wrong`)
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
    const members = await Member.find({});
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
    memberUpdate, deleteMember, availableFlats, getDocumentMember, deleteFileSafe
}
