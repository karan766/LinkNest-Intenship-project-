import mongoose from "mongoose";
import User from "../models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

const migrateUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    let updatedCount = 0;

    for (const user of users) {
      let needsUpdate = false;
      const updateData = {};

      // Check and initialize missing fields
      if (!user.pending) {
        updateData.pending = [];
        needsUpdate = true;
      }
      if (!user.request) {
        updateData.request = [];
        needsUpdate = true;
      }
      if (!user.friends) {
        updateData.friends = [];
        needsUpdate = true;
      }

      if (needsUpdate) {
        await User.findByIdAndUpdate(user._id, updateData);
        console.log(`Updated user: ${user.username}`);
        updatedCount++;
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
};

migrateUsers();