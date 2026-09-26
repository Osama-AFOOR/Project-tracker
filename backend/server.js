// File: server.js

// Import required libraries
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

// Import database models
const User = require("./models/User");
const Task = require("./models/Task");
const UserActivity = require("./models/UserActivity"); // ✅ NEW

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Multer setup
const upload = multer({ dest: "uploads/" });

// ✅ Cloudinary upload route
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    fs.unlinkSync(req.file.path); // clean up temp file
    res.json({ url: result.secure_url });

    // ✅ Log activity
    if (req.user) {
      await UserActivity.create({
        userId: req.user.id,
        action: "upload-image",
        details: "Image uploaded"
      });
    }
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
});

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/projectlog")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// --------------------
// Authentication
// --------------------
app.post("/signup", async (req, res) => {
  const { username, password, role } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashed, role: role || "Viewer" });
  await user.save();

  // ✅ Log activity
  await UserActivity.create({
    userId: user._id,
    action: "signup",
    details: `User ${username} signed up`
  });

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
    );

    // ✅ Log activity
    await UserActivity.create({
      userId: user._id,
      action: "login",
      details: `User ${username} logged in`
    });

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
    req.user = decoded;
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

  // ✅ Log activity
  await UserActivity.create({
    userId: req.user.id,
    action: "add-task",
    details: `Task "${task.title}" created`
  });

  res.json(task);
});

app.get("/tasks", auth, async (req, res) => {
  const tasks = await Task.find();

  // ✅ Log activity
  await UserActivity.create({
    userId: req.user.id,
    action: "view-tasks",
    details: "Viewed all tasks"
  });

  res.json(tasks);
});

app.get("/tasks/search", auth, async (req, res) => {
  try {
    const { name, status, area, floor, roomNo, isCritical } = req.query;
    const query = {};

    if (name) query.title = { $regex: name, $options: "i" };
    if (status) query.status = status;
    if (area) query.area = { $regex: area, $options: "i" };
    if (floor) query.floor = floor;
    if (roomNo) query.roomNo = roomNo;
    if (isCritical !== undefined) query.isCritical = isCritical === "true";

    const tasks = await Task.find(query);

    // ✅ Log activity
    await UserActivity.create({
      userId: req.user.id,
      action: "search-tasks",
      details: "Performed task search"
    });

    res.json(tasks);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Error searching tasks", details: err.message });
  }
});

app.get("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    // ✅ Log activity
    await UserActivity.create({
      userId: req.user.id,
      action: "view-task",
      details: `Viewed task "${task.title}"`
    });

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: "Error fetching task", details: err.message });
  }
});

app.put("/admin/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const allowedStatuses = ["Open", "In Progress", "Completed", "On Hold", "Canceled"];
    if (req.body.status && !allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    if (req.user.role === "Viewer") {
      return res.status(403).json({ error: "Viewers cannot edit tasks" });
    }

    if (req.user.role === "Editor" && task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Editors can only edit their own tasks" });
    }

    if (req.user.role === "Approver") {
      if (req.body.status) {
        task.status = req.body.status;
        await task.save();

        // ✅ Log activity
        await UserActivity.create({
          userId: req.user.id,
          action: "approve-task",
          details: `Approved status change for task "${task.title}"`
        });

        return res.json(task);
      } else {
        return res.status(400).json({ error: "Status is required for Approver updates" });
      }
    }

    if (req.user.role === "Admin" || req.user.role === "Editor") {
      const updateFields = [
        "title", "description", "status", "imageUrl",
        "responsible", "area", "floor", "roomNo", "isCritical"
      ];
      updateFields.forEach(field => {
        if (req.body[field] !== undefined) {
          task[field] = req.body[field];
        }
      });
      await task.save();

      // ✅ Log activity
      await UserActivity.create({
        userId: req.user.id,
        action: "edit-task",
        details: `Edited task "${task.title}"`
      });

      return res.json(task);
    }

    res.status(403).json({ error: "Unauthorized" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Error updating task", details: err.message });
  }
});

// --------------------
// Comments
// --------------------
app.post("/tasks/:id/comments", auth, async (req, res) => {
  const { text, images } = req.body;
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const newComment = { text, images: images || [], date: new Date() };
  task.comments.push(newComment);
  await task.save();

    // ✅ Log activity
  await UserActivity.create({
    userId: req.user.id,
    action: "add-comment",
    details: `Added comment to task "${task.title}"`
  });

  res.status(201).json(newComment);
});

app.put("/tasks/:taskId/comments/:commentId", auth, async (req, res) => {
  const { text, images } = req.body;
  const task = await Task.findById(req.params.taskId);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const comment = task.comments.id(req.params.commentId);
  if (!comment) return res.status(404).json({ error: "Comment not found" });

  if (text !== undefined) comment.text = text;
  if (images !== undefined) comment.images = images;
  comment.date = new Date();

  await task.save();

  // ✅ Log activity
  await UserActivity.create({
    userId: req.user.id,
    action: "edit-comment",
    details: `Edited comment on task "${task.title}"`
  });

  res.json(comment);
});

app.delete("/tasks/:taskId/comments/:commentId", auth, async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const comment = task.comments.id(req.params.commentId);
  if (!comment) return res.status(404).json({ error: "Comment not found" });

  comment.deleteOne();
  await task.save();

  // ✅ Log activity
  await UserActivity.create({
    userId: req.user.id,
    action: "delete-comment",
    details: `Deleted comment from task "${task.title}"`
  });

  res.json({ message: "Comment deleted" });
});

// --------------------
// Admin Routes
// --------------------
app.get("/admin/users", auth, authorizeRoles("Admin"), async (req, res) => {
  const users = await User.find();

  // ✅ Log activity
  await UserActivity.create({
    userId: req.user.id,
    action: "view-users",
    details: "Admin viewed all users"
  });

  res.json(users);
});

app.put("/admin/users/:id/role", auth, authorizeRoles("Admin"), async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  user.role = req.body.role;
  await user.save();

  // ✅ Log activity
  await UserActivity.create({
    userId: req.user.id,
    action: "change-role",
    details: `Changed role for user ${user.username}`
  });

  res.json(user);
});

app.delete("/admin/users/:id", auth, authorizeRoles("Admin"), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);

  // ✅ Log activity
  await UserActivity.create({
    userId: req.user.id,
    action: "delete-user",
    details: `Deleted user with ID ${req.params.id}`
  });

  res.json({ message: "User deleted" });
});

app.get("/admin/tasks", auth, authorizeRoles("Admin"), async (req, res) => {
  const tasks = await Task.find();

  // ✅ Log activity
  await UserActivity.create({
    userId: req.user.id,
    action: "view-tasks-admin",
    details: "Admin viewed all tasks"
  });

  res.json(tasks);
});

app.delete("/admin/tasks/:id", auth, authorizeRoles("Admin"), async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);

  // ✅ Log activity
  await UserActivity.create({
    userId: req.user.id,
    action: "delete-task",
    details: `Deleted task with ID ${req.params.id}`
  });

  res.json({ message: "Task deleted" });
});

app.get("/admin/comments", auth, authorizeRoles("Admin"), async (req, res) => {
  const tasks = await Task.find();
  const allComments = tasks.flatMap(t =>
    t.comments.map(c => ({ ...c.toObject(), taskId: t._id }))
  );

  // ✅ Log activity
  await UserActivity.create({
    userId: req.user.id,
    action: "view-comments-admin",
    details: "Admin viewed all comments"
  });

  res.json(allComments);
});

app.delete("/admin/comments/:taskId/:commentId", auth, authorizeRoles("Admin"), async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const comment = task.comments.id(req.params.commentId);
  if (!comment) return res.status(404).json({ error: "Comment not found" });

  comment.deleteOne();
  await task.save();

  // ✅ Log activity
  await UserActivity.create({
    userId: req.user.id,
    action: "delete-comment-admin",
    details: `Admin deleted comment from task "${task.title}"`
  });

  res.json({ message: "Comment deleted" });
});

// --------------------
// Activities Endpoint
// --------------------
app.get("/activities/recent", auth, async (req, res) => {
  try {
    const activities = await UserActivity.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(10);
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

// --------------------
// Server Start
// --------------------
const PORT = 5000; // ✅ use Railway’s PORT
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});