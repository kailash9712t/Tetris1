import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    messageId: {
        type: String,
        require: true,
        unique: true,
    },
    message: {
        type: String,
        require: true,
    },
    from: {
        type: String,
        require: true,
    },
    timeStamp: {
        type: String,
        require: true,
    },
    seen: {
        type: Number,
        require: true,
    },
});

const ChatSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        require: true,
    },
    Chats: [MessageSchema],
});


const chatSchema = mongoose.model("ChatSchema", ChatSchema, "PendingChats");

export default chatSchema;