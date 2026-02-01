const { createHmac, randomBytes } = require("crypto");
const mongoose = require("mongoose");
const {createTokenForUser} = require("../services/authentication");
const Joi = require("joi");

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },

    phone:{
      type:String,
      required:true,
    },
    profileImage:{
      type:String,
      default: "/uploads/default.jpg"
    },
    role: {
    type: String,
    enum: ["ADMIN", "MANAGER", "SECRETARY", "MEMBER", "SECURITY"],
    default: "MEMBER"
  },  
    salt:{
        type:String
    },
    password: {
        type: String,
        minlength: 8,
        required: true
    },
    created:{
        type:Date,
        required:true,
        default:Date.now,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
}
},{timestamps:true},
);
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = randomBytes(16).toString();

  const hashedPassword = createHmac("sha256", salt)
    .update(this.password)
    .digest("hex");

  this.salt = salt;
  this.password = hashedPassword;
});


userSchema.static("matchPasswordAndGenerateToken", async function (email, password) {

  const user = await this.findOne({ email: email.trim() });
  if (!user) throw new Error("User not found");

  const hashedInputPassword = createHmac("sha256", user.salt)
    .update(password)
    .digest("hex");

  if (hashedInputPassword !== user.password)
    throw new Error("Password is incorrect");

  return createTokenForUser(user);
});




const User = mongoose.model("user",userSchema);

module.exports=User;