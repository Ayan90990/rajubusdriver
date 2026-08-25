const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {}

const seedSongs = require('./data/songs');
const Song = require('./models/Song');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

let isMongoConnected = false;

// In-memory fallback store
let memorySongs = seedSongs.map((s, i) => ({ ...s, _id: String(i + 1) }));

// GET all songs
app.get('/api/songs', async (req, res) => {
  if (isMongoConnected) {
    try {
      const dbSongs = await Song.find().sort({ year: 1 });
      if (dbSongs && dbSongs.length > 0) {
        return res.json({ success: true, count: dbSongs.length, data: dbSongs });
      }
    } catch (err) {
      console.error('Error fetching from DB:', err.message);
    }
  }
  res.json({ success: true, count: memorySongs.length, data: memorySongs });
});

// GET single song
app.get('/api/songs/:id', async (req, res) => {
  if (isMongoConnected) {
    try {
      const dbSong = await Song.findById(req.params.id);
      if (dbSong) return res.json({ success: true, data: dbSong });
    } catch (_) {}
  }
  const song = memorySongs.find((s) => s._id === req.params.id);
  if (!song) return res.status(404).json({ success: false, message: 'Song not found' });
  res.json({ success: true, data: song });
});

// POST add a song
app.post('/api/songs', async (req, res) => {
  const { title, artist, videoId, year, channel, file } = req.body;
  if (!title || !artist) {
    return res.status(400).json({ success: false, message: 'title and artist are required' });
  }

  if (isMongoConnected) {
    try {
      const newDbSong = await Song.create({ title, artist, videoId, year, channel, file });
      return res.status(201).json({ success: true, data: newDbSong });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  const newSong = { _id: String(Date.now()), title, artist, videoId, year, channel, file };
  memorySongs.push(newSong);
  res.status(201).json({ success: true, data: newSong });
});

// DELETE a song
app.delete('/api/songs/:id', async (req, res) => {
  if (isMongoConnected) {
    try {
      const deleted = await Song.findByIdAndDelete(req.params.id);
      if (deleted) return res.json({ success: true, message: 'Song deleted from DB' });
    } catch (_) {}
  }
  const idx = memorySongs.findIndex((s) => s._id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Song not found' });
  memorySongs.splice(idx, 1);
  res.json({ success: true, message: 'Song deleted from memory' });
});

// Real-time ABOARD (Active Passengers) tracking via Server-Sent Events
let activeClients = new Set();

function broadcastAboard() {
  const count = activeClients.size;
  const payload = `data: ${JSON.stringify({ aboard: count })}\n\n`;
  for (const client of activeClients) {
    try {
      client.res.write(payload);
    } catch (_) {}
  }
}

// SSE endpoint for live ABOARD count
app.get('/api/aboard/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const client = { id: Date.now() + Math.random(), res };
  activeClients.add(client);
  broadcastAboard();

  req.on('close', () => {
    activeClients.delete(client);
    broadcastAboard();
  });
});

// GET current ABOARD count
app.get('/api/aboard', (req, res) => {
  res.json({ success: true, aboard: activeClients.size });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'BusDriver API running 🚌',
    mongoConnected: isMongoConnected,
    songs: isMongoConnected ? 'MongoDB' : memorySongs.length,
    aboard: activeClients.size
  });
});

app.listen(PORT, () => {
  console.log(`🚌 BusDriver Server running on http://localhost:${PORT}`);
  console.log(`📀 Loaded ${memorySongs.length} songs from memory`);

  // Attempt async non-blocking MongoDB connection
  if (process.env.MONGO_URI) {
    mongoose
      .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 2000 })
      .then(() => {
        console.log('🍃 MongoDB Connected Successfully!');
        isMongoConnected = true;
      })
      .catch((err) => {
        console.log('ℹ️ MongoDB offline/standby — using memory store.');
      });
  }
});


