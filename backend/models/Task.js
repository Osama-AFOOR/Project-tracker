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
    enum: ["Open", "In Progress", "Completed", "On Hold" , "Canceled"], // allowed values
    default: "Open"
  },
  imageUrl: [{ type: String }],                     // Multiple images
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Linked user

  // ✅ New: comments array
  comments: [
    {
      text: { type: String, required: true },       // Comment text
      images: [{ type: String }],                   // Optional images
      date: { type: Date, default: Date.now }       // Auto-set date
    }
  ]
});

// Export the model
module.exports = mongoose.model('Task', TaskSchema);