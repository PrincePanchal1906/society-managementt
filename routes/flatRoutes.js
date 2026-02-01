const { Router } = require("express");
const { flatadd, renderAddFlatPage, flatsManagement, deleteFlat, updateFlat, updateFlatPage
} = require("../controllers/flat");

const router = Router();
const { checkForAuthenticationCookie } = require("../middlewares/authentication")

router.get("/addflat", checkForAuthenticationCookie("token"), renderAddFlatPage)
router.post("/addflat", checkForAuthenticationCookie("token"), flatadd);
router.get("/flatsManagement", flatsManagement);
router.get("/update/:id", updateFlatPage);
router.post("/update/:id", updateFlat)
router.post("/delete/:id", deleteFlat);



module.exports = router;