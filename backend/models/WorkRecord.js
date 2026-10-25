const mongoose = require("mongoose");

const workRecordSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true
    },

    building: {
      type: String,
      required: true
    },

    area: {
      type: String,
      default: ""
    },

    floor: {
      type: String,
      default: ""
    },

    roomNo: {
      type: String,
      default: ""
    },

    taskTitle: {
      type: String,
      required: true
    },

    taskDescription: {
      type: String,
      default: ""
    },

    resources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource"
      }
    ],

    photos: [
      {
        type: String
      }
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "WorkRecord",
  workRecordSchema
);