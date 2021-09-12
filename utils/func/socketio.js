const User = require('../../models/User');

async function s() {
    
    io.on("connection", (socket) => {

        

        socket.on("newUserD", async (data) => {

            const up = await User.updateOne(
                { _id: data }, 
                { "othersData.lastOnlineTime":  1
            });
            
            console.log("connected:- "+ data);
            // user connect event sent to front end
            global.io.emit("newUser", data);
            console.log("connect");



            socket.on("disconnect", async () => {
                // user disconnect event sent to front end
                global.io.emit("userD", data);

                const currentEpochTime = Math.floor(new Date().getTime()/1000);
                const up = await User.updateOne(
                    { _id: data }, 
                    { "othersData.lastOnlineTime":  currentEpochTime
                });
    
                console.log(up);

                console.log("disconnectedd:- "+ data);
            });

        });
        
        
    })
}


module.exports = s;