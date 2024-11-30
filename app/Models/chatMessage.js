const { Schema, model } = require('mongoose');

const ChatMessageSchema = new Schema({
    chat: {
        type: Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    meta: {
        type: Schema.Types.Mixed,
        default: null
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
    },
    media: {
        type: Schema.Types.Mixed,
        default: null,
    }
}, { timestamps: true });

const chatMessageModel = model('ChatMessage', ChatMessageSchema);
module.exports = chatMessageModel;