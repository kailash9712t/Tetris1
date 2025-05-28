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
Route.route("/addImage").post(upload.single('file'), asynchandler(Authentication.helper));
 
//User Routes   
Route.route("/UpdateId").post(asynchandler(UserApi.FetchContactList)); 
Route.route("/checkUsername").post(asynchandler(UserApi.CheckUsername));
 
Route.route("/UploadImage").post(upload.single("file"),Authentication.uploadImage);
export default Route;    