const User = require("../../models/User");

async function socketConnect() {
	io.on("connection", (socket) => {
		// connect Listener at server
		socket.on("AnUserConnected", async (data) => {
			// user connect update to database
			const up = await User.updateOne({ _id: data.id }, { "othersData.lastOnlineTime": 1 });

			// an user connect event sent to others user front end
			global.io.emit("anUser", { id: data.id });

			socket.on("disconnect", async () => {
				// an user disconnect event sent to others user front end
				global.io.emit("AnUserD", { id: data.id });

				const currentEpochTime = Math.floor(new Date().getTime() / 1000);
				// last disconnect time update to database
				await User.updateOne({ _id: data.id }, { "othersData.lastOnlineTime": currentEpochTime });
			});
		});
	});
}

module.exports = socketConnect;
