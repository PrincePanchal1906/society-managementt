const { Router } = require("express");

const router = Router();
const { renderAddMemberPage
    , addMember, memberManagement,
    renderMemberUpdate,
    memberUpdate, deleteMember, getDocumentMember,
    availableFlats, } = require("../controllers/member");

const upload = require("../middlewares/memberIdProof");

router.get("/availableFlats/:blockName", availableFlats)
router.get("/addMember", renderAddMemberPage)
router.post("/addMember", upload.any(), addMember);
router.get("/memberManagement", memberManagement)
router.get("/update/:id", renderMemberUpdate)
router.post("/update/:id", upload.any(), memberUpdate)
router.get("/delete/:id", deleteMember);
router.get("/documents/:id", getDocumentMember)


module.exports = router;
