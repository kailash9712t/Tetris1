import mongoose from "mongoose";
import 'dotenv/config';

const URL = process.env.MONGO_DB_CONNECTION_URL;

async function Start() {
    await mongoose.connect(URL).then(() => console.log("Database Connected!")).catch((error) => console.log("Error \n ConnectionError \n ", error));
}
 
export default Start;