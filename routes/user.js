const express = require("express");
const { addUserPage, addUser, updateUserPage, updateUser
    , deleteUser, loginPage, loginUser } = require("../controllers/user")
const upload = require("../middlewares/uploadFile");
const User = require("../models/user");
const { onlyAdmin } = require("../middlewares/authorized");
const { assignRole } = require("../controllers/user")
const { allowRoles } = require("../middlewares/authorized");
const { checkForAuthenticationCookie } = require("../middlewares/authentication");
const Block = require("../models/block");

const router = express.Router();

router.get("/", checkForAuthenticationCookie("token"), async (req, res) => {
    const users = await User.find({});
    const blocks = await Block.find({});

    res.render("home", {
        users,
        user: req.user, blocks,
    });
})
router.get("/userManagement", checkForAuthenticationCookie("token"), allowRoles("ADMIN", "MANAGER"),
    async (req, res) => {
        const users = await User.find({});
        const user = await User.findById(req.user._id);

        res.render("user/userManagement", {
            users,
            user,
        });
    })
router.get("/myPortfolio", async function (req, res) {
    return res.render("myPortfolio")
})
router.get("/loginPage", loginPage);
router.post("/loginPage", loginUser)
router.get("/deleteUser/:id", deleteUser)
router.post("/updateUsers/:id", upload.single("profileImage"), updateUser)
router.get("/updateUsers/:id", updateUserPage);
router.get("/add", addUserPage);
router.post("/add", upload.single("profileImage"), addUser);
// router.post("/assign-role/:id", onlyAdmin, assignRole);

module.exports = router;