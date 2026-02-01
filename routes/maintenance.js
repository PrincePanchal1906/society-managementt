const { Router } = require("express");
const { maintenanceController, generateMaintenanceBillforAll, generateBillPage, payMaintenanceBillPage, updateMaintenancePayment } = require("../controllers/maintenance")
const router = Router();

router.get("/", maintenanceController)
router.get("/generate-all", generateBillPage);
router.post("/generate-all", generateMaintenanceBillforAll)

router.get("/pay/:id", payMaintenanceBillPage)

module.exports = router;