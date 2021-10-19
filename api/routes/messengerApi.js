const messengerApi = require("express").Router();
const messengerFileUpload = require("../../middleware/upload-middleware/messengerFileUpload");
const { chatUserList_ApiController, searchUsersToChat_ApiController, fetchUserChats_ApiController, sendMessage_ApiController, typingMessage_ApiController, messengerPrivateImages_ApiController } = require("../controllers/messengerApiController");

messengerApi.post("/chat-user-list", chatUserList_ApiController);
messengerApi.post("/search-users", searchUsersToChat_ApiController);
messengerApi.post("/fetch-chats", fetchUserChats_ApiController);
messengerApi.post("/send-message", messengerFileUpload, sendMessage_ApiController);
messengerApi.post("/typing", typingMessage_ApiController);
messengerApi.get("/files/:attachment_name", messengerPrivateImages_ApiController);

module.exports = messengerApi;
