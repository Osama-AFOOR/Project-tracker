// File: server.js

// Import required libraries
require("dotenv").config();
const express = require("express");
//const cors = require("cors");   // ✅ only once here
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cloudinary = require("cloudinary").v2;   // ✅ Cloudinary SDK
const fs = require("fs");                      // ✅ to clean up temp files

// Import database models
const User = require("./models/User");
const Task = require("./models/Task");

const app = express();

// ✅ Configure CORS to allow your frontend Railway domain
//const cors = require("cors");

//app.use(cors({
 // origin: "https://vibrant-rejoicing-production-6299.up.railway.app",
 // methods: ["GET", "POST", "PUT", "DELETE"],
 //// allowedHeaders: ["Content-Type", "Authorization"]
///}));

const allowedOrigins = [
  "http://localhost:3000",
  "https://vibrant-rejoicing-production-6299.up.railway.app"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // ✅ immediately answer preflight
  }
  next();
});

app.use(express.json());


// ✅ Connect to MongoDB (Atlas or local)
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/projectlog")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

// --------------------
// Authentication
// --------------------
app.post("/signup", async (req, res) => {
  const { username, password, role } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashed, role: role || "Viewer" });
  await user.save();
  res.json({ message: "User created successfully" });
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Middleware
function auth(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
}

// --------------------
// Task Management
// --------------------
app.post("/tasks", auth, async (req, res) => {
  const task = new Task({ ...req.body, createdBy: req.user.id });
  await task.save();
  res.json(task);
});

app.get("/tasks", auth, async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// --------------------
// Image Upload (Cloudinary)
// --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "projectlog"
    });
    fs.unlinkSync(req.file.path); // clean up temp file
    res.json({ imageUrl: result.secure_url });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Image upload failed" });
  }
});
// --------------------
// Admin Routes
// --------------------
app.get("/admin/users", auth, authorizeRoles("Admin"), async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.put("/admin/users/:id/role", auth, authorizeRoles("Admin"), async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  user.role = req.body.role;
  await user.save();
  res.json(user);
});

app.delete("/admin/users/:id", auth, authorizeRoles("Admin"), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

app.get("/admin/tasks", auth, authorizeRoles("Admin"), async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

app.delete("/admin/tasks/:id", auth, authorizeRoles("Admin"), async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Task deleted" });
});

app.get("/admin/comments", auth, authorizeRoles("Admin"), async (req, res) => {
  const tasks = await Task.find();
  const allComments = tasks.flatMap(t =>
    t.comments.map(c => ({ ...c.toObject(), taskId: t._id }))
  );
  res.json(allComments);
});

app.delete("/admin/comments/:taskId/:commentId", auth, authorizeRoles("Admin"), async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const comment = task.comments.id(req.params.commentId);
  if (!comment) return res.status(404).json({ error: "Comment not found" });

  comment.remove();
  await task.save();
  res.json({ message: "Comment deleted" });
});

// --------------------
// Server Start
// --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
