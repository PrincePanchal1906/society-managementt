const Joi = require("joi");

const joiAddUserSchema = Joi.object({
  name:Joi.string().pattern(/^[A-Za-z ]+$/)
  .min(2)
  .max(50)  
  .required()
  .messages({
    "string.pattern.base": "Name must contain only letters",
    "string.empty": "Name is required"
  }),
  role:Joi.string().
  valid("ADMIN", "MANAGER", "SECRETARY", "MEMBER").required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Please enter a valid email address",
      "string.empty": "Email is required"
    }),
  phone: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.pattern.base": "Please enter a valid 10-digit Indian mobile number",
      "string.empty": "Phone number is required"
    }),
  password: Joi.string()
    .min(8)
    .max(16)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$_!%])[A-Za-z\d@#$_!%]{8,16}$/
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain 1 uppercase, 1 lowercase, 1 number & 1 special character",
      "string.min": "Password must be at least 8 characters",
      "string.max": "Password must be at most 16 characters",
      "string.empty": "Password is required"
    })
});

const  joiUpdateUserSchema
 = Joi.object({
    name:Joi.string().pattern(/^[A-Za-z ]+$/)
  .min(2)
  .max(50)
  .required()
  .messages({
    "string.pattern.base": "Name must contain only letters",
    "string.empty": "Name is required"
  }),
  role:Joi.string().
  valid("ADMIN", "MANAGER", "SECRETARY", "MEMBER").required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Please enter a valid email address",
      "string.empty": "Email is required"
    }),
  phone: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.pattern.base": "Please enter a valid 10-digit Indian mobile number",
      "string.empty": "Phone number is required"
    }),
  })

module.exports={
    joiAddUserSchema,joiUpdateUserSchema
}