const { Schema, model } = require('mongoose');

const ChatSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    lastMessage: {
        type: String,
    }
}, { timestamps: true });

const chatModel = model('Chat', ChatSchema);
module.exports = chatModel;