const messenger = require("express").Router();

const {chatList_ApiController, searchUsersToChat_ApiController, fetchUserChats_ApiController, sendMessage_ApiController, typingMessage_ApiController} = require("../controllers/messengerApiController");

messenger.post("/chat-list", chatList_ApiController);
messenger.post("/search-users", searchUsersToChat_ApiController);
messenger.post("/fetch-chats", fetchUserChats_ApiController);
messenger.post("/send-message", sendMessage_ApiController);
messenger.post("/typing", typingMessage_ApiController);




module.exports = messenger;