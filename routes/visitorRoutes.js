const express = require("express");
const { addBlock } = require("../controllers/block");
const router = express.Router();
const { addVisitorsPage, addVisitor, visitorManagement, pendingVisitors,
    exitVisitors, visitorsHistory
} = require("../controllers/visitor")


router.get("/addVisitor", addVisitorsPage);
router.post("/addVisitor", addVisitor);
router.get("/visitorManagement", visitorManagement);
router.get("/pendingVisitors", pendingVisitors);
router.post("/exit/:id", exitVisitors);
router.get("/history", visitorsHistory)

module.exports = router;