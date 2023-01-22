import express from "express"
import { getUser, signIn, signUp, verifyToken } from "../controller/user-controller.js";

const router = express.Router()

router.post("/signup",signUp)
router.post("/signin",signIn)
router.get("/user",verifyToken, getUser)

//verify token

export default router;