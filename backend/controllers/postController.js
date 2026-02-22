import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import { v2 as cloudinary } from "cloudinary";

const createPost = async (req, res) => {
	try {
		const { postedBy, text } = req.body;
		let { img } = req.body;

		if (!postedBy || !text) {
			return res.status(400).json({ error: "Postedby and text fields are required" });
		}

		const user = await User.findById(postedBy);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		if (user._id.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "Unauthorized to create post" });
		}

		const maxLength = 500;
		if (text.length > maxLength) {
			return res.status(400).json({ error: `Text must be less than ${maxLength} characters` });
		}

		if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img);
			img = uploadedResponse.secure_url;
		}

		const newPost = new Post({ postedBy, text, img });
		await newPost.save();

		res.status(201).json(newPost);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const getPost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		res.status(200).json(post);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		if (post.postedBy.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "Unauthorized to delete post" });
		}

		if (post.img) {
			const imgId = post.img.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imgId);
		}

		await Post.findByIdAndDelete(req.params.id);

		res.status(200).json({ message: "Post deleted successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const likeUnlikePost = async (req, res) => {
	try {
		const { id: postId } = req.params;
		const userId = req.user._id;

		const post = await Post.findById(postId).populate('postedBy', 'username profilePic');

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const userLikedPost = post.likes.includes(userId);

		if (userLikedPost) {
			// Unlike post
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			
			// Remove like notification if it exists
			try {
				await Notification.findOneAndDelete({
					recipient: post.postedBy._id,
					sender: userId,
					type: "like",
					"data.postId": postId
				});
			} catch (notifError) {
				// Handle error silently
			}
			
			res.status(200).json({ message: "Post unliked successfully" });
		} else {
			// Like post
			post.likes.push(userId);
			await post.save();
			
			// Create like notification (only if not liking own post)
			if (post.postedBy._id.toString() !== userId.toString()) {
				try {
					const liker = await User.findById(userId);
					await Notification.create({
						recipient: post.postedBy._id,
						sender: userId,
						type: "like",
						message: `${liker.username} liked your post`,
						data: {
							postId: postId,
							postText: post.text.length > 50 ? post.text.substring(0, 50) + "..." : post.text,
							senderUsername: liker.username,
							senderProfilePic: liker.profilePic,
						},
					});
				} catch (notifError) {
					// Handle error silently
				}
			}
			
			res.status(200).json({ message: "Post liked successfully" });
		}
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const replyToPost = async (req, res) => {
	try {
		const { text } = req.body;
		const postId = req.params.id;
		const userId = req.user._id;
		const userProfilePic = req.user.profilePic;
		const username = req.user.username;

		if (!text) {
			return res.status(400).json({ error: "Text field is required" });
		}

		const post = await Post.findById(postId).populate('postedBy', 'username profilePic');
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const reply = { userId, text, userProfilePic, username };

		post.replies.push(reply);
		await post.save();

		// Create comment notification (only if not replying to own post)
		if (post.postedBy._id.toString() !== userId.toString()) {
			try {
				await Notification.create({
					recipient: post.postedBy._id,
					sender: userId,
					type: "comment",
					message: `${username} commented on your post`,
					data: {
						postId: postId,
						postText: post.text.length > 50 ? post.text.substring(0, 50) + "..." : post.text,
						commentText: text.length > 50 ? text.substring(0, 50) + "..." : text,
						senderUsername: username,
						senderProfilePic: userProfilePic,
					},
				});
			} catch (notifError) {
				// Handle error silently
			}
		}

		res.status(200).json(reply);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const getFeedPosts = async (req, res) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// Get pagination parameters from query
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 6; // Default to 6 posts per page
		const skip = (page - 1) * limit;

		// Use friends array instead of following for the feed
		const friends = user.friends || [];

		// Include the user's own posts along with posts from friends
		const feedPosts = await Post.find({ postedBy: { $in: [...friends, userId] } })
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.populate('postedBy', 'username profilePic name');

		// Get total count for pagination info
		const totalPosts = await Post.countDocuments({ postedBy: { $in: [...friends, userId] } });
		const totalPages = Math.ceil(totalPosts / limit);
		const hasMore = page < totalPages;
		
		res.status(200).json({
			posts: feedPosts,
			pagination: {
				currentPage: page,
				totalPages,
				totalPosts,
				hasMore,
				limit
			}
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const getUserPosts = async (req, res) => {
	const { username } = req.params;
	try {
		// Decode URL encoding for usernames with special characters
		const decodedUsername = decodeURIComponent(username);
		const user = await User.findOne({ username: decodedUsername });
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const posts = await Post.find({ postedBy: user._id }).sort({ createdAt: -1 });

		res.status(200).json(posts);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export { createPost, getPost, deletePost, likeUnlikePost, replyToPost, getFeedPosts, getUserPosts };
