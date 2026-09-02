// File: models/User.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed password
  role: { 
    type: String, 
    enum: ["Admin", "Approver", "Editor", "Viewer"], 
    default: "Viewer" 
  }
});

module.exports = mongoose.model("User", userSchema);
