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

// Import database models
const User = require("./models/User");
const Task = require("./models/Task");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB (Atlas or local)
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

// ✅ Everyone can see all tasks
app.get("/tasks", auth, async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// ✅ Search tasks with filters
app.get("/tasks/search", auth, async (req, res) => {
  try {
    const { name, status, area, floor, roomNo } = req.query;
    const query = {};

    if (name) query.title = { $regex: name, $options: "i" };
    if (status) query.status = status;
    if (area) query.area = { $regex: area, $options: "i" };
    if (floor) query.floor = floor;
    if (roomNo) query.roomNo = roomNo;

    const tasks = await Task.find(query);
    res.json(tasks);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Error searching tasks", details: err.message });
  }
});

// ✅ Get single task
app.get("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: "Error fetching task", details: err.message });
  }
});

// ✅ Update task with role-based permissions + status validation
app.put("/admin/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Allowed status values
    const allowedStatuses = ["Open", "In Progress", "Completed", "On Hold", "Canceled"];
    if (req.body.status && !allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // Role logic
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
        return res.json(task);
      } else {
        return res.status(400).json({ error: "Status is required for Approver updates" });
      }
    }

    if (req.user.role === "Admin" || req.user.role === "Editor") {
      const updateFields = ["title", "description", "status", "imageUrl", "responsible", "area", "floor", "roomNo"];
      updateFields.forEach(field => {
        if (req.body[field] !== undefined) {
          task[field] = req.body[field];
        }
      });
      await task.save();
      return res.json(task);
    }

    res.status(403).json({ error: "Unauthorized" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Error updating task", details: err.message });
  }
});

// --------------------
// Comments (embedded in Task)
// --------------------
app.post("/tasks/:id/comments", auth, async (req, res) => {
  const { text, images } = req.body;
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const newComment = { text, images: images || [], date: new Date() };
  task.comments.push(newComment);
  await task.save();
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
  res.json(comment);
});

app.delete("/tasks/:taskId/comments/:commentId", auth, async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const comment = task.comments.id(req.params.commentId);
  if (!comment) return res.status(404).json({ error: "Comment not found" });

  comment.remove();
  await task.save();
  res.json({ message: "Comment deleted" });
});

// --------------------
// Image Upload
// --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.post("/upload", upload.single("image"), (req, res) => {
  res.json({ imageUrl: `http://localhost:5000/${req.file.filename}` });
});

app.use(express.static("uploads"));

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
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
