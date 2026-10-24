// File: models/Resource.js

const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    trade: {
      type: String,
      required: true,
      trim: true
    },

    level: {
      type: String,
      required: true,
      trim: true
    },

    company: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      default: "",
      trim: true
    },

    active: {
      type: Boolean,
      default: true
    },

    hireDate: {
      type: Date,
      required: true
    },

    releaseDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Resource", resourceSchema);
