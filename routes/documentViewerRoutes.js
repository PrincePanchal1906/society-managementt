const express = require("express");
const router = express.Router();
const { renderDocumentPage } = require("../controllers/documentViewer");

router.get("/document-viewer/:type/:id", renderDocumentPage);

module.exports = router;
