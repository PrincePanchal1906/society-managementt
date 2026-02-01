const express=require("express");
const router = express.Router();
const {addBlockPage,addBlock,
    blockManagement,renderUpdateBlockPage,updateBlock
    ,deleteBlock} = require("../controllers/block");


router.get("/addBlock",addBlockPage);
router.post("/addBlock",addBlock);
router.get("/blockManagement",blockManagement);
router.get("/update/:id",renderUpdateBlockPage);
router.post("/update/:id",updateBlock);
router.get("/delete/:id",deleteBlock)

module.exports = router;