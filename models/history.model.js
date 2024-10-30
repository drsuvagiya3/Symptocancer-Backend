const mongoose = require("mongoose")

const historySchema = new mongoose.Schema(
    {
        user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        },
        result : {
            type: String,
            required: true,
        },
        symptoms : {
            type: String,
            required: true,
        },
        type : {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true,
        versionKey: false,
        autoCreate: true,
    }
)

const history = mongoose.model("history", historySchema, "history")

module.exports = history