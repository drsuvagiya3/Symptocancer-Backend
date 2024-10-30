const Joi = require("joi")
const statusCode = require("../statusCode.json")

module.exports = {
    validate4login : (req, res, next) => {
        let schema = Joi.object().keys({
            email: Joi.string().email().required(),
            password: Joi.string().required()
        })

        let { error } = schema.validate(req.body)
        if (error) {
            return res 
                    .status(statusCode.HTTP_CODE.BAD_REQUEST)
                    .json({ success : false , message : error.details[0].message})
        }
        else{
            next();
        }
    },
    validate4register : (req, res, next) => {
        let schema = Joi.object().keys({
            email: Joi.string().email().required(),
            password: Joi.string().required(),
            name: Joi.string().required()
        })
        let { error } = schema.validate(req.body)
        if (error) {
            return res 
                    .status(statusCode.HTTP_CODE.BAD_REQUEST)
                    .json({ success : false , message : error.details[0].message})
        }
        else{
            next();
        }
    },
    validate4predict : (req, res, next) => {
        let schema = Joi.object().keys({
            symptoms: Joi.object().required(),
            type: Joi.string().required(),
        })

        let { error } = schema.validate(req.body)
        if (error) {
            return res 
                    .status(statusCode.HTTP_CODE.BAD_REQUEST)
                    .json({ success : false , message : error.details[0].message})
        }
        else{
            next();
        }
    }
}