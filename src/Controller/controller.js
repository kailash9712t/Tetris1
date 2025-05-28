import dbConnection from '../DB/MongooseConnection.js';
import User from "../Model/UserModel.js";
import HashOperation from "../Utils/hashOperation.js";
import generate from '../Utils/genrateRandom.js';
import cloudinary from '../DB/CloudinaryConnection.js';
import { Tokens } from './generateTokens.js';

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
        const check = await User.find({ username: EmailOrUsername }, { password: 1, _id: 0 }).collation({locale : "en"})
        if (check.length == 0) {
            res.status(400).send("User Not Found");
            return;
        }
        const validOrNot = await HashOperation.compareHash(check[0]["password"], password);
        if (validOrNot) {
            res.status(200).send({
                "accessToken": await Tokens.generateToken(true),
                "refreshToken": await Tokens.generateToken(false)
            });
        } else {
            res.status(500).send(null);
        }
    },
    helper : (req,res) => {
        const file = req.file;
        Authentication.addImage(file);
    },
    addImage: async (file) => { 
        const photoId = "fdjadfkjasdjfn";
        return new Promise(async (resolve, reject) => {
            console.log("Running");
            cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'Whatsapp', public_id: photoId }, (error, result) => {
                if (error) {
                    console.log(error);
                    reject("false");
                }
                else {
                    console.log("Image Added!");
                    resolve("true"); 
                }
            }).end(file.buffer);
        }).catch((error) => {
            console.log("check")
        });  
    },
    uploadImage: async (file, photoId) => {
        return new Promise(async (resolve, reject) => {
            console.log("Running");
            cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'Whatsapp', public_id: photoId }, (error, result) => {
                if (error) {
                    console.log(error);
                    reject("false");
                }
                else {
                    console.log("Image Added!");
                    resolve("true");
                }
            }).end(file.buffer);
        }).catch((error) => {
            console.log("check")
        });
    },
    Register: async (req, res) => {
        console.log("new request");
        const {
            Username,
            Password,
            Email,
            DisplayName,
            Bio,
            AuthProvider, 
            MobileNumber, 
        } = req.body;
        const file = req.file;
        console.log(file);
        if (!Username || !Email || !DisplayName || !AuthProvider) {
            console.log("username : -",Username);
            console.log("email ",Email);
            console.log("displayname",DisplayName);
            console.log("auth",AuthProvider);
            console.log("Required Field is Null");
            res.status(400).send("Required Field is Null");
            return;
        }
        var GenerateRandom = undefined;
        if(file){
            GenerateRandom = generate.GenerateRandomString(10);
        }
        const user = new User({
            username: Username,
            email: Email,
            password: Password ?? null,
            displayName: DisplayName,
            bio: Bio ?? undefined,
            profilePhotoId: GenerateRandom,
            Status: true,
            authprovider: AuthProvider,
            mobileNumber: MobileNumber,
            timeStamp: new Date().toISOString
        })
        await user.save();
        if (file) {
            await Authentication.uploadImage(file, GenerateRandom);
        }
        res.status(200).send({
                "accessToken": await Tokens.generateToken(true),
                "refreshToken": await Tokens.generateToken(false)
            });
    },

}

const UserApi = {
    FetchContactList: async (req, res) => {
        const { searchQuery, ListOfUsers } = req.body;
        const requiredField = {
            "username": 1,
            "displayName": 1,
            "mobileNumber": 1,
            "profilePhotoId": 1
        }
        const filterUser = new Map();
        const RetriveData = await User.find({
            $or: ListOfUsers
        }, requiredField
        );
        for (var i = 0; i < RetriveData.length; i++) {
            filterUser.set(RetriveData[i].mobileNumber, RetriveData[i]);
        }
        const contains = await User.find({ "username": { $regex: searchQuery, $options: "i" } }, requiredField);

        for (var i = 0; i < contains.length; i++) {
            const currentUser = contains[i];
            const test1 = filterUser.has(currentUser.mobileNumber);
            if (!test1) {
                filterUser.set(currentUser[i].mobileNumber, currentUser[i]);
            }
        }
        console.log(filterUser);
        res.status(200).send("Done");
    },

    CheckUsername: async (req,res) => {
        console.log('request');
        const username = req.body.username;
        console.log(username);
        if(!username){
            res.status(401).send("Missing Fields");
            return;
        }

        const requireField = {
            "username" : 1,
            "_id" : 0
        }
        const call = await User.find({"username" : username},requireField).collation({locale : "en"});
        console.log(call);
        if(call.length == 0){
            res.status(200).send(false)
        }else{
            res.status(404).send(true);
        }
    }
}
export { Test, Authentication, UserApi };