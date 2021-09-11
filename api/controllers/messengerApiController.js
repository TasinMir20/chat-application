const mongoose = require('mongoose'); // in this file mongoose required only for this method-> mongoose.Types.ObjectId.isValid

const User = require("../../models/User");
const Conversation = require("../../models/Conversation");




exports.chatList_ApiController = async (req, res, next) => {

    try {
        const userData = req.userData;

        // find involved Conversations
        const involvedConversations = await Conversation.find({ 
            $or: [
                { creatorObjId: userData._id },
                { participantObjId: userData._id }
            ]}).sort({updatedAt: -1});

            // user find who involved to me with chatting
            let chatListUsers = "";
            if (involvedConversations[0]) {

                let chatListUserSingle;
                for (let i = 0; i < involvedConversations.length; i++) {

                    if (String(involvedConversations[i].creatorObjId) === String(userData._id)) {
                        const id = involvedConversations[i].participantObjId;
                        chatListUserSingle = await User.findOne({_id: id});
                    } else {
                        const id = involvedConversations[i].creatorObjId;
                        chatListUserSingle = await User.findOne({_id: id});
                    }

                    chatListUsers += `
                        <div class="single-user" onclick="fetchUserChats('${chatListUserSingle._id}');">
                            <div class="img-wrap">
                                <img src="/images/users/profile-photo/man2.jpg" alt="">
                                <i class="fas fa-circle"></i>
                                <span>32 m</span>
                            </div>
                            <div class="meta">
                                <p class="name">${chatListUserSingle.firstName} ${chatListUserSingle.lastName}</p>
                                <p class="last-message">Good night!</p>
                                <span class="last-msg-time">1 hour ago</span>
                            </div>
                        </div>`;
                }
            } else {
                console.log("List not found");
            }

        return res.json({chatListUsers});

    } catch (err) {
        next(err);
    }
}



exports.searchUsersToChat_ApiController = async (req, res, next) => {
    const {searchKeyWord} = req.body;

    try {
        const findUserToConversation = await User.find({
            $or: [
                { firstName: searchKeyWord },
                { lastName: searchKeyWord },
                { username: searchKeyWord },
                { email: searchKeyWord }
            ]});

            if (findUserToConversation) {

                let searchUser = "";
                for (var i = 0; i < findUserToConversation.length; i++) {
                    
                    searchUser += `<div class="search-single-user" onclick="fetchUserChats('${findUserToConversation[i]._id}', true);">
                                    <div class="img-wrap">
                                        <img src="/images/users/profile-photo/man3.jpg" alt="">
                                    </div>
                                    <p>${findUserToConversation[i].firstName} ${findUserToConversation[i].lastName}</p>
                                </div>`;
                }

                return res.json({ searchUser });
            }

            return res.json({});
        
    } catch (err) {
        next(err);
    }
}



exports.fetchUserChats_ApiController = async (req, res, next) => {

    let { participant, isItSearch } = req.body;
    
    try {
        const userData = req.userData;

        const isValidObjId = mongoose.Types.ObjectId.isValid(participant);

        if (isValidObjId) {
            
            const ConversationFind = await Conversation.findOne({ 
                $or: [
                    { $and: [ { creatorObjId: userData._id }, { participantObjId: participant } ] },
                    { $and: [ { creatorObjId: participant }, { participantObjId: userData._id } ] }
                ]});
            
            var conversations = "";
            if (ConversationFind) {
                conversations = ConversationFind.conversations;
                conversations.reverse();
                
    
            } else {
                console.log("Not found conversations");
            }

            // egt recipient name
            let participantData = await User.findOne({_id: participant});
            if (participantData) {
                
                // after search new user append in chat list
                if (isItSearch) {
                    var newChatToAppendChatList = `<div class="single-user" onclick="fetchUserChats('${participantData._id}')">
                            <div class="img-wrap">
                                <img src="/images/users/profile-photo/man2.jpg" alt="">
                                <i class="fas fa-circle"></i>
                                <span>32 m</span>
                            </div>
                            <div class="meta">
                                <p class="name">${participantData.firstName} ${participantData.lastName}</p>
                                <p class="last-message">Good night!</p>
                                <span class="last-msg-time">1 hour ago</span>
                            </div>
                        </div>`;
                }
                var fullName = `${participantData.firstName} ${participantData.lastName}`;
            }
        }
        
        return res.json({conversations, fullName, newChatToAppendChatList});

    } catch (err) {
        next(err);
    }
}







exports.sendMessage_ApiController = async (req, res, next) => {

    const {message, recipient} = req.body;

    try {
        
        const userData = req.userData;

        const isValidObjId = mongoose.Types.ObjectId.isValid(recipient);
        const participantExist = isValidObjId ? await User.findOne({_id: recipient}) : null;

        const currentEpochTime = Math.floor(new Date().getTime()/1000);
        if (participantExist) {
            const ConversationFind = await Conversation.findOne({ 
                $or: [
                    { $and: [ { creatorObjId: userData._id }, { participantObjId: recipient } ] },
                    { $and: [ { creatorObjId: recipient }, { participantObjId: userData._id } ] }
                ]});
            
            const messageBody = {
                message,
                imgUrl: "img.png",
                sender: userData._id,
                receiver: recipient,
                msgSendTime: currentEpochTime
            };

            if (ConversationFind) {
                // Conversation Updating
                let ConversationUpdate = await Conversation.updateOne({ $or: [
                    { $and: [ { creatorObjId: userData._id }, { participantObjId: recipient } ] },
                    { $and: [ { creatorObjId: recipient }, { participantObjId: userData._id } ] }
                ]}, 
                    { $push: { conversations: messageBody }
                });

                console.log(ConversationUpdate)
                if (ConversationUpdate.nModified == 1) {
                    var sent = true;
                }

            } else {
                // Conversation creating
                const ConversationInsertStructure = new Conversation({
                    conversations: [
                        messageBody
                    ],
                    creatorObjId: userData._id,
                    participantObjId: recipient,
                    conversationCreateTime: currentEpochTime
                });

                const saveConversation = await ConversationInsertStructure.save();

                if (saveConversation) {
                    sent = true;
                }
            }


            const sEventNsme = recipient;
            // socket.io server to client
            global.io.emit(sEventNsme, messageBody);

            return res.json({send: sent});

        } else {
            console.log("participant not exist");
        }

    } catch (err) {
        next(err);
    }

}