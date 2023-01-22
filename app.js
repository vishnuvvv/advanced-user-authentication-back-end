import express from "express";
import mongoose from "mongoose";
import router from "./routes/user-routes.js";
import cookieParser from "cookie-parser";
import cors from "cors"
import dotenv from "dotenv"
dotenv.config()

mongoose.set("strictQuery", false);
const app = express();
app.use(cors({credentials: true, origin:"http://localhost:3000"}))
app.use(cookieParser());
app.use(express.json());
app.use("/api", router);

mongoose
  .connect(
    `mongodb+srv://admin:${process.env.MONGODB_PASSWORD}@cluster0.qybebrq.mongodb.net/auth?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(5000);
    console.log("database is connected and listening to port 5000");
  })
  .catch((err) => console.log(err));

/*
const app = express();
app.use("/api",(req,res,next)=>{
    res.send("Hello world")
});
app.listen(5000,()=>{
    console.log("listening to localhost 5000")
})
*/

//fXb2YRVIrRiYX22h
