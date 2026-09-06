// File: models/Task.js

const mongoose = require('mongoose');

// Define how tasks are stored in MongoDB
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },          // Task name
  description: { type: String },                    // Task description
  addDate: { type: Date },                          // Task add date
  responsible: { type: String },                    // Follow-up responsible
  area: { type: String },                           // Task area
  floor: { type: String },                          // Floor
  roomNo: { type: String },                         // Room number
  status: {                                         // Task status (dropdown)
    type: String,
    enum: ["Open", "In Progress", "Completed", "On Hold", "Canceled"], // allowed values
    default: "Open"
  },
  // ✅ Store Cloudinary URLs here
  imageUrl: [{ type: String }],                     // Multiple Cloudinary image URLs
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Linked user

  // ✅ Comments array with optional Cloudinary image URLs
  comments: [
    {
      text: { type: String, required: true },       // Comment text
      images: [{ type: String }],                   // Cloudinary image URLs
      date: { type: Date, default: Date.now }       // Auto-set date
    }
  ]
});

// Export the model
module.exports = mongoose.model('Task', TaskSchema);
