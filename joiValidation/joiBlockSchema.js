const Joi = require("joi");

const joiBlockSchema = Joi.object({
    blockName: Joi.string().trim()
        .uppercase().required(),
    numberOfFlats: Joi.required(),
    sizeOfFlats: Joi.number().required(),
    numberOfBedroom: Joi.number()
        .integer()
        .min(1)
        .max(9)
        .required()
        .messages({
            "number.base": "Bedroom must be a number",
            "number.min": "Bedroom must be at least 1",
            "number.max": "Bedroom cannot be more than 9"
        }),
    numberOfHall: Joi.number()
        .integer()
        .min(1)
        .max(9)
        .required()
        .messages({
            "number.base": "Hall must be a number",
            "number.min": "Hall must be at least 1",
            "number.max": "Hall cannot be more than 9"
        }),
    numberOfKitchen: Joi.number()
        .integer()
        .min(1)
        .max(9)
        .required()
        .messages({
            "number.base": "Kitchen must be a number",
            "number.min": "Kitchen must be at least 1",
            "number.max": "Kitchen cannot be more than 9"
        }),
    sizeUnit: Joi.string().required(),
})

module.exports = {
    joiBlockSchema
}