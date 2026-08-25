const mongoose = require('mongoose');

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    artist: {
      type: String,
      required: true,
      trim: true
    },
    videoId: {
      type: String,
      trim: true
    },
    file: {
      type: String,
      trim: true
    },
    year: {
      type: Number
    },
    channel: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Song', songSchema);
