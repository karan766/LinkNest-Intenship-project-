import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import Notification from "../models/notificationModel.js";

const getUserProfile = async (req, res) => {
  // We will fetch user profile either with username or userId
  // query is either username or userId
  const { query } = req.params;

  try {
    let user;

    // query is userId
    if (mongoose.Types.ObjectId.isValid(query)) {
      user = await User.findOne({ _id: query })
        .select("-password")
        .select("-updatedAt");
    } else {
      // query is username - decode URL encoding for usernames with special characters
      const decodedQuery = decodeURIComponent(query);
      user = await User.findOne({ username: decodedQuery })
        .select("-password")
        .select("-updatedAt");
    }

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const signupUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    const regex= /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    

    
    if (!regex.test(password)) {
      return res
        .status(400)
        .json({ error: "Password Doesnot Meet The Criteria" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });
    await newUser.save();

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);

      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        bio: newUser.bio,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect)
      return res.status(400).json({ error: "Invalid username or password" });

    if (user.isFrozen) {
      user.isFrozen = false;
      await user.save();
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio,
      profilePic: user.profilePic,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const logoutUser = (req, res) => {
  try {
    // Clear the JWT cookie with proper options
    res.cookie("jwt", "", { 
      maxAge: 1,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });
    
    res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const reqArray = async (req, res) => {
  try {
    // Get user ID from request body (temporary solution)
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Check if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Initialize pending array if it doesn't exist
    if (!user.pending) {
      user.pending = [];
      await user.save();
    }

    const arr = [];
    
    // Check if user has pending requests
    if (user.pending && user.pending.length > 0) {
      // Get details of all users who sent friend requests
      for (let i = 0; i < user.pending.length; i++) {
        try {
          const requesterId = user.pending[i];
          const requester = await User.findById(requesterId);
          if (requester) {
            const obj = {
              name: requester.name,
              username: requester.username,
              profilePic: requester.profilePic,
              _id: requester._id,
            };
            arr.push(obj);
          }
        } catch (err) {
          // Handle error silently
        }
      }
    }
    
    res.status(200).json(arr);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const remove = async (req, res) => {
  let info = await req.body;
  let username = info.username;
  let currentUserId = info.user._id;
  try {
    let userToModify = await User.findOne({ username });
    let currentUser = await User.findOne({ _id: currentUserId });

    await User.findByIdAndUpdate(currentUser._id, {
      $pull: { friends: userToModify._id },
    });
    await User.findByIdAndUpdate(userToModify._id, {
      $pull: { friends: currentUser._id },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// const toggle = async (req, res) => {
//   try {
//     const { requestedUserId, user, status } = req.body; // Destructure req.body
//     const currentUserId = user._id;

//     // Find users
//     const userToModify = await User.findOne({ _id: requestedUserId });
//     const currentUser = await User.findOne({ _id: currentUserId });

//     // Check if the current user is already in the pending or friends list
//     const isPending = userToModify.pending.includes(currentUserId);
//     const isFriend = userToModify.friends.includes(currentUserId);

//     if (!isPending && !isFriend) {
//       // If not friends or pending, add to request and pending lists
//       await User.findByIdAndUpdate(currentUser._id, {
//         $push: { request: userToModify._id },
//       });
//       await User.findByIdAndUpdate(userToModify._id, {
//         $push: { pending: currentUser._id },
//       });

//       // Return the status "Request" (request has been sent)
//       return res.status(200).json({ success: true, status: "Request" });
//     } else if (isPending) {
//       // If already pending, remove from request and pending lists
//       await User.findByIdAndUpdate(currentUser._id, {
//         $pull: { request: userToModify._id },
//       });
//       await User.findByIdAndUpdate(userToModify._id, {
//         $pull: { pending: currentUser._id },
//       });

//       // Return the status "Requested" (request already sent)
//       return res.status(200).json({ success: true, status: "Requested" });
//     } else if (isFriend) {
//       // If they are already friends
//       return res.status(200).json({ success: true, status: "Friend" });
//     }
//   } catch (error) {
//     // Return error response
//     res.status(500).json({ error: error.message });
//     console.error("Error in Toggle: ", error.message);
//   }
// };

const toggle = async (req, res) => {
  try {
    const { requestedUserId, user } = req.body;
    const currentUserId = user._id;

    // Validate input
    if (!requestedUserId || !currentUserId) {
      return res.status(400).json({ success: false, error: "Missing required user IDs" });
    }

    // Prevent sending a request to oneself
    if (requestedUserId === currentUserId) {
      return res.status(400).json({ success: false, error: "Cannot send a request to yourself" });
    }

    // Find users
    const userToModify = await User.findById(requestedUserId);
    const currentUser = await User.findById(currentUserId);

    if (!userToModify || !currentUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Convert ObjectIds to strings for reliable comparison
    const currentUserIdStr = currentUserId.toString();
    const requestedUserIdStr = requestedUserId.toString();

    // Check current relationship status
    const isFriend = currentUser.friends.some(id => id.toString() === requestedUserIdStr);
    const hasOutgoingRequest = currentUser.request.some(id => id.toString() === requestedUserIdStr);
    const hasIncomingRequest = currentUser.pending.some(id => id.toString() === requestedUserIdStr);

    if (isFriend) {
      // Already friends
      return res.status(200).json({ success: true, status: "Friend" });
    }

    if (hasOutgoingRequest) {
      // Cancel outgoing request
      await User.findByIdAndUpdate(
        currentUserId,
        { $pull: { request: requestedUserId } }
      );
      await User.findByIdAndUpdate(
        requestedUserId,
        { $pull: { pending: currentUserId } }
      );

      // Remove notification
      await Notification.findOneAndDelete({
        recipient: requestedUserId,
        sender: currentUserId,
        type: "friend_request"
      });

      return res.status(200).json({ success: true, status: "Request" });
    }

    if (hasIncomingRequest) {
      // Accept incoming request (auto-accept when clicking on someone who sent you a request)
      await User.findByIdAndUpdate(
        currentUserId,
        {
          $pull: { pending: requestedUserId },
          $addToSet: { friends: requestedUserId }
        }
      );
      await User.findByIdAndUpdate(
        requestedUserId,
        {
          $pull: { request: currentUserId },
          $addToSet: { friends: currentUserId }
        }
      );

      // Remove friend request notification and create acceptance notification
      await Notification.findOneAndDelete({
        recipient: currentUserId,
        sender: requestedUserId,
        type: "friend_request"
      });

      await Notification.create({
        recipient: requestedUserId,
        sender: currentUserId,
        type: "friend_accept",
        message: `${currentUser.username} accepted your friend request`,
        data: {
          senderUsername: currentUser.username,
          senderProfilePic: currentUser.profilePic,
        },
      });

      return res.status(200).json({ success: true, status: "Friend" });
    }

    // Send new friend request
    await User.findByIdAndUpdate(
      currentUserId,
      { $addToSet: { request: requestedUserId } }
    );
    await User.findByIdAndUpdate(
      requestedUserId,
      { $addToSet: { pending: currentUserId } }
    );

    // Create notification
    await Notification.create({
      recipient: requestedUserId,
      sender: currentUserId,
      type: "friend_request",
      message: `${currentUser.username} sent you a friend request`,
      data: {
        senderUsername: currentUser.username,
        senderProfilePic: currentUser.profilePic,
      },
    });

    return res.status(200).json({ success: true, status: "Requested" });
  } catch (error) {
    console.error("Error in toggle:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const Search = async (req, res) => {
  const { username, user } = req.body; // Destructure req.body
  const currentUserId = user._id;

  if (username && username.length >= 1) { // Check if username is provided and at least 1 character
    try {
      // Search for users with partial matching (case-insensitive)
      // Use simple string contains logic for better email matching
      const searchQuery = { 
        $or: [
          { username: { $regex: username, $options: 'i' } },
          { name: { $regex: username, $options: 'i' } }
        ],
        _id: { $ne: currentUserId } // Exclude current user from results
      };
      
      const searchedUsers = await User.find(searchQuery).limit(10); // Limit to 10 results
      
      if (searchedUsers.length === 0) {
        // No users found - return empty array
        return res.status(200).json([]);
      }

      // Get current user details for relationship checking
      const currentUser = await User.findById(currentUserId);
      
      // Process each found user
      const responseArray = searchedUsers.map(searchedUser => {
        let status = "Request"; // Default status

        // Check the relationship status
        if (currentUser.friends && currentUser.friends.includes(searchedUser._id)) {
          status = "Friend"; // User is already friends
        } else if (currentUser.following && currentUser.following.includes(searchedUser._id)) {
          status = "Following"; // User is already following the searched user
        } else if (currentUser.pending && currentUser.pending.includes(searchedUser._id)) {
          status = "Requested"; // There is a pending request
        }

        return {
          name: searchedUser.name,
          id: searchedUser._id,
          username: searchedUser.username,
          profilePic: searchedUser.profilePic,
          status: status,
          bio: searchedUser.bio,
          followers: searchedUser.followers ? searchedUser.followers.length : 0,
        };
      });

      return res.status(200).json(responseArray); // Return the user details array
    } catch (error) {
      return res.status(500).json({ error: error.message }); // Return error response
    }
  } else {
    return res.status(400).json({ error: "Username must be at least 1 character." }); // Handle case where username is not provided
  }
};





const removed = async (req, res) => {
  let info = await req.body;
  let username = info.username;
  let currentUserId = info.user._id;
  try {
    let userToModify = await User.findOne({ username });
    let currentUser = await User.findOne({ _id: currentUserId });

    await User.findByIdAndUpdate(currentUser._id, {
      $pull: { following: userToModify._id },
    });
    await User.findByIdAndUpdate(userToModify._id, {
      $pull: { followers: currentUser._id },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const followers = async (req, res) => {
  let info = await req.body;
  let email = info.email;
  try {
    let data = await User.findOne({ email });
    let arr = [];

    for (let i = 0; i < data.followers.length; i++) {
      let throwAway = await User.findOne({ _id: data.followers[i] });
      let obj = {
        name: throwAway.name,
        username: throwAway.username,
        profilePic: throwAway.profilePic,
      };
      arr.push(obj);
    }
    res.status(200).json([...arr]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const following = async (req, res) => {
  let info = await req.body;
  let email = info.email;
  try {
    let data = await User.findOne({ email });
    let arr = [];

    for (let i = 0; i < data.following.length; i++) {
      let throwAway = await User.findOne({ _id: data.following[i] });
      let obj = {
        name: throwAway.name,
        username: throwAway.username,
        profilePic: throwAway.profilePic,
      };
      arr.push(obj);
    }
    res.status(200).json([...arr]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actions = async (req, res) => {
  try {
    const { username, action, user } = req.body;
    const currentUserId = user._id;
    
    // Validate input
    if (!username || action === undefined || !user) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const userToModify = await User.findOne({ username });
    const currentUser = await User.findById(currentUserId);

    if (!userToModify || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if they're already friends to prevent duplicates
    const alreadyFriends = currentUser.friends.some(id => 
      id.toString() === userToModify._id.toString()
    );

    if (alreadyFriends) {
      await Notification.findOneAndDelete({
        recipient: currentUser._id,
        sender: userToModify._id,
        type: "friend_request"
      });
      return res.status(400).json({ 
        error: "Already friends with this user",
        cleanup: true
      });
    }

    // Verify that there's actually a pending request FROM the userToModify TO currentUser
    const hasPendingRequest = currentUser.pending.some(id => 
      id.toString() === userToModify._id.toString()
    );

    if (!hasPendingRequest) {
      // Clean up stale notification if it exists
      const deletedNotification = await Notification.findOneAndDelete({
        recipient: currentUser._id,
        sender: userToModify._id,
        type: "friend_request"
      });
      
      return res.status(400).json({ 
        error: "No pending friend request found. The request may have already been processed.",
        cleanup: true
      });
    }

    if (action === 1) {
      // Accept friend request
      await User.findByIdAndUpdate(
        currentUser._id,
        {
          $pull: { pending: userToModify._id },
          $addToSet: { friends: userToModify._id }
        }
      );
      
      await User.findByIdAndUpdate(
        userToModify._id,
        {
          $pull: { request: currentUser._id },
          $addToSet: { friends: currentUser._id }
        }
      );

      // Remove friend request notification
      await Notification.findOneAndDelete({
        recipient: currentUser._id,
        sender: userToModify._id,
        type: "friend_request"
      });

      // Create acceptance notification
      await Notification.create({
        recipient: userToModify._id,
        sender: currentUser._id,
        type: "friend_accept",
        message: `${currentUser.username} accepted your friend request`,
        data: {
          senderUsername: currentUser.username,
          senderProfilePic: currentUser.profilePic,
        },
      });

    } else {
      // Reject friend request
      await User.findByIdAndUpdate(
        currentUser._id,
        { $pull: { pending: userToModify._id } }
      );
      
      await User.findByIdAndUpdate(
        userToModify._id,
        { $pull: { request: currentUser._id } }
      );

      // Remove friend request notification
      await Notification.findOneAndDelete({
        recipient: currentUser._id,
        sender: userToModify._id,
        type: "friend_request"
      });

    }

    res.status(200).json({ 
      success: true, 
      action: action === 1 ? "accepted" : "rejected" 
    });
  } catch (error) {
    console.error("Error in actions:", error);
    res.status(500).json({ error: error.message });
  }
};

const followUnFollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString())
      return res
        .status(400)
        .json({ error: "You cannot follow/unfollow yourself" });

    if (!userToModify || !currentUser)
      return res.status(400).json({ error: "User not found" });

    const isFollowing = currentUser.following.includes(id);
    const isPending = currentUser.pending.includes(id);

    if (isFollowing || isPending) {
      // Unfollow user

      if (currentUser.pending.includes(userToModify.id)) {
        await User.findByIdAndUpdate(id, { $pull: { request: req.user._id } });
        await User.findByIdAndUpdate(req.user._id, { $pull: { pending: id } });
      } else {
        await User.findByIdAndUpdate(id, {
          $pull: { following: req.user._id },
        });
        await User.findByIdAndUpdate(req.user._id, {
          $pull: { followers: id },
        });
      }

      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // Follow user

      if (!userToModify.request.includes(currentUser.id)) {
        await User.findByIdAndUpdate(id, { $push: { request: req.user._id } });
        await User.findByIdAndUpdate(req.user._id, { $push: { pending: id } });
      }

      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateUser = async (req, res) => {
  const {
    name,
    email,
    username,
    oldPassword,
    bio,
    newPassword,
    confirmPassword,
  } = req.body;
  let { profilePic } = req.body;
  const userId = req.user._id;
  try {
    let user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: "User not found" });

    if (req.params.id !== userId.toString())
      return res
        .status(400)
        .json({ error: "You cannot update other user's profile" });

    // Only handle password change if user provided both old and new passwords
    if (oldPassword && newPassword) {
      // Verify old password
      const samePassword = await bcrypt.compare(oldPassword, user.password);
      if (!samePassword) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      // Validate new password
      const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
      if (!regex.test(newPassword)) {
        return res
          .status(400)
          .json({ error: "Password must contain uppercase, lowercase, and numbers" });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
    } else if (oldPassword || newPassword) {
      // If only one password field is provided, return error
      return res.status(400).json({ 
        error: "Both current password and new password are required to change password" 
      });
    }

    if (profilePic) {
      if (user.profilePic) {
        await cloudinary.uploader.destroy(
          user.profilePic.split("/").pop().split(".")[0]
        );
      }

      const uploadedResponse = await cloudinary.uploader.upload(profilePic);
      profilePic = uploadedResponse.secure_url;
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;
    user.profilePic = profilePic || user.profilePic;
    user.bio = bio || user.bio;

    user = await user.save();

    // Find all posts that this user replied and update username and userProfilePic fields
    await Post.updateMany(
      { "replies.userId": userId },
      {
        $set: {
          "replies.$[reply].username": user.username,
          "replies.$[reply].userProfilePic": user.profilePic,
        },
      },
      { arrayFilters: [{ "reply.userId": userId }] }
    );

    // password should be null in response
    user.password = null;

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSuggestedUsers = async (req, res) => {
  try {
    // exclude the current user from suggested users array and exclude users that current user is already following
    const userId = req.user._id;

    const usersFollowedByYou = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);
    const filteredUsers = users.filter(
      (user) => !usersFollowedByYou.following.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 4);

    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const freezeAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    user.isFrozen = true;
    await user.save();

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const friends = async (req, res) => {
  try {
    // Support both URL params and body for backward compatibility
    const userId = req.params.userId || req.body._id;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    let data = await User.findOne({ _id: userId });
    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Remove duplicates from friends array
    const uniqueFriends = [...new Set(data.friends.map(id => id.toString()))];
    
    let arr = [];

    for (let i = 0; i < uniqueFriends.length; i++) {
      let friend = await User.findOne({ _id: uniqueFriends[i] });
      if (friend) {
        let obj = {
          _id: friend._id,
          name: friend.name,
          username: friend.username,
          profilePic: friend.profilePic,
          bio: friend.bio,
          followers: friend.followers,
          following: friend.following,
          friends: friend.friends,
        };
        arr.push(obj);
      }
    }

    res.status(200).json([...arr]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const likes = async (req, res) => {
  let info = await req.body.postid;

  try {
    let data = await Post.findOne({ _id: info });
    let arr = [];

    for (let i = 0; i < data.likes.length; i++) {
      let throwAway = await User.findOne({ _id: data.likes[i] });
      let obj = {
        name: throwAway.name,
        username: throwAway.username,
        profilePic: throwAway.profilePic,
      };
      arr.push(obj);
    }

    res.status(200).json([...arr]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentUser = await User.findById(userId);
    
    const notifications = await Notification.find({ recipient: userId })
      .populate('sender', 'username profilePic name')
      .sort({ createdAt: -1 })
      .limit(50);

    // Filter out friend request notifications where users are already friends
    const filteredNotifications = notifications.filter(notification => {
      if (notification.type === "friend_request") {
        // Don't show friend request notifications if they're already friends
        return !currentUser.friends?.includes(notification.sender._id.toString());
      }
      return true;
    });

    res.status(200).json(filteredNotifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { read: true }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const cleanupDuplicateFriends = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove duplicates from friends array
    const uniqueFriends = [...new Set(user.friends.map(id => id.toString()))];
    
    await User.findByIdAndUpdate(userId, {
      friends: uniqueFriends
    });
    
    res.status(200).json({ 
      success: true, 
      message: "Duplicate friends removed",
      before: user.friends.length,
      after: uniqueFriends.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUnreadNotificationCount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const count = await Notification.countDocuments({ 
      recipient: userId, 
      read: false 
    });

    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  signupUser,
  loginUser,
  logoutUser,
  followUnFollowUser,
  updateUser,
  getUserProfile,
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
};
