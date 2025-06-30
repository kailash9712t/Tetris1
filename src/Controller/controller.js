import dbConnection from '../DB/MongooseConnection.js';
import User from "../Model/UserModel.js";
import HashOperation from "../Utils/hashOperation.js";
import generate from '../Utils/genrateRandom.js';
import cloudinary from '../DB/CloudinaryConnection.js';
import { Tokens } from './generateTokens.js';
import chats from '../Model/ChatsModel.js';

// mongoose connection
await dbConnection();

const Test = {
    HomeRoute: async (req, res) => {
        res.status(200).send("this is home page");
    }
}


const Authentication = {
    Login: async (req, res) => {
        const { EmailOrUsername, password } = req.body;
        const requiredField = {
            "timeStamp": 0,
            "_id": 0,
            "authprovider": 0,
            "__v": 0,
            "Status": 0
        }
        const check = await User.find({ email: EmailOrUsername }, requiredField).collation({ locale: "en" })
        if (check.length == 0) {
            res.status(400).send("User Not Found");
            return;
        }
        const validOrNot = await HashOperation.compareHash(check[0]["password"], password);
        if (validOrNot) {
            const tokens = {
                "accessToken": await Tokens.generateToken(true),
                "refreshToken": await Tokens.generateToken(false)
            }
            res.status(200).send({ ...check[0]["_doc"], ...tokens });
        } else {
            res.status(500).send(null);
        }
    },
    Register: async (req, res) => {

        const { Username, Password, Email, MobileNumber } = req.body;

        if (!Username || !Password || !Email || !MobileNumber) {
            res.status(400).send("Bad request");
            return;
        }

        const newUser = User({ username: Username, password: Password, email: Email, mobileNumber: MobileNumber });

        await newUser.save();

        res.status(200).send({
            "accessToken": await Tokens.generateToken(true),
            "refreshToken": await Tokens.generateToken(false)
        });
    },

    // Register: async (req, res) => {
    //     console.log("new request");
    //     const {
    //         Username,
    //         Password,
    //         Email,
    //         DisplayName,
    //         Bio,
    //         AuthProvider,
    //         MobileNumber,
    //     } = req.body;
    //     const file = req.file;
    //     console.log(file);
    //     if (!Username || !Email || !DisplayName || !AuthProvider) {
    //         console.log("username : -", Username);
    //         console.log("email ", Email);
    //         console.log("displayname", DisplayName);
    //         console.log("auth", AuthProvider);
    //         console.log("Required Field is Null");
    //         res.status(400).send("Required Field is Null");
    //         return;
    //     }
    //     var photoUrl = undefined;
    //     if (file) {
    //         photoUrl = await UserApi.uploadImage(file);
    //     }
    //     const user = new User({
    //         username: Username,
    //         email: Email,
    //         password: Password ?? null,
    //         displayName: DisplayName,
    //         bio: Bio ?? undefined,
    //         profilePhotoId: photoUrl["secure_url"],
    //         Status: true,
    //         authprovider: AuthProvider,
    //         mobileNumber: MobileNumber,
    //         timeStamp: new Date().toISOString
    //     })
    //     await user.save();
    //     res.status(200).send({
    //         "photoUrl": photoUrl == undefined ? null : photoUrl["secure_url"],
    //         "accessToken": await Tokens.generateToken(true),
    //         "refreshToken": await Tokens.generateToken(false)
    //     });
    // },

}

const UserApi = {
    CompleteProfile: async (req, res) => {
        const { username, displayName = "default.png", bio = "hey , i am using this app" } = req.body;
        const file = req.file;

        if (!username) {
            res.status(400).send("bad request");
            return;
        }

        var photoUrl = undefined;

        if (file) {
            photoUrl = await UserApi.uploadImage(file);
        }

        await User.updateMany({ username: username }, { displayName: displayName, bio: bio, profilePhotoId: photoUrl?.secure_url ?? null });

        res.status(200).send({
            "photoUrl": photoUrl == undefined ? null : photoUrl?.secure_url ?? null
        });
    },
    FetchContactList: async (req, res) => {
        const { searchQuery, ListOfUsers, adminUsername } = req.body;
        console.log("searchQuery ", searchQuery);
        console.log("listOfUsers ", ListOfUsers);
        const requiredField = {
            "username": 1,
            "displayName": 1,
            "mobileNumber": 1,
            "profilePhotoId": 1
        }
        const filterUser = new Map();
        var RetriveData = [];
        if (ListOfUsers.length != 0) {
            RetriveData = await User.find({
                $or: ListOfUsers
            }, requiredField
            );
        }
        console.log(RetriveData);
        for (var i = 0; i < RetriveData.length; i++) {
            if (RetriveData[i].username != adminUsername) {
                filterUser.set(RetriveData[i].mobileNumber, RetriveData[i]);
            }
        }
        const contains = await User.find({ "username": { $regex: searchQuery, $options: "i" } }, requiredField);

        for (var i = 0; i < contains.length; i++) {
            const currentUser = contains[i];
            const test1 = filterUser.has(currentUser["mobileNumber"]);
            if (!test1 && currentUser["username"] != adminUsername) {
                filterUser.set(currentUser["mobileNumber"], currentUser);
            }
        }
        console.log("this is filterUser : - ", filterUser);
        res.status(200).send([...filterUser]);
    },

    uploadImage: async (file) => {
        return new Promise(async (resolve, reject) => {
            const generateUnique = generate.GenerateRandomString(10);
            cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'Whatsapp', public_id: generateUnique }, (error, result) => {
                if (error) {
                    console.log(error);
                    reject(null);
                }
                else {
                    console.log("Image Added!");
                    resolve(result);
                    console.log(result);
                }
            }).end(file.buffer);
        }).catch((error) => {
            console.log("uplaod Image error : - ", error);
        });
    },

    updateImage: async (req, res) => {

        const file = req.file;
        if (!file) {
            res.status(404).send("Missing Fields");
            return;
        }

        const response = await UserApi.uploadImage(file);
        if (!response) {
            res.status(500).send("Internal server error");
            return;
        }
        UserApi.updateUserData(req, res, response["secure_url"]);

    },

    CheckFields: async (req, res) => {
        const { key, value } = req.body;


        const response = await User.find({ [key]: value }).collation({ locale: "en" });


        if (response.length == 0) {
            res.status(200).send("No such id present");
        } else {
            res.status(404).send("Yes user present");
        }
    },
    updateUserData: async (req, res, photoId) => {
        var { username1, key, value } = req.body;

        if (photoId) {
            value = photoId;
        }

        if (!username1 || !key) {
            return res.status(400).send("Missing username or field key.");
        }

        const result = await User.updateOne(
            { username: username1 },
            { $set: { [key]: value } });

        if (result.matchedCount == 0) {
            res.status(404).send("User not found");
        } else {
            res.status(200).send(photoId != null ? { "photoId": photoId } : "Field update seccuessfully");
            return true;
        }
        console.error("MongoDB update error:", err);
        res.status(500).send("Internal server error");
        return false;
    },

    fetchUserProfile: async (req, res) => {
        const { username, requiredField } = req.body;

        if (!username) {
            res.status(404).send("Invalid request");
            return;
        }

        const result = await User.find({ "username": username }, requiredField);

        if (result.length == 0) {
            res.status(400).send("No user Found");
        } else {
            res.status(200).send(result[0]);
        }
    }
}

const OfflineChatSupport = {
    addChat: async (username, newdata) => {

        try {
            await chats.findOneAndUpdate({ username: username }, {
                $push: {
                    Chats: newdata
                }
            }, {
                upsert: true,
            });

        } catch (error) {
            console.log("Error at chatsSupport ", error);
        }
    },
    readChat: async (username) => {

        var dataList = [];
        try {
            const result = await chats.find({ username: username });
            dataList = result;
        } catch (error) {
            console.log("Error at readChat ", error);
        }
        return dataList
    },
    deleteChat: async (username) => {

        try {
            const result = await chats.deleteOne({ username: username });
            if (result.deletedCount == 0) {
                return 0;
            } else {
                return 1;
            }
        } catch (error) {
            console.log("Error at deleteChat : - ", error);
            return 2;
        }
    }
}

export { Test, Authentication, UserApi, OfflineChatSupport };