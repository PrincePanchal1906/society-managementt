const User = require("../models/user")
const fs = require("fs");
const path = require("path");
const { joiAddUserSchema, joiUpdateUserSchema } = require("../joiValidation/joiUserSchema")

async function loginPage(req, res) {
  return res.render("loginPage")
}
async function loginUser(req, res) {
  const { email, password } = req.body;
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);


    return res.cookie("token", token, { httpOnly: true, }).redirect("/");
  } catch (error) {
    return res.render("loginPage", {
      error: "Invalid email or password"
    })
  }
}

async function addUserPage(req, res) {
  return res.render("user/addUser", {
    error: null,
    oldData: {},
  });
};
const usersCount = User.countDocuments();
const role = usersCount === 0 ? "ADMIN" : "MEMBER";
async function addUser(req, res) {
  const { name, email, phone, password, role } = req.body;

  const { error } = joiAddUserSchema.validate(req.body, {
    convert: false
  });
  if (error) {
    return res.render("user/addUser", {
      error: error.details[0].message,
      oldData: req.body,

    });
  }
  const imagePath = req.file ? `/uploads/${req.file.filename}` : "/uploads/default.jpg";
  try {
    await User.create({
      name,
      role,
      email,
      phone,
      password,
      profileImage: imagePath,
    });
    return res.redirect("/userManagement")
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern?.email) {
        return res.render("user/addUser", {
          oldData: req.body,
          error: "Email already exists",
        }

        )
      }
      if (error.keyPattern?.phone) {
        return res.render("user/addUser", {
          oldData: req.body,
          error: "phone number is already exists",
        })
      }
    }
    throw error;
  }

};
async function updateUserPage(req, res) {
  const user = await User.findById(req.params.id);
  const users = await User.find({})
  res.render("user/updateUsers", { user, users });
}

async function updateUser(req, res) {
  const { name, email, phone, role } = req.body;
  const user = await User.findById(req.params.id);

  const { error } = joiUpdateUserSchema.validate(req.body, {
    convert: false
  });
  if (error) {
    return res.render("user/updateUsers", {
      error: error.details[0].message,
      oldData: req.body,
      user,

    });
  }

  let updateData = { name, email, phone, role };

  if (req.file) {

    //  OLD IMAGE DELETE (SAFE)
    if (
      user.profileImage &&
      !user.profileImage.includes("default") &&       // default image skip
      !path.isAbsolute(user.profileImage)              // absolute path skip
    ) {
      const oldImagePath = path.join(
        __dirname,
        "..",
        "public",
        user.profileImage.replace(/^\/+/, "")
      );

      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // ✅ ONLY RELATIVE PATH SAVE
    updateData.profileImage = "/uploads/" + req.file.filename;
  }
  try {
    await User.findByIdAndUpdate(req.params.id, updateData);
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern?.email) {
        return res.render("user/updateUsers", {
          user,
          oldData: req.body,
          error: "Email already exists",
        }

        )
      }
      if (error.keyPattern?.phone) {
        return res.render("user/updateUsers", {
          oldData: req.body,
          error: "phone number is already exists",
          user,
        })
      }
    }
    throw error;

  }

  res.redirect("/userManagement");
}


async function deleteUser(req, res) {
  const default_image = "/uploads/default.jpg";

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.redirect("/userManagement");
    }
    if (user.profileImage && user.profileImage !== default_image) {
      const cleanPath = user.profileImage.replace(/^\/+/, "");
      const imagePath = path.join(
        process.cwd(),
        "public",
        cleanPath
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    await User.findByIdAndDelete(req.params.id);
    return res.redirect("/userManagement");
  } catch (error) {
    return res.redirect("/userManagement");
  }
}
async function assignRole(req, res) {
  const { role } = req.body;

  await User.findByIdAndUpdate(req.params.id, { role });
  res.redirect("/userManagement");
}


module.exports = {
  addUserPage, addUser, updateUserPage, updateUser, deleteUser, assignRole, loginPage, loginUser
}
