const messenger = require("express").Router();
const messengerFileUpload = require("../../middleware/upload-middleware/messengerFileUpload");
const {chatUserList_ApiController, searchUsersToChat_ApiController, fetchUserChats_ApiController, sendMessage_ApiController, typingMessage_ApiController, messengerPrivateImages_ApiController} = require("../controllers/messengerApiController");

messenger.post("/chat-user-list", chatUserList_ApiController);
messenger.post("/search-users", searchUsersToChat_ApiController);
messenger.post("/fetch-chats", fetchUserChats_ApiController);
messenger.post("/send-message", messengerFileUpload, sendMessage_ApiController);
messenger.post("/typing", typingMessage_ApiController);
messenger.get("/files/:attachment_name", messengerPrivateImages_ApiController);




module.exports = messenger;