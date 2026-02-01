const Joi = require("joi");

const addVisitorSchema = Joi.object({
    date: Joi.date().required(),
    flatNo: Joi.string().required(),
    relation: Joi.string().required().allow(null).allow(""),
    purpose: Joi.string().required(),
    entryTime: Joi.string().required(),
    exitTime: Joi.string().allow(null).allow(""),
    exitDate: Joi.date().allow(null).allow(""),
    visitorName: Joi.string().pattern(/^[A-Za-z ]+$/)
        .min(2)
        .trim()
        .required()
        .messages({
            "string.empty": " visitorName is required",
            "string.min": " visitorName must be at least 2 characters"
        }),
})

module.exports = { addVisitorSchema }