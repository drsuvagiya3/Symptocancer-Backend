const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { spawn } = require('child_process');
require("dotenv").config();

const statusCode = require("../utils/statusCode.json");
const message = require("../utils/message.json");
const { userModel, historyModel } = require("../models");  
const { log } = require("console");

module.exports = {
    register : async ( req, res ) => {
        try {
            const { name, email, password } = req.body;
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const userData = {
                name,
                email,
                password: hashedPassword
            }
            const user = await userModel.create(userData)

            if(user)
            {
                return res
                        .status(statusCode.HTTP_CODE.OK)
                        .json({ success : true, message : message.SIGNUP_SUCCESS})
            }
            else{
                return res
                        .status(statusCode.HTTP_CODE.BAD_REQUEST)
                        .json({ success : false, message : message.FAILED})
            }
        } catch (error) {
            return res
                    .status(statusCode.HTTP_CODE.INTERNAL_SERVER_ERROR)
                    .json({ success : false, message : error.message})
        }
    },

    login : async (req, res) => {
        try {
            const { email, password } = req.body;

            const userExist = await userModel.findOne({email})

            if(!userExist)
            {
                return res
                        .status(statusCode.HTTP_CODE.NOT_FOUND)
                        .json({ success : false, message : message.USER_NOT_FOUND})
            }

            const userPassword = userExist.password
            const isMatch = await bcrypt.compare(password, userPassword)

            if(!isMatch)
            {
                return res
                        .status(statusCode.HTTP_CODE.BAD_REQUEST)
                        .json({ success : false, message : message.INVALID_PASSWORD})
            }

            const data = {
                _id : userExist._id,
                name : userExist.name,
                email : userExist.email
            }
            const token = jwt.sign(data, process.env.JWT_SECRET, {expiresIn : "1d"})
            return res
                    .status(statusCode.HTTP_CODE.OK)
                    .json({ success : true, message : message.LOGIN_SUCCESS, user:data, token})
        }
        catch (error) {
            return res
                    .status(statusCode.HTTP_CODE.INTERNAL_SERVER_ERROR)
                    .json({ success : false, message : error.message})
        }
    },
    predictDisease : async (req, res) => {
        try {
            const { symptoms, type } = req.body;

            let token,user;
            const { authorization } = req.headers;
            if (authorization && authorization.startsWith("Bearer")) {
                token = authorization.split(" ")[1];
                if (!token) {
                    return res
                        .status(statusCode.HTTP_CODE.BAD_REQUEST)
                        .json({ success: false, message: message.INVALID_TOKEN })
                }
                user = jwt.verify(token, process.env.JWT_SECRET);
            }
            let features = [];
            Object.values(symptoms).forEach(value => {
                features.push(value);
            });
            
            const prediction = spawn('python', [`./utils/training/prediction/${type}.py`, ...features]);
            let result;
            await prediction.stdout.on('data', (data) => {
                result = data.toString()[0];
            });
            prediction.stderr.on('data', (data) => {
                console.error(`Error: ${data}`);
                return res
                        .status(statusCode.HTTP_CODE.INTERNAL_SERVER_ERROR)
                        .json({ success : "false" , message : message.PREDICTION_FAILED});
            });
            prediction.on('close', async (code) => {
                //console.log(`Process exited with code ${code}`);
                //console.log(result);
                
                if (code === 0) {
                    const data = {
                        user : user._id,
                        result,
                        type,
                        symptoms : JSON.stringify(symptoms)
                    }
                    
                    const history = await historyModel.create(data)
        
                    if(!history)
                    {
                        return res
                                .status(statusCode.HTTP_CODE.BAD_REQUEST)
                                .json({ success : false, message : message.FAILED})
                    }
                    return res
                            .status(statusCode.HTTP_CODE.OK)
                            .json({ success: true, message: message.PREDICTION_SUCCESS, result });
                } else {
                    return res
                            .status(statusCode.HTTP_CODE.INTERNAL_SERVER_ERROR)
                            .json({ success: false, message: message.PREDICTION_FAILED });
                }
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res
                    .status(statusCode.HTTP_CODE.BAD_REQUEST)
                    .json({ success: false, message: message.TOKEN_EXPIRED });
              }
            return res
                    .status(statusCode.HTTP_CODE.INTERNAL_SERVER_ERROR)
                    .json({ success : false, message : error.message})
        }
    },
    getHistory : async (req, res) => {
        try {
            const user = req.params.user;
            let token,userdata;
            const { authorization } = req.headers;
            if (authorization && authorization.startsWith("Bearer")) {
                token = authorization.split(" ")[1];
                if (!token ) {
                    return res
                        .status(statusCode.HTTP_CODE.BAD_REQUEST)
                        .json({ success: false, message: message.INVALID_TOKEN })
                }
                userdata = jwt.verify(token, process.env.JWT_SECRET);                
            }

            if (user !== userdata._id && !mongoose.Types.ObjectId.isValid(user)) {
                return res
                        .status(statusCode.HTTP_CODE.BAD_REQUEST)
                        .json({ success : false, message : message.INVALID_USER})
              }
            const history = await historyModel.find({user}).sort({createdAt : -1});

            if(history.length == 0)
            {
                return res
                        .status(statusCode.HTTP_CODE.OK)
                        .json({ success : true, message : message.HISTORY_NOT_FOUND})
            }

            return res
                    .status(statusCode.HTTP_CODE.OK)
                    .json({ success : true, message : message.SUCCESS, history})
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res
                    .status(statusCode.HTTP_CODE.BAD_REQUEST)
                    .json({ success: false, message: message.TOKEN_EXPIRED });
              }
            return res
                    .status(statusCode.HTTP_CODE.INTERNAL_SERVER_ERROR)
                    .json({ success : false, message : error.message})
        }
    },
    getProfile : async (req, res) => {
        try {
            let token, user;
            const { authorization } = req.headers;
            if (authorization && authorization.startsWith("Bearer")) {
                token = authorization.split(" ")[1];
                if (!token) {
                    return res
                        .status(statusCode.HTTP_CODE.BAD_REQUEST)
                        .json({ success: false, message: message.INVALID_TOKEN })
                }
                user = jwt.verify(token, process.env.JWT_SECRET);
            }
            return res
                    .status(statusCode.HTTP_CODE.OK)
                    .json({ success: true, message: message.SUCCESS, user });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res
                    .status(statusCode.HTTP_CODE.BAD_REQUEST)
                    .json({ success: false, message: message.TOKEN_EXPIRED });
              }
            return res
                    .status(statusCode.HTTP_CODE.INTERNAL_SERVER_ERROR)
                    .json({ success : false, message : error.message})
        }
    }

    ////Validation remaining for all APIs////
}