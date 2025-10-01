
import express from "express";
const router = express.Router();
import { isAuth,isAdmin } from "../middlewares/isAuth.js";
import { StoryCreate,getAllStories, getSingleStory,getMyStories,createCheckoutSession,verifyPayment} from "../controllers/story.js";
import uploadFile from "../middlewares/multer.js";

router.post("/post", isAuth, isAdmin("admin"), uploadFile, StoryCreate);
router.get("/all", isAuth, getAllStories);
router.get("/story/:id", isAuth, getSingleStory);
router.get("/mystories", isAuth, getMyStories);
//r//outer.post("/subscribe/:id", isAuth, subscribeToStory);
router.post("/create-checkout-session/:id",isAuth,createCheckoutSession);
router.post('/verify',isAuth,verifyPayment)
export default router;
