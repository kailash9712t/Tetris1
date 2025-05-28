import jwt from 'jsonwebtoken';
import 'dotenv/config';

const verifyJwt = (req,res,next) => {
    const rawToken = req.headers["authorization"];
    const token = rawToken.split(" ")[1];
    if(token){
        jwt.verify(token,process.env.TokenPassword,(decode,error) => {
            if(error){
                console.log("Invalid Token");
                res.status(401).send("Invalid Token");
                return;
            }else{
                res.status.send("Valid Token");
                next();
            }
        });
    }else{
        res.status(404).send("Token not send with request");
    }
}

export {verifyJwt};