
import express from "express";

import { registerUser,loginUser,myProfile,getAlluser } from "../controllers/user.js";
import { isAuth } from "../middlewares/isAuth.js";
const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", isAuth, myProfile);
router.get("/getusers", isAuth, getAlluser);

export default router;