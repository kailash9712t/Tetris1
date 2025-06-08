import { Router } from "express";
import asynchandler from "../Utils/asyncHandler.js";
import {Test , Authentication, UserApi} from '../Controller/controller.js';
import multer,{memoryStorage} from 'multer';
import {Tokens} from "../Controller/generateTokens.js";
import { verifyJwt } from "../MiddleWare/verifyjwt.js";

const Route = Router();

const upload = multer({storage : memoryStorage()});

//Testing Routes 
Route.route("/").post(asynchandler(Test.HomeRoute));

//Authentication Routes 
Route.route("/Register").post(upload.single('file'),asynchandler(Authentication.Register));
Route.route("/Login").post(asynchandler(Authentication.Login));
Route.route("/generateToken").post(verifyJwt,Tokens.generateToken);
 
//User Routes   
Route.route("/FetchContact").post(asynchandler(UserApi.FetchContactList)); 
Route.route("/checkUsername").post(asynchandler(UserApi.CheckUsername));
Route.route("/updateData").post(verifyJwt ,asynchandler(UserApi.updateUserData));
Route.route("/userMetaData").post(asynchandler(UserApi.fetchUserProfile));
Route.route("/uplaodImage").post(upload.single('file'),asynchandler(UserApi.updateImage));
 
export default Route;    