// File: seedUsers.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await User.create({ username: "admin", password: hashedPassword, role: "Admin" });

    console.log("Admin user created");
    mongoose.disconnect();
  })
  .catch(err => console.error(err));
