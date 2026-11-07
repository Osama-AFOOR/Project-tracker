// backend/models/WorkRecord.js

const mongoose = require("mongoose");

const activitySchema =
  new mongoose.Schema(
    {
      timeSlot: {
        type: String,
        default: ""
      },

      activity: {
        type: String,
        required: true
      },

      discipline: {
        type: String,
        default: ""
      },

      progress: {
        type: Number,
        default: 0
      },

      status: {
        type: String,
        default: "Ongoing"
      },

      comments: {
        type: String,
        default: ""
      },

      photos: [
        {
          type: String
        }
      ]
    },
    {
      _id: true
    }
  );

const workRecordSchema =
  new mongoose.Schema(
    {
      date: {
        type: Date,
        required: true
      },

      owner: {
        type: String,
        default: "Owner 1",
        enum: [
          "Owner 1",
          "Owner 2",
          "Owner 3"
        ]
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
          type:
            mongoose.Schema.Types.ObjectId,
          ref: "Resource"
        }
      ],

      activities: [
        activitySchema
      ],

      createdBy: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    },
    {
      timestamps: true
    }
  );

module.exports =
  mongoose.model(
    "WorkRecord",
    workRecordSchema
  );