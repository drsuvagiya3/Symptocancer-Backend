const mongoose = require('mongoose')

//create connection to mongoDB database server
const db = mongoose.connect("mongodb+srv://drsuvagiya11:dhruv11@project.fvy7zua.mongodb.net/Diseases")

module.exports = db