const User = require('../../models/User');

async function s() {
    
    io.on("connection", (socket) => {

        socket.on("newUserD", async (data) => {
            const up = await User.updateOne(
                { _id: data.id }, 
                { "othersData.lastOnlineTime":  1
            });
            
            console.log("connected:- "+ data.id);
            // user connect event sent to front end
            global.io.emit("newUser", {id: data.id});
            console.log("connect");


            socket.on("disconnect", async () => {
                // user disconnect event sent to front end
                global.io.emit("userD", {id: data.id});

                const currentEpochTime = Math.floor(new Date().getTime()/1000);
                const up = await User.updateOne(
                    { _id: data.id }, 
                    { "othersData.lastOnlineTime":  currentEpochTime
                });

                console.log(up);
                console.log("disconnected:- "+ data.id);
            });
        });
    })
}


module.exports = s;