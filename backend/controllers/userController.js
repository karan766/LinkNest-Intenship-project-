import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

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
      // query is username
      user = await User.findOne({ username: query })
        .select("-password")
        .select("-updatedAt");
    }

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in getUserProfile: ", err.message);
  }
};

const signupUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      return res.status(400).json({ error: "User already exists" });
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
    console.log("Error in signupUser: ", err.message);
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
    console.log("Error in loginUser: ", error.message);
  }
};

const logoutUser = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 1 });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in signupUser: ", err.message);
  }
};

const reqArray = async (req, res) => {
  let info = await req.body;
  let email = info.email;
  try {
    let data = await User.findOne({ email });
    let arr = [];

    for (let i = 0; i < data.request.length; i++) {
      let throwAway = await User.findOne({ _id: data.request[i] });
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
    console.log("Error in updateUser: ", error.message);
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
      $pull: { followers: userToModify._id },
    });
    await User.findByIdAndUpdate(userToModify._id, {
      $pull: { following: currentUser._id },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in updateUser: ", error.message);
  }
};

const toggle = async (req, res) => {
  let info = await req.body;
  let username = info.username;
  let currentUserId = info.user;
  let status = info.status;
  try {
    let userToModify = await User.findOne({ username });
    let currentUser = await User.findOne({ _id: currentUserId });

    if (status == "Request") {
      await User.findByIdAndUpdate(currentUser._id, {
        $push: { pending: userToModify._id },
      });
      await User.findByIdAndUpdate(userToModify._id, {
        $push: { request: currentUser._id },
      });
    } else if (status == "Requested") {
      await User.findByIdAndUpdate(currentUser._id, {
        $pull: { pending: userToModify._id },
      });
      await User.findByIdAndUpdate(userToModify._id, {
        $pull: { request: currentUser._id },
      });
    } else {
      await User.findByIdAndUpdate(currentUser._id, {
        $pull: { followers: userToModify._id },
      });
      await User.findByIdAndUpdate(userToModify._id, {
        $pull: { following: currentUser._id },
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in Toggle: ", error.message);
  }
};

const Search = async (req, res) => {
  let info = await req.body;
  let currentUserId = await req.body.user._id;
  if (info.username !== "") {
    try {
      let data = await User.findOne({ username: info.username });
      let currentUser = await User.findOne({ _id: currentUserId });
      if (data == null) {
        res.status(200).json([
          {
            name: info.user.name,
            username: info.user.username,
            profilePic: info.user.profilePic,
            status: "NotFound",
            bio: "",
            followers: 0,
          },
        ]);
      } else {
        let status = "Request";
        if (currentUser.following.includes(data._id)) {
          status = "Following";
        } else if (currentUser.pending.includes(data._id)) {
          status = "Requested";
        }
        let obj = {
          name: data.name,
          username: data.username,
          profilePic: data.profilePic,
          status: status,
          bio: data.bio,
          followers: data.followers.length,
        };
        res.status(200).json([obj]);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
      console.log("Error in Search: ", error.message);
    }
  }
};

// const Search = async (req, res) => {
//   let info = await req.body;
//   let currentUserId = await req.body.user._id;
//   if (info.username !== "") {
//     try {
//       let data = await User.findOne({ username: info.username });
//       let currentUser = await User.findOne({ _id: currentUserId });
//       console.log(data,currentUser)
//       let status = "Request";
//       if (currentUser.following.includes(data._id)) {
//         status = "Following";
//       } else if (currentUser.pending.includes(data._id)) {
//         status = "Requested";
//       }
//       let obj = {
//         name: data.name,
//         username: data.username,
//         profilePic: data.profilePic,
//         status: status,
//       };
//       res.status(200).json([obj]);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//       console.log("Error in Search: ", error.message);
//     }
//   }
// };

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
    console.log("Error in updateUser: ", error.message);
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
    console.log("Error in updateUser: ", error.message);
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
    console.log("Error in updateUser: ", error.message);
  }
};

const actions = async (req, res) => {
  let info = await req.body;
  let username = info.username;
  let currentUserId = info.user._id;
  try {
    let userToModify = await User.findOne({ username });
    let currentUser = await User.findOne({ _id: currentUserId });

    console.log(userToModify, currentUser._id);

    if (info.action) {
      await User.findByIdAndUpdate(currentUser._id, {
        $pull: { request: userToModify._id },
      });
      await User.findByIdAndUpdate(currentUser._id, {
        $push: { followers: userToModify._id },
      });
      await User.findByIdAndUpdate(userToModify._id, {
        $pull: { pending: currentUser._id },
      });
      await User.findByIdAndUpdate(userToModify._id, {
        $push: { following: currentUser._id },
      });
    } else {
      await User.findByIdAndUpdate(currentUser._id, {
        $pull: { request: userToModify._id },
      });
      await User.findByIdAndUpdate(userToModify._id, {
        $pull: { pending: currentUser._id },
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in updateUser: ", error.message);
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
    console.log("Error in followUnFollowUser: ", err.message);
  }
};

const updateUser = async (req, res) => {
  const { name, email, username, password, bio } = req.body;
  let { profilePic } = req.body;
  const userId = req.user._id;
  try {
    let user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: "User not found" });

    if (req.params.id !== userId.toString())
      return res
        .status(400)
        .json({ error: "You cannot update other user's profile" });

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
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
    console.log("Error in updateUser: ", err.message);
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
};
