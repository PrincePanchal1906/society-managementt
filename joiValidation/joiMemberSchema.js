const Joi = require("joi");

const memberValidationSchema = Joi.object({
  blockName: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": "Block name is required",
      "any.required": "Block name is required"
    }),

  flatNo: Joi.number(),

  firstName: Joi.string().pattern(/^[A-Za-z ]+$/)
    .min(2)
    .trim()
    .min(2)
    .required()
    .messages({
      "string.empty": "First name is required",
      "string.min": "First name must be at least 2 characters"
    }),

  middleName: Joi.string().pattern(/^[A-Za-z ]+$/)
    .min(2)
    .trim()
    .allow("")
    .optional(),

  lastName: Joi.string().pattern(/^[A-Za-z ]+$/)
    .min(2)
    .trim()
    .required()
    .messages({
      "string.empty": "Last name is required"
    }),

  firstMobileNo: Joi.string()
    .required()
    .pattern(/^[0-9]{10}$/)
    .messages({
      "number.min": "Enter valid 10 digit mobile number",
      "number.max": "Enter valid 10 digit mobile number",
      "any.required": "Primary mobile number is required"
    }),

  secondMobileNo: Joi.string()
    .allow("", null)   // ✅ empty & null allow
    .pattern(/^[0-9]{10}$/)
    .messages({
      "string.pattern.base": "Enter valid 10 digit mobile number"
    }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Please enter a valid email address",
      "string.empty": "Email is required"
    }),
  purchaseDate: Joi.date()
    .required()
    .max("now")
    .messages({
      "date.base": "Purchase date must be valid",
      "any.required": "Purchase date is required"
    }),
  documents: Joi.array().items(
    Joi.object({
      documentType: Joi.string()
        .valid("AADHAR", "PAN", "PASSPORT", "DL")
        .required(),

      filesPath: Joi.array()
        .items(Joi.string().required())
        .min(1)
        .required()
    })
  ).min(1).required(),
  transferDate: Joi.date()
    .allow(null)
    .max("now")
    .messages({
      "date.base": "Transfer date must be valid",
      "any.required": "Transfer date is required"
    }),
  transferReason: Joi.string()
    .allow(null)
    .messages({
      "string.empty": "Transfer reason is required"
    }),
});

const memberUpdateValidationSchema = Joi.object({
  blockName: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": "Block name is required",
      "any.required": "Block name is required"
    }),

  flatNo: Joi.number(),

  firstName: Joi.string().pattern(/^[A-Za-z ]+$/)
    .min(2)
    .trim()
    .min(2)
    .required()
    .messages({
      "string.empty": "First name is required",
      "string.min": "First name must be at least 2 characters"
    }),

  middleName: Joi.string().pattern(/^[A-Za-z ]+$/)
    .min(2)
    .trim()
    .allow("")
    .optional(),

  lastName: Joi.string().pattern(/^[A-Za-z ]+$/)
    .min(2)
    .trim()
    .required()
    .messages({
      "string.empty": "Last name is required"
    }),

  firstMobileNo: Joi.string()
    .required()
    .pattern(/^[0-9]{10}$/)
    .messages({
      "string.pattern.base": "Mobile number must be exactly 10 digits",
      "number.min": "Enter valid 10 digit mobile number",
      "number.max": "Enter valid 10 digit mobile number",
      "any.required": "Primary mobile number is required"
    }),

  secondMobileNo: Joi.string()
    .allow("", null)   // ✅ empty & null allow
    .pattern(/^[0-9]{10}$/)
    .messages({
      "string.pattern.base": "Enter valid 10 digit in alternate mobile number"
    }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Please enter a valid email address",
      "string.empty": "Email is required"
    }),
  purchaseDate: Joi.date()
    .required()
    .max("now")
    .messages({
      "date.base": "Purchase date must be valid",
      "any.required": "Purchase date is required"
    }),
  documents: Joi.array().items(
    Joi.object({
      documentType: Joi.string()
        .valid("AADHAR", "PAN", "PASSPORT", "DL")
        .required(),

      filesPath: Joi.array()
        .items(Joi.string().required())
        .min(1)
        .required()
    })
  ).min(1)
});


module.exports = { memberValidationSchema, memberUpdateValidationSchema };