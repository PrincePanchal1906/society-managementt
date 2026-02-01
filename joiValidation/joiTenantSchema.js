const Joi = require("joi");

const tenantValidationSchema = Joi.object({
  firstName: Joi.string().required(),
  middleName: Joi.string().allow("", null),
  lastName: Joi.string().required(),
  firstMobileNo: Joi.string()
    .required()
    .pattern(/^[0-9]{10}$/)
    .messages({
      "number.min": "Enter valid 10 digit mobile number",
      "number.max": "Enter valid 10 digit mobile number",
      "any.required": "Primary mobile number is required",
      "string.pattern.base": "Mobile number must be exactly 10 digits"
    }),

  secondMobileNo: Joi.string()
    .allow("", null)   // ✅ empty & null allow
    .pattern(/^[0-9]{10}$/)
    .messages({
      "string.pattern.base": "Enter valid 10 digit mobile number"
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Enter a valid email address"
    }),
  state: Joi.string().required(),
  pincode: Joi.string().required(),
  documents: Joi.array().items(
    Joi.object({
      documentType: Joi.string().required(),
      filesPath: Joi.array().items(Joi.string()).required(),
    })
  ).required(),
}).unknown(true);
const updateTenantValidationSchema = Joi.object({
  firstName: Joi.string().required(),
  middleName: Joi.string().allow("", null),
  lastName: Joi.string().required(),
  firstMobileNo: Joi.string()
    .required()
    .pattern(/^[0-9]{10}$/)
    .messages({
      "number.min": "Enter valid 10 digit mobile number",
      "number.max": "Enter valid 10 digit mobile number",
      "any.required": "Primary mobile number is required",
      "string.pattern.base": "Mobile number must be exactly 10 digits"
    }),

  secondMobileNo: Joi.string()
    .allow("", null)   // ✅ empty & null allow
    .pattern(/^[0-9]{10}$/)
    .messages({
      "string.pattern.base": "Enter valid 10 digit mobile number"
    }),
  email: Joi.string()
    .email()
    .optional()
    .allow("")
    .messages({
      "string.email": "Enter a valid email address"
    }),
  state: Joi.string(),
  pincode: Joi.string(),
  documents: Joi.array().items(
    Joi.object({
      documentType: Joi.string().required(),
      filesPath: Joi.array().items(Joi.string()).optional(),
    })
  ).optional(),


})

module.exports = { tenantValidationSchema, updateTenantValidationSchema };