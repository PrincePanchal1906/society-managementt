const express = require("express");

const router = express.Router();
const { addTenantPage, addTenant,
    tenantManagement, updateTenantPage, updateTenant, deleteTenant, getDocument,
    getTenantDocument } = require("../controllers/tenant")
const idProof = require("../middlewares/tenantIdProof");
const { errHandleMulter } = require("../services/errHandleMulter");

router.get("/addTenant", addTenantPage);
router.post("/addTenant", idProof.any(), addTenant, errHandleMulter);
router.get("/tenantManagement", tenantManagement)
router.get("/updateTenant/:id", updateTenantPage)
router.post("/updateTenant/:id", idProof.any(), updateTenant, errHandleMulter);
router.get("/deleteTenant/:id", deleteTenant)
router.get("/documents/:id", getDocument)
router.get("/:id", getDocument);
router.get("/api/tenant-document", getTenantDocument)

module.exports = router;