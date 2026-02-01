const { Router } = require("express");
const router = Router();
const { flatStayPage, addResident, finalSaveResident,
    moveOut, fillResident, selectResident, endStay, stayFlatHistory,
    updateFlatStay, saveUpdateStay, getDocument, } = require("../controllers/flatStay")
const documentForStay = require("../middlewares/documentForStay");



router.get("/flatStay", flatStayPage);
router.get("/addResident", addResident);
router.get("/fillResident", fillResident);
router.post("/selectResident", selectResident);
router.post("/finalSaveResident", documentForStay.single("documentFile"), finalSaveResident)
router.get("/move-out/:id", moveOut);
router.post("/move-out/:flatId", endStay)
router.get("/history/:flatId", stayFlatHistory);
router.get("/updateFlatStay/:id", updateFlatStay);
router.post("/saveUpdateStay/:id", documentForStay.single("documentFile"), saveUpdateStay);
router.get("/document/:id", getDocument)

module.exports = router;