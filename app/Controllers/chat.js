const { findOne } = require("../Models/user");
const chatModel = require("../Models/chat");
const chatMessageModel = require("../Models/chatMessage");

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
                const messages = await chatMessageModel.find({ statusRead: false, chat: chat._id });
                return {
                    ...chat.toObject(),
                    totalStatusChatUnRead: messages.length,
                }
            }));

            console.log('new : ', newChats);

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
            const { userId: userIdTarget, chatId } = req.query;
            const { _id } = req.user;

            let chats = [];

            console.log('cek chat id : ', _id);

            if (!chatId) {
                const chat = await chatModel.findOne({
                    participants: {
                        $all: [_id, userIdTarget]
                    }
                });

                if (chat) {
                    chats = await chatMessageModel.find({ chat: chat._id })
                        .populate('sender', '_id fullName image')
                        .populate('receiver', '_id fullName image')
                        .sort({ createdAt: -1 });
                }

                console.log('cek no id chat : ', chats);

                return res.status(200).json({
                    status: 200,
                    message: 'Get messages successfully',
                    data: chats
                });
            }

            chats = await chatMessageModel.find({ chat: chatId })
                .populate('sender', '_id fullName image')
                .populate('receiver', '_id fullName image')
                .sort({ createdAt: -1 });

            return res.status(200).json({
                status: 200,
                message: 'Get messages successfully',
                data: chats
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: 500,
                message: error.message || 'Internal server error!',
            });
        }
    },
    sendChat: async (req, res) => {
        try {
            const { message, receiver, replayUser = null, chatId, category } = req.body;
            const { _id } = req.user;

            if (!chatId && category === 'new') {
                const newChat = new chatModel({
                    participants: [_id, receiver]
                });
                await newChat.save();

                const chatMessage = new chatMessageModel({
                    chat: newChat._id,
                    sender: _id,
                    receiver,
                    message,
                    replayUser,
                });
                await chatMessage.save();

                await newChat.updateOne({ lastMessage: chatMessage.message });
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

                const chatMessage = new chatMessageModel({
                    chat: chat._id,
                    sender: _id,
                    receiver,
                    message,
                    replayUser,
                });

                await chatMessage.save();

                await chat.updateOne({ lastMessage: chatMessage.message });

                return res.status(200).json({
                    status: 200,
                    message: 'Send message is successfully!',
                    data: {
                        id: chat._id
                    }
                });
            }

            const chat = await chatModel.findOne({ _id: chatId });

            const chatMessage = new chatMessageModel({
                chat: chat._id,
                sender: _id,
                receiver,
                message,
                replayUser,
            });

            await chatMessage.save();

            await chat.updateOne({ lastMessage: chatMessage.message });

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
            const { chatId } = req.params;
            await chatMessageModel.updateMany({ chat: chatId, statusRead: false }, { statusRead: true });

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
    }
}