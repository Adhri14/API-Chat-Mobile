const { Server } = require('socket.io');

const realtimeChat = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            credentials: true,
        },
    });

    let users = [];

    // const removeUser = (socketId) => {
    //     return (users = users.filter((user) => user.socketId !== socketId));
    // };

    io.on("connection", (socket) => {
        console.log("user is connected!");

        // socket.on("add_user", (user) => {
        //     // const obj = {
        //     //     _id: 'asdasdasd',
        //     //     roomId: 'asdadsasd',
        //     // }
        //     return users.push({
        //         userId: user._id,
        //         socketId: socket.id,
        //         roomId: user.roomId,
        //     });
        // });

        // socket.on("sendMesssage", async (data) => {
        //     console.log(data);
        //     let findUserByRoomId = users.filter(
        //         (user) => user.roomId === data.roomId
        //     );
        //     let newData = findUserByRoomId.map((user) => user.socketId); // ['lj123jb123', 'lakshkjasd812', '1281whkjbsad']

        //     if (data.status && newData) {
        //         const messages = await MessageModel.find({
        //             room: data.roomId,
        //         }).populate("user");
        //         return io.to(newData).emit("getMessage", messages);
        //     }
        //     return false;
        // });

        socket.on("disconnect", () => {
            console.log("user disconnected");
            // removeUser(socket.id);
        });
    });
};

module.exports = realtimeChat;