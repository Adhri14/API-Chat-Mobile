const { Schema, model } = require('mongoose');

const ChatMessageSchema = new Schema({
    chat: {
        type: Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    replayUser: {
        type: Schema.Types.ObjectId,
        ref: 'Chat',
        default: null,
    },
    statusRead: {
        type: Boolean,
        default: false,
    },
    message: {
        type: String,
        required: true,
    },
    media: {
        type: String,
        default: null,
    }
}, { timestamps: true });

const chatMessageModel = model('ChatMessage', ChatMessageSchema);
module.exports = chatMessageModel;