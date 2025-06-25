import { Router } from "express";
import asynchandler from "../Utils/asyncHandler.js";
import {Test , Authentication, UserApi, OfflineChatSupport} from '../Controller/controller.js';
import multer,{memoryStorage} from 'multer';
import {Tokens} from "../Controller/generateTokens.js";
import { verifyJwt } from "../MiddleWare/verifyjwt.js";

const Route = Router();

const upload = multer({storage : memoryStorage()});

//Testing Routes 
Route.route("/").post(asynchandler(Test.HomeRoute));

//Authentication Routes 
Route.route("/Register").post(asynchandler(Authentication.Register));
Route.route("/Login").post(asynchandler(Authentication.Login));
Route.route("/generateToken").post(verifyJwt,Tokens.generateToken);
 
//User Routes   
Route.route("/CompleteProfile").post(upload.single('file'),asynchandler(UserApi.CompleteProfile));
Route.route("/FetchContact").post(asynchandler(UserApi.FetchContactList)); 
Route.route("/checkFields").post(asynchandler(UserApi.CheckFields));
Route.route("/updateData").post(verifyJwt ,asynchandler(UserApi.updateUserData));
Route.route("/userMetaData").post(asynchandler(UserApi.fetchUserProfile));
Route.route("/uplaodImage").post(upload.single('file'),asynchandler(UserApi.updateImage));

 
export default Route;    