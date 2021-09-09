const {Schema, model} = require("mongoose");

const conversationSchema = new Schema({
    conversations: [
        {   
            message: String,
            imgUrl: String,
            sender: String,
            receiver: String,
            msgSendTime: Number
        }
    ],
    creatorObjId: String,
    participantObjId: String,
    conversationCreateTime: Number
    
}, {
    timestamps: true
});

const Conversation = model("Conversation", conversationSchema);

module.exports = Conversation;