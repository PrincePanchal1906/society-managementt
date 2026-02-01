const Tenant = require("../models/tenant")
const { tenantValidationSchema, updateTenantValidationSchema } = require("../joiValidation/joiTenantSchema")
const fs = require("fs");
const path = require("path");
const { findByIdAndDelete } = require("../models/user");
const Block = require("../models/block");
const { memberManagement } = require("./member");
const { deleteFileSafe } = require("../services/deleteFileSafe");

async function getTenantDocument(req, res) {
    console.log("hittttttttttt");
    try {
        const { tenantId, docType } = req.query;
        if (!tenantId || !docType) {
            return res.json({ success: false, message: "tenantId and docType required" });
        }
        const tenant = await Tenant.findById(tenantId);

        if (!tenant) {
            return res.json({ success: false, message: "Tenant not found" });
        }

        const doc = tenant.documents?.find(d => d.documentType === docType);

        if (!doc) {
            return res.json({ success: false, message: "Document not found" });
        }
        return res.json({
            success: true,
            doc: {
                documentType: doc.documentType,
                filesPath: doc.filesPath || [],
            }
        })
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

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

async function addTenantPage(req, res) {
    const tenant = await Tenant.findById(req.params.id);
    return res.render("tenant/addTenant", {
        tenant,
        documentTypes: tenant?.documents?.map(doc => doc.documentType) || []
    });
}

async function addTenant(req, res) {
    const { firstName, middleName, lastName,
        firstMobileNo, secondMobileNo, email, state, pincode
    } = req.body;

    try {
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
            return res.render("tenant/addTenant", {
                error: `documents is required`,
                oldData: req.body,
            })
        }

        const finalData = { ...req.body, documents };
        const { error } = tenantValidationSchema.validate(finalData, {
            allowUnknown: true
        });

        if (error) {
            if (req.files?.length) {
                deleteUploadFiles(req.files)
            }
            return res.render("tenant/addTenant", {
                error: error.details[0].message,
                oldData: finalData
            })
        }

        await Tenant.create({
            firstName, middleName, lastName,
            firstMobileNo, secondMobileNo, email, state,
            pincode,
            documents,
        });

        return res.redirect("/tenant/tenantManagement")

    } catch (error) {
        if (req.files?.length) {
            deleteUploadFiles(req.files)
        }

        if (error.code === 11000) {
            if (error.keyPattern?.email) {
                return res.render("tenant/addTenant", {
                    oldData: req.body,
                    error: "Email already exists",
                });
            }

            if (error.keyPattern?.firstMobileNo) {
                return res.render("tenant/addTenant", {
                    oldData: req.body,
                    error: "Mobile number already exists",
                });
            }
        }

        return res.render("tenant/addTenant", {
            oldData: req.body,
            error: "Something went wrong, please try again",
        });
    }
}

async function updateTenantPage(req, res) {
    const tenant = await Tenant.findById(req.params.id);
    return res.render("tenant/updateTenant", {
        tenant
    })
}

async function updateTenant(req, res) {
    const { firstName, middleName, lastName,
        firstMobileNo, secondMobileNo, email, state, pincode
    } = req.body;

    const tenant = await Tenant.findById(req.params.id);

    try {
        const clean = (p) => (p || "").replace(/\\/g, "/").replace(/^\/+/, "").replace(/^public\//, "");
        let deleteFilesList = [];

        // Handle files from specific rows if needed (though not explicitly in updateMember.ejs logic for deleteFiles yet)
        if (req.body.documents) {
            Object.keys(req.body.documents).forEach((index) => {
                let delFiles = req.body.documents[index].deleteFiles || [];
                if (!Array.isArray(delFiles)) delFiles = [delFiles];
                deleteFilesList.push(...delFiles)
            });
        }

        // Handle global delete files (from removed rows)
        if (req.body.globalDeleteFiles) {
            let globalDels = req.body.globalDeleteFiles;
            if (!Array.isArray(globalDels)) globalDels = [globalDels];
            deleteFilesList.push(...globalDels);
        }

        deleteFilesList = [...new Set(deleteFilesList.map(clean))];

        let updateDocs = [];
        if (req.body.documents) {
            Object.keys(req.body.documents).forEach((index) => {
                const documentType = req.body.documents[index].documentType;

                let keepFiles = req.body.documents[index].existingFiles || [];
                if (!Array.isArray(keepFiles)) keepFiles = [keepFiles];

                keepFiles = keepFiles.filter(file => !deleteFilesList.includes(clean(file)));
                if (keepFiles.length > 0) {
                    updateDocs.push({
                        documentType: documentType,
                        filesPath: keepFiles
                    })
                }
            })
        }

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
                const matched = updateDocs.find(doc => doc.documentType === docType)
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
        const { error } = updateTenantValidationSchema.validate(data, {
            allowUnknown: true
        });

        if (error) {
            if (req.files?.length) {
                deleteUploadFiles(req.files)
            }
            return res.render("tenant/updateTenant", {
                error: error.details[0].message,
                oldData: req.body,
                tenant,
            })
        }

        if (deleteFilesList.length > 0) {
            deleteUploadFiles(deleteFilesList);
        }

        await Tenant.findByIdAndUpdate(req.params.id, data);
        return res.redirect("/tenant/tenantManagement");

    } catch (error) {
        console.log(error);
        if (req.files?.length) {
            deleteUploadFiles(req.files);
        }
        return res.render("tenant/updateTenant", {
            error: "Something went wrong, please try again",
            oldData: req.body,
            tenant,
        })
    }
}

async function tenantManagement(req, res) {
    const tenants = await Tenant.find({});
    return res.render("tenant/tenantManagement", {
        tenants,
    })
}

async function deleteTenant(req, res) {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
        return res.redirect("/tenant/tenantManagement")
    }

    if (tenant.documents && tenant.documents.length > 0) {
        tenant.documents.forEach(doc => {
            if (doc.filesPath && doc.filesPath.length > 0) {
                deleteUploadFiles(doc.filesPath);
            }
        });
    }

    await Tenant.findByIdAndDelete(req.params.id);
    return res.redirect("/tenant/tenantManagement")
}

async function getDocument(req, res) {
    const tenant = await Tenant.findById(req.params.id);
    // Note: getDocument might need to be adjusted to handle multiple documents/files
    // Usually it redirects or shows a gallery, but based on current member usage, it might be legacy.
    // Let's at least try to send the first file if it exists.
    if (!tenant || !tenant.documents || tenant.documents.length === 0) {
        return res.status(404).send(`document not found`)
    }
    const firstFile = tenant.documents[0].filesPath[0];
    if (!firstFile) return res.status(404).send(`document not found`);

    const filePath = path.join(process.cwd(), "public", firstFile);
    return res.sendFile(filePath);
}

module.exports = {
    addTenantPage, addTenant, tenantManagement,
    updateTenantPage, updateTenant, deleteTenant, getDocument, getTenantDocument
}
