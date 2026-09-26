// File: models/UserActivity.js
const mongoose = require("mongoose");

// Schema for recording user activities
const userActivitySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  action: { 
    type: String, 
    required: true 
  }, // e.g. "login", "logout", "add-task", "edit-task", "view-task"
  details: { 
    type: String 
  }, // optional description of the activity
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

// Export the model
module.exports = mongoose.model("UserActivity", userActivitySchema);
