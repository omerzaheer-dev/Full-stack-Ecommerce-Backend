import dotenv from "dotenv";
dotenv.config({
    path: './.env'
})
const PORT = process.env.PORT || 8080

import { app } from './app.js';
import connectDB from "./db/index.js";
// import { DB_NAME } from "./constants.js";

connectDB()
.then(() => {
    app.listen(PORT , () => {
        console.log(`server is running at port ${PORT}`);
    })
})
.catch((err) => {
    console.log("Mongo db connection failed ",err);
})