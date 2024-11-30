const { Schema, model } = require("mongoose");

const MediaSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    width: {
        type: Number,
    },
    height: {
        type: Number,
    },
    format: {
        type: String,
    },
    resource_type: {
        type: String,
    },
    created_at: {
        type: Date
    },
    bytes: {
        type: Number
    },
    type: {
        type: String,
    },
    url: {
        type: String,
    },
}, { timestamps: true });

const mediaModel = model('Media', MediaSchema);
module.exports = mediaModel;