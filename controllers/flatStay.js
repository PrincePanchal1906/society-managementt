const Flat = require("../models/flat");
const FlatStay = require("../models/flatStaySchema");
const Member = require("../models/member")
const Tenant = require("../models/tenant")
const path = require("path");

async function flatStayPage(req, res) {
  const flats = await Flat.find({}).sort({ blockName: 1, flatNo: 1 });
  const activeStaysCount = await FlatStay.countDocuments({ isActive: true });
  const stays = await FlatStay.find({ isActive: true })
    .populate("flat")
    .populate("member")
    .populate("tenant");
  stays.sort((a, b) => {
    if (!a.flat && !b.flat) return 0;
    if (!a.flat) return 1;
    if (!b.flat) return -1;

    if (a.flat.blockName < b.flat.blockName) return -1;
    if (a.flat.blockName > b.flat.blockName) return 1;

    return a.flat.flatNo - b.flat.flatNo;
  })
  return res.render("flatStay/flatStayPage", {
    stays,
    flats,

    error: null,
    activeStaysCount
  })
}
async function addResident(req, res) {

  const { flatId } = req.query;
  if (!flatId) {
    return res.status(400).send("flatId missing in query");
  }
  const members = await Member.find({});
  const tenants = await Tenant.find({});
  const flat = await Flat.findById(flatId);

  return res.render("flatStay/selectResident", {
    members, tenants, flat
  })
}
async function selectResident(req, res) {
  const { flat, residentType, member, tenant } = req.body;

  let redirectUrl =
    `/flatStayMaster/fillResident?flatId=${flat}&residentType=${residentType}`;

  if (residentType === "member") {
    redirectUrl += `&memberId=${member}`;
  } else {
    redirectUrl += `&tenantId=${tenant}`;
  }

  return res.redirect(redirectUrl);
}

async function fillResident(req, res) {

  const { flatId, residentType, memberId, tenantId } = req.query;

  const flat = await Flat.findById(flatId);
  const resident = residentType === "member" ?
    await Member.findById(memberId) :
    await Tenant.findById(tenantId);

  const documentTypes = residentType === "tenant"
    ? resident.documents.map(doc => doc.documentType) : [];
  return res.render("flatStay/fillResident", {
    flat,
    flatId,
    residentType,
    memberId,
    tenantId, resident,
    documentTypes: documentTypes || [],
  })
}
async function finalSaveResident(req, res) {


  const { flat, residentType, member, tenant, stayFrom, stayTo } = req.body;
  const selectedDocumentType = req.body.selectedDocumentType;
  const selectedFilesPath = req.body.selectedFilesPath
    ? JSON.parse(req.body.selectedFilesPath)
    : [];
  let resident = null;
  if (residentType === "member") {
    resident = await Member.findById(member);
  }

  if (residentType === "tenant") {
    resident = await Tenant.findById(tenant);
  }

  const stayFromDate = new Date(req.body.stayFrom);

  const stayToDate = stayTo ? new Date(stayTo) : null;

  let isActive = true;
  if (stayToDate && stayToDate <= new Date()) {
    isActive = false;
  }
  if (stayToDate && stayToDate < stayFromDate) {
    return res.send("Stay To date cannot be before Stay From date");
  }
  const lastStay = await FlatStay.findOne({
    flat,
  }).sort({ stayFrom: -1 });

  if (lastStay && lastStay.stayTo && stayFromDate < lastStay.stayTo) {
    return res.render("flatStay/fillResident", {
      flat, residentType, member, tenant, resident, flatId: flat._id,
      memberId: member, tenantId: tenant,
      oldData: req.body,
      error: `StayFrom must be after last StayTo (${lastStay.stayTo.toDateString()})`
    })
  }

  const flatData = await Flat.findById(flat);

  if (residentType === "tenant") {
    if (!selectedDocumentType) {
      const docTypes = resident?.documents?.map(d => d.documentType) || [];
      return res.render("flatStay/fillResident", {
        error: "Please select document type",
        flat: flatData,
        flatId: flat,
        residentType,
        tenantId: tenant,
        resident: await Tenant.findById(tenant),
        documentTypes: docTypes
      });
    }
    if (!selectedFilesPath.length) {
      return res.render("flatStay/fillResident", {
        error: `document is required`,
        oldData: req.body,
        flat: flatData,
        flatId: flat,
        residentType,
        memberId: member,
        tenantId: tenant,
        resident: await Tenant.findById(tenant)

      })
    }
  }
  let documentTypes = [];

  if (residentType === "tenant") {
    const tenantData = await Tenant.findById(tenant);
    documentTypes = tenantData?.documents?.map(d => d.documentType) || [];
  }

  try {


    await FlatStay.create({
      flat, resident, residentType,
      member: residentType === "member" ? member : null,
      tenant: residentType === "tenant" ? tenant : null,
      stayFrom,
      stayTo, isActive,
      documentType: residentType === "tenant" ? selectedDocumentType : null,
      filePath: residentType === "tenant" ? (selectedFilesPath[0] || null) : null,
      endedBy: isActive ? null : "MANUAL",
    });

    return res.redirect("/flatStayMaster/flatStay")

  } catch (error) {
    return res.render("flatStay/fillResident", {
      oldData: req.body,
      flat,
      flat: flatData,
      flatId: flat,
      residentType,
      memberId: member,
      tenantId: tenant,
      resident: await Tenant.findById(tenant),

      error: error.message || `something wrong`
    })

  }


}
async function updateFlatStay(req, res) {
  try {
    const stay = await FlatStay.findById(req.params.id)
      .populate("flat")
      .populate("member")
      .populate("tenant");

    if (!stay) return res.redirect("/flatStayMaster/flatStay");

    return res.render("flatStay/updateFlatStay", { stay });
  } catch (err) {
    console.error(err);
    return res.redirect("/flatStayMaster/flatStay");
  }
}

async function saveUpdateStay(req, res) {
  try {
    const { stayFrom, stayTo, documentType } = req.body;
    const stayId = req.params.id;

    const updateData = {
      stayFrom: new Date(stayFrom),
      stayTo: stayTo ? new Date(stayTo) : null,
    }

    // Handle Document Update for Tenant
    if (documentType) {
      updateData.documentType = documentType;
    }

    if (req.file) {
      updateData.filePath = `/uploads/stay_documents/${req.file.filename}`;
    }

    await FlatStay.findByIdAndUpdate(stayId, updateData);

    return res.redirect("/flatStayMaster/flatStay");
  } catch (err) {
    console.error("Error updating stay:", err);
    return res.redirect("/flatStayMaster/flatStay");
  }
}

async function moveOut(req, res) {

  const flatStay = await FlatStay.findById(req.params.id).populate("flat")

  return res.render("flatStay/move-out", {
    flatStay,
  });
}
async function endStay(req, res) {

  try {
    const { flatId } = req.params;
    const { stayTo } = req.body;
    if (!stayTo) {
      const flats = await Flat.find({});
      const stays = await FlatStay.find({ isActive: true }).populate("flat").populate("member").populate("tenant");
      return res.render("flatStay/flatStayPage", {
        error: "Move out date is required",
        flats, stays
      });
    }
    const flatStay = await FlatStay.findById(flatId);
    if (!flatStay) {
      return res.send("Stay not found");
    }
    if (!flatStay.isActive) {
      return res.send("Stay already ended");
    }
    const today = new Date();
    const moveOutDate = new Date(stayTo);
    const stayFromDate = new Date(flatStay.stayFrom);

    flatStay.stayTo = moveOutDate;
    if (stayFromDate > moveOutDate) {
      return res.render("flatStay/move-out", {
        error: `StayTo date must be after StayFrom date.`,
        flatStay
      })
    }
    if (moveOutDate < today) {
      flatStay.isActive = false;
      flatStay.endedBy = "MANUAL";
    }
    await flatStay.save();

    if (!flatStay.isActive) {
      const flatId = flatStay.flat._id || flatStay.flat;
      await Flat.findByIdAndUpdate(flatId, {
        residentType: null,
      });
    }
    return res.redirect("/flatStayMaster/flatStay");
  }
  catch (error) {
    const flats = await Flat.find({}).sort({ blockName: 1, flatNo: 1 });
    const stays = await FlatStay.find({ isActive: true }).populate("flat").populate("member").populate("tenant");
    return res.render("flatStay/flatStayPage", {
      error: error.message, flats, stays
    });
  }
}

async function stayFlatHistory(req, res) {
  const { flatId } = req.params;
  const stays = await FlatStay.find({
    flat: flatId,
    isActive: false
  })
    .sort({ stayFrom: 1 })
    .populate("member")
    .populate("tenant");

  res.render("flatStay/flatStayHistory", {
    stays
  });
}

async function getDocument(req, res) {
  const { id } = req.params;
  const stay = await FlatStay.findById(id)
  if (!stay) {
    return res.send("Stay not found")
  }
  const filePath = path.join(
    process.cwd(),
    "public",
    stay.filePath
  )
  return res.sendFile(filePath)
}

module.exports = {
  flatStayPage, addResident, finalSaveResident, fillResident, selectResident, moveOut, endStay
  , stayFlatHistory, updateFlatStay, saveUpdateStay, getDocument
}
