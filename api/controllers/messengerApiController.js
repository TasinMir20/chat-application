const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose"); // in this file mongoose required only for this method-> mongoose.Types.ObjectId.isValid

const User = require("../../models/User");
const Conversation = require("../../models/Conversation");

exports.chatUserList_ApiController = async (req, res, next) => {
	try {
		const userData = req.userData;

		// find involved Conversations
		const involvedConversations = await Conversation.find({
			$or: [{ creatorObjId: userData._id }, { participantObjId: userData._id }],
		}).sort({ updatedAt: -1 });

		// user find who involved to me with chatting
		let chatListUsers = [];
		if (involvedConversations[0]) {
			for (let i = 0; i < involvedConversations.length; i++) {
				let chatListUserSingle = "";
				let id = "";
				if (String(involvedConversations[i].creatorObjId) === String(userData._id)) {
					id = involvedConversations[i].participantObjId;
					chatListUserSingle = await User.findOne({ _id: id });
				} else {
					id = involvedConversations[i].creatorObjId;
					chatListUserSingle = await User.findOne({ _id: id });
				}

				// if user does not exist
				if (!chatListUserSingle) {
					chatListUserSingle = {
						_id: id,
						firstName: "User not",
						lastName: "Exist",
						othersData: {
							profilePic: "/images/users/profile-photo/not-exist_profile_pic.jpg",
							lastOnlineTime: 0,
						},
					};
				}

				let userLimitedData;
				if (chatListUserSingle) {
					const totalMessagesLen = involvedConversations[i].conversations.length;
					const sender = involvedConversations[i].conversations[totalMessagesLen - 1].sender;
					const lastMessageFull = involvedConversations[i].conversations[totalMessagesLen - 1].message;
					const messageImgName = involvedConversations[i].conversations[totalMessagesLen - 1].attachmentName;
					const lastMsg = messageImgName ? "Attachment" : lastMessageFull;
					let lastMessage = lastMsg.length > 30 ? `${lastMsg.slice(0, 30)}...` : lastMsg;
					lastMessage = String(sender) === String(userData._id) ? `You: ${lastMessage}` : lastMessage;

					// Make profile pic right path
					chatListUserSingle.othersData.profilePicPathName = chatListUserSingle.othersData.profilePicPath ? `${chatListUserSingle.othersData.profilePicPath}${chatListUserSingle.othersData.profilePic}` : chatListUserSingle.othersData.profilePic;

					userLimitedData = {
						_id: chatListUserSingle._id,
						firstName: chatListUserSingle.firstName,
						lastName: chatListUserSingle.lastName,
						profilePicPathName: chatListUserSingle.othersData.profilePicPathName,
						lastOnlineTime: chatListUserSingle.othersData.lastOnlineTime,
						lastMessage,
						lastMessageTime: involvedConversations[i].conversations[totalMessagesLen - 1].msgSendTime,
					};
				}

				chatListUsers[i] = userLimitedData;
			}
		} else {
			console.log("List not found");
		}

		return res.json({ chatListUsers });
	} catch (err) {
		next(err);
	}
};

exports.searchUsersToChat_ApiController = async (req, res, next) => {
	const { searchKeyWord } = req.body;

	try {
		const userData = req.userData;

		if (searchKeyWord) {
			function es(str) {
				return str.replace(/[-\/\\^$*+?()|[\]{}]/g, "");
			}
			const KeyWordRegExp = new RegExp("^" + es(searchKeyWord), "i");
			// search in Database
			const findUserToConversation = await User.find({
				$and: [
					{
						$or: [{ firstName: KeyWordRegExp }, { lastName: KeyWordRegExp }, { username: KeyWordRegExp }, { email: KeyWordRegExp }, { "othersData.keyWord": KeyWordRegExp }],
					},
					{ "othersData.emailVerified": true } /* Email unverified users will not appear in the search results */,
					{ $nor: [{ _id: userData._id }] } /* User self Id/account will not appear in the search results */,
				],
			}).sort({ "othersData.lastServerReq": -1 });

			let foundUser = "";
			if (findUserToConversation[0]) {
				for (var i = 0; i < findUserToConversation.length; i++) {
					// Make profile pic right path
					findUserToConversation[i].othersData.profilePicPathName = findUserToConversation[i].othersData.profilePicPath ? `${findUserToConversation[i].othersData.profilePicPath}${findUserToConversation[i].othersData.profilePic}` : findUserToConversation[i].othersData.profilePic;

					foundUser += `<div class="search-single-user" onclick="fetchUserChats_ApiRequest('${findUserToConversation[i]._id}', true);">
                                    <div class="img-wrap">
                                        <img src="${findUserToConversation[i].othersData.profilePicPathName}" alt="">
                                    </div>
                                    <p>${findUserToConversation[i].firstName} ${findUserToConversation[i].lastName}</p>
                                </div>`;
				}
				return res.json({ foundUser });
			}

			// not found user to chat
			foundUser = `<div class="search-single-user">
                            <p>Not found user</p>
                        </div>`;
			return res.json({ foundUser });
		}

		return res.json({});
	} catch (err) {
		next(err);
	}
};

exports.fetchUserChats_ApiController = async (req, res, next) => {
	let { participant, isItSearch, pagination } = req.body;

	try {
		const userData = req.userData;

		const isValidObjId = mongoose.Types.ObjectId.isValid(participant);

		if (isValidObjId) {
			const ConversationFind = await Conversation.findOne({
				$or: [{ $and: [{ creatorObjId: userData._id }, { participantObjId: participant }] }, { $and: [{ creatorObjId: participant }, { participantObjId: userData._id }] }],
			});

			// chat conversations
			var conversations = "";
			if (ConversationFind) {
				conversations = ConversationFind.conversations;

				let numberOfMsgsEachPagination = 30;
				let start;
				let end;
				if (pagination) {
					start = conversations.length - numberOfMsgsEachPagination * pagination;
					end = conversations.length - numberOfMsgsEachPagination * (pagination - 1);
				} else {
					start = conversations.length - numberOfMsgsEachPagination;
					end = conversations.length;
				}

				if (start < 0) {
					var allMessagesFetched = true;
					conversations = conversations.slice(0, end);
				} else {
					conversations = conversations.slice(start, end);
				}

				conversations.reverse();
			} else {
				console.log("Not found conversations");
			}

			// recipient data
			let participantData = await User.findOne({ _id: participant });

			// if user does not exist
			if (!participantData) {
				participantData = {
					firstName: "User not",
					lastName: "Exist",
					othersData: {
						profilePic: "/images/users/profile-photo/not-exist_profile_pic.jpg",
						lastOnlineTime: 0,
					},
				};
			}

			if (participantData) {
				// Make profile pic right path
				participantData.othersData.profilePicPathName = participantData.othersData.profilePicPath ? `${participantData.othersData.profilePicPath}${participantData.othersData.profilePic}` : participantData.othersData.profilePic;

				// after search new user append in chat list
				if (isItSearch) {
					// generate unique css class from user obj ID
					let str = String(participantData._id);
					let setUniqueCssClass = "c" + str.substr(str.length - 5, str.length);

					var newChatToAppendChatUserList = `<div class="single-user ${setUniqueCssClass}" onclick="fetchUserChats_ApiRequest('${participantData._id}')">
                            <div class="img-wrap">
                                <img src="${participantData.othersData.profilePicPathName}" alt="">
                            </div>
                            <div class="meta">
                                <p class="name">${participantData.firstName} ${participantData.lastName}</p>
                                <p class="last-message">.</p>
                                <span class="last-msg-time">.</span>
                            </div>
                        </div>`;
				}
				var fullName = `${participantData.firstName} ${participantData.lastName}`;
				var username = participantData.username;
				var profilePicPathName = participantData.othersData.profilePicPathName;
				var lastOnlineTime = participantData.othersData.lastOnlineTime;
			}
		}

		return res.json({ conversations, allMessagesFetched, fullName, username, profilePicPathName, lastOnlineTime, newChatToAppendChatUserList });
	} catch (err) {
		next(err);
	}
};

exports.sendMessage_ApiController = async (req, res, next) => {
	let { message, recipientId } = req.body;
	try {
		let attachmentName = "";
		if (req.files) {
			message = "";
			attachmentName = String(req.files[0].filename);
		}

		const userData = req.userData;

		const isValidObjId = mongoose.Types.ObjectId.isValid(recipientId);
		const participantExist = isValidObjId ? await User.findOne({ _id: recipientId }) : null;

		const currentEpochTime = Math.floor(new Date().getTime() / 1000);
		if (participantExist) {
			const ConversationFind = await Conversation.findOne({
				$or: [{ $and: [{ creatorObjId: userData._id }, { participantObjId: recipientId }] }, { $and: [{ creatorObjId: recipientId }, { participantObjId: userData._id }] }],
			});

			const messageBody = {
				message,
				attachmentName,
				sender: userData._id,
				receiver: recipientId,
				msgSendTime: currentEpochTime,
			};

			if (ConversationFind) {
				// Conversation Updating
				let ConversationUpdate = await Conversation.updateOne({ $or: [{ $and: [{ creatorObjId: userData._id }, { participantObjId: recipientId }] }, { $and: [{ creatorObjId: recipientId }, { participantObjId: userData._id }] }] }, { $push: { conversations: messageBody } });

				if (ConversationUpdate.nModified == 1) {
					var sent = true;
				}
			} else {
				// Conversation creating
				const ConversationInsertStructure = new Conversation({
					conversations: [messageBody],
					creatorObjId: userData._id,
					participantObjId: recipientId,
					conversationCreateTime: currentEpochTime,
				});

				const saveConversation = await ConversationInsertStructure.save();

				if (saveConversation) {
					sent = true;
				}
			}

			messageBody.name = `${userData.firstName} ${userData.lastName}`;

			const socketMsgEventName = recipientId + "message";
			// socket.io messages Event at server
			global.io.emit(socketMsgEventName, messageBody);

			return res.json({ send: sent, attachmentName });
		} else {
			console.log("participant does not exist");
		}
	} catch (err) {
		next(err);
	}
};

exports.typingMessage_ApiController = (req, res, next) => {
	const userData = req.userData;

	try {
		const { recipientId } = req.body;
		const typingEventName = recipientId + "typing";
		// socket.io Typing Event at server
		global.io.emit(typingEventName, { typer: userData._id });
		res.json({});
	} catch (err) {
		next(err);
	}
};

exports.messengerPrivateImages_ApiController = async (req, res, next) => {
	try {
		const participant = req.query.rsp;
		const userData = req.userData;
		const isValidObjId = mongoose.Types.ObjectId.isValid(participant);
		if (isValidObjId) {
			const ConversationFind = await Conversation.findOne({
				$and: [
					{
						$or: [{ $and: [{ creatorObjId: userData._id }, { participantObjId: participant }] }, { $and: [{ creatorObjId: participant }, { participantObjId: userData._id }] }],
					},
					{
						conversations: { $elemMatch: { attachmentName: req.params.attachment_name } },
					},
				],
			});

			if (ConversationFind) {
				const requestedPath = `${path.resolve("./")}/private/messenger/files/${req.params.attachment_name}`;
				if (fs.existsSync(requestedPath)) {
					return res.sendFile(requestedPath);
				}
			}
		}
		return res.sendFile(`${path.resolve("./")}/private/messenger/not-exist.svg`);
	} catch (err) {
		next(err);
	}
};
