import express from "express";
import User from "../models/userModel.js";
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
	friends,
	likes,
	getNotifications,
	markNotificationAsRead,
	markAllNotificationsAsRead,
	getUnreadNotificationCount,
	cleanupDuplicateFriends,
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
router.post("/followers", followers);
router.post("/following", following);
router.post("/friends", friends);
router.get("/friends/:userId", friends); // New GET route for friends
router.post("/remove", remove);
router.post("/likes", likes);
router.post("/removed", removed);
router.post("/Search", Search);
router.post("/search-action", toggle);

// Notification routes
router.get("/notifications", protectRoute, getNotifications);
router.put("/notifications/:notificationId/read", protectRoute, markNotificationAsRead);
router.put("/notifications/mark-all-read", protectRoute, markAllNotificationsAsRead);
router.get("/notifications/unread-count", protectRoute, getUnreadNotificationCount);

export default router;
