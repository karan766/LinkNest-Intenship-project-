import express from "express";
import {
	followUnFollowUser,
	getUserProfile,
	loginUser,
	logoutUser,
	signupUser,
	updateUser,
	getSuggestedUsers,
	freezeAccount,
	reqArray,
	actions,
	followers,
	following,
	remove,
	removed,
	Search,
	toggle,
} from "../controllers/userController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/profile/:query", getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/follow/:id", protectRoute, followUnFollowUser); // Toggle state(follow/unfollow)
router.put("/update/:id", protectRoute, updateUser);
router.put("/freeze", protectRoute, freezeAccount);
router.post("/request", reqArray);
router.post("/actions", actions);
router.post("/followers",protectRoute, followers);
router.post("/following",protectRoute, following);
router.post("/remove", remove);
router.post("/removed", removed);
router.post("/Search",protectRoute, Search);
router.post("/search-action", toggle);

export default router;
