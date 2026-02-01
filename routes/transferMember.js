const express = require("express");
const router = express.Router();
const { renderTransferMember, transferMember, renderTransferMemberHistory } = require("../controllers/transferMember");

router.get("/:id", renderTransferMember);
router.get("/history/:id", renderTransferMemberHistory)
router.post("/transferMember/:id", transferMember);
module.exports = router;
