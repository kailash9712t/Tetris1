import mongoose from "mongoose";
import HashOperation from '../Utils/hashOperation.js';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        require: true,
        unique: true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        require: true
    },
    displayName: {
        type: String,
        default : "user"
    },
    profilePhotoId: {
        type: String,
        default: "default.png"
    },
    bio: {
        type: String,
        default: "hey , i am using this app"
    },
    Status: {
        type: Boolean,
        default: true,
        require: true
    },
    authprovider: {
        type: Object,
        require: true
    },
    timeStamp: {
        type: String,
        require: true
    },
    mobileNumber: {
        type: Number,
        require: true,
        unique: true
    },
},);
UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        try {
            console.log(this.password);
            this.password = await HashOperation.GenerateHash(this.password);
            console.log(this.password);
        } catch (error) {
            next(error);
        }
    }
    next();
});

const user = mongoose.model("UserModel", UserSchema);

export default user;