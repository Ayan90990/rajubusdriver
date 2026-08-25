const express = require('express');
const router = express.Router();
const Song = require('../models/Song');

// GET all songs
router.get('/', async (req, res) => {
  try {
    const songs = await Song.find().sort({ year: 1 });
    res.json({ success: true, count: songs.length, data: songs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single song
router.get('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ success: false, message: 'Song not found' });
    res.json({ success: true, data: song });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST add a song
router.post('/', async (req, res) => {
  try {
    const song = await Song.create(req.body);
    res.status(201).json({ success: true, data: song });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE a song
router.delete('/:id', async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) return res.status(404).json({ success: false, message: 'Song not found' });
    res.json({ success: true, message: 'Song deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
