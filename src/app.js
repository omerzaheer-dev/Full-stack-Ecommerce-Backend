import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express()
app.options('*', cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
//for origins we use cors
app.use(express.json({limit: "16kb"}))
//we not accept unlimited json response due to unliited responses server crashes we use limit
app.use(express.urlencoded({extended: true , limit: "16kb"}))
//for getting data from url umar+zaheer%sandhu eg we use urlencoded
const publicDirPath = process.cwd();
app.use(express.static(`${publicDirPath}/src/public`))
//to keep images videofiles in public folder
app.use(cookieParser())

//routes

import userRouter from './routes/user.routes.js'
import adminRouter from "./routes/admin.routes.js"
import productRoutes from "./routes/product.routes.js"
import cartRoutes from "./routes/cart.routes.js"
import paymentRoutes from "./routes/payment.routes.js"

//routes decelaration

app.use("/api/v1/users" , userRouter);
app.use("/api/v1/admin" , adminRouter);
app.use("/api/v1/product" , productRoutes);
app.use("/api/v1/cart" , cartRoutes);
app.use("/api/v1/payment" , paymentRoutes);

// app.use("/api/v1/p" , parsingRoute);
app.get('/', (req, res) => {
    res.send('Hello World!');
  });


export { app }
