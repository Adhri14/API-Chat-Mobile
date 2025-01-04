const chatModel = require("../Models/chat");
const chatMessageModel = require("../Models/chatMessage");
const pusherRealtime = require("../Utils/pusherRealtime");

const KEY_CHAT = "conversation-chats-";
const KEY_MESSAGE = "conversation-messages-";

const getMessage = async (data) => {
    try {
        const chats = await chatMessageModel.findOne({ _id: data._id })
            .populate('sender')
            .populate('receiver')
            .populate({
                path: 'replyMessage',
                populate: [
                    { path: 'sender', model: 'User' }, // Populate sender dari replyMessage
                    { path: 'receiver', model: 'User' } // Populate receiver dari replyMessage
                ]
            });

        return chats;
    } catch (error) {
        throw error;
    }
}

const getMessages = async (data) => {
    try {
        const offset = 0;
        const limit = 10;

        const page = Math.max(0, offset);

        const chats = await chatModel.find({ participants: data._id })
            .populate('participants', '_id fullName username email image')
            .sort({ updatedAt: -1 })
            .limit(limit)
            .skip(page * limit);

        const newChats = await Promise.all(chats.map(async (chat) => {
            const messages = await chatMessageModel.find({ statusRead: false, chat: chat._id });
            return {
                ...chat.toObject(),
                totalStatusChatUnRead: messages.length,
            }
        }));

        return newChats;
    } catch (error) {
        throw error
    }
}

module.exports = {
    listChats: async (req, res) => {
        try {
            const { _id } = req.user;
            const { offset = 0, limit = 10 } = req.query;

            const page = Math.max(0, offset);

            const chats = await chatModel.find({ participants: _id })
                .populate('participants', '_id fullName username email image')
                .sort({ updatedAt: -1 })
                .limit(limit)
                .skip(page * limit);
            const chats2 = await chatModel.find({ participants: _id });

            const newChats = await Promise.all(chats.map(async (chat) => {
                const messages = await chatMessageModel.find({ statusRead: false, chat: chat._id, receiver: _id });
                return {
                    ...chat.toObject(),
                    totalStatusChatUnRead: messages.length,
                }
            }));

            return res.status(200).json({
                status: 200,
                message: 'Get list message successfully!',
                data: newChats,
                pagination: {
                    total: chats2.length,
                    totalPages: Math.ceil(chats2.length / limit),
                }
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message || 'Internal server error!',
            });
        }
    },
    listMessage: async (req, res) => {
        try {
            const { userId: userIdTarget, chatId, offset = 0, limit = 10 } = req.query;
            const { _id } = req.user;

            const page = Math.max(0, offset);

            let chats = [];

            if (!chatId) {
                const chat = await chatModel.findOne({
                    participants: {
                        $all: [_id, userIdTarget]
                    }
                });

                if (chat) {
                    chats = await chatMessageModel.find({ chat: chat._id })
                        .populate('sender')
                        .populate('receiver')
                        .populate({
                            path: 'replyMessage',
                            populate: [
                                { path: 'sender', model: 'User' }, // Populate sender dari replyMessage
                                { path: 'receiver', model: 'User' } // Populate receiver dari replyMessage
                            ]
                        })
                        .sort({ createdAt: -1 })
                        .limit(limit)
                        .skip(page * limit);
                }

                const chats2 = await chatMessageModel.find({ chat: chat._id });

                return res.status(200).json({
                    status: 200,
                    message: 'Get messages successfully',
                    data: chats,
                    pagination: {
                        total: chats2.length,
                        totalPages: Math.ceil(chats2.length / limit),
                    }
                });
            }

            chats = await chatMessageModel.find({ chat: chatId })
                .populate('sender')
                .populate('receiver')
                .populate({
                    path: 'replyMessage',
                    populate: [
                        { path: 'sender', model: 'User' }, // Populate sender dari replyMessage
                        { path: 'receiver', model: 'User' } // Populate receiver dari replyMessage
                    ]
                })
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(page * limit);

            const chats2 = await chatMessageModel.find({ chat: chatId });

            return res.status(200).json({
                status: 200,
                message: 'Get messages successfully',
                data: chats,
                pagination: {
                    total: chats2.length,
                    totalPages: Math.ceil(chats2.length / limit),
                }
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message || 'Internal server error!',
                data: []
            });
        }
    },
    sendChat: async (req, res) => {
        try {
            const { message, receiver, replyMessage, chatId, category, meta, media } = req.body;
            const { _id } = req.user;

            if (!chatId && category === 'new') {
                const newChat = new chatModel({
                    participants: [_id, receiver]
                });
                await newChat.save();

                const chatMessage = await chatMessageModel.create({
                    chat: newChat._id,
                    sender: _id,
                    receiver,
                    message,
                    replyMessage,
                    meta,
                    media
                });
                await newChat.updateOne({ lastMessage: chatMessage.message });

                const chats = await getMessage({ "_id": newChat._id });

                if (chats) {
                    pusherRealtime.trigger(`${KEY_CHAT}-channel-${newChat._id}`, `${KEY_CHAT}-event-${newChat._id}`, {
                        data: chats
                    });
                }

                const messages = await getMessages({ _id: receiver });
                if (messages) {
                    pusherRealtime.trigger(`${KEY_MESSAGE}-channel-${receiver}`, `${KEY_MESSAGE}-event-${receiver}`, {
                        data: messages
                    });
                }

                return res.status(200).json({
                    status: 200,
                    message: 'Send message is successfully!',
                    data: {
                        id: newChat._id
                    }
                });
            }

            if (!chatId && category === 'exist') {
                const chat = await chatModel.findOne({
                    participants: {
                        $all: [_id, receiver]
                    }
                });

                const chatMessage = await chatMessageModel.create({
                    chat: chat._id,
                    sender: _id,
                    receiver,
                    message,
                    replyMessage,
                    meta,
                    media
                });
                await chat.updateOne({ lastMessage: chatMessage.message });

                const chats = await getMessage({ "_id": chat._id });

                if (chats) {
                    pusherRealtime.trigger(`${KEY_CHAT}-channel-${chat._id}`, `${KEY_CHAT}-event-${chat._id}`, {
                        data: chats
                    });
                }

                const messages = await getMessages({ _id: receiver });
                if (messages) {
                    pusherRealtime.trigger(`${KEY_MESSAGE}-channel-${receiver}`, `${KEY_MESSAGE}-event-${receiver}`, {
                        data: messages
                    });
                }

                return res.status(200).json({
                    status: 200,
                    message: 'Send message is successfully!',
                    data: {
                        id: chat._id
                    }
                });
            }

            const chat = await chatModel.findOne({ _id: chatId });

            const chatMessage = await chatMessageModel.create({
                chat: chat._id,
                sender: _id,
                receiver,
                message,
                replyMessage,
                meta,
                media
            });
            await chat.updateOne({ lastMessage: chatMessage.message });

            const chats = await getMessage({ "_id": chatMessage._id });

            if (chats) {
                pusherRealtime.trigger(`${KEY_CHAT}-channel-${chat._id}`, `${KEY_CHAT}-event-${chat._id}`, {
                    data: chats
                });
            }

            const messages = await getMessages({ _id: receiver });
            if (messages) {
                pusherRealtime.trigger(`${KEY_MESSAGE}-channel-${receiver}`, `${KEY_MESSAGE}-event-${receiver}`, {
                    data: messages
                });
            }

            return res.status(200).json({
                status: 200,
                message: 'Send message is successfully!',
                data: {
                    id: chat._id
                }
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: 500,
                message: error.message || 'Internal server error!',
            });
        }
    },
    updateStatusRead: async (req, res) => {
        try {
            const { _id } = req.user;
            const { chatId } = req.params;
            const chatMessage = await chatMessageModel.findOne({ chat: chatId }).sort({ createdAt: -1 });
            const data = await chatMessageModel.updateMany({ chat: chatId, statusRead: false, receiver: chatMessage.receiver }, { statusRead: true });
            const messages = await getMessages({ _id: chatMessage.receiver });
            if (messages) {
                pusherRealtime.trigger(`${KEY_MESSAGE}-channel-${_id}`, `${KEY_MESSAGE}-event-${_id}`, {
                    data: messages
                });
            }

            const chats = await getMessage({ "_id": chatId });
            pusherRealtime.trigger(`${KEY_CHAT}-channel-${chatId}`, `${KEY_CHAT}-event-${chatId}`, {
                data: chats
            });

            return res.status(200).json({
                status: 200,
                message: "Update status read message successfully!"
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: error.message || 'Internal server error!',
            });
        }
    },
}