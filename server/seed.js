const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {}

const Song = require('./models/Song');
const songs = require('./data/songs');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/busdriver';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected for seeding...');

    await Song.deleteMany();
    console.log('Cleared existing songs.');

    const formattedSongs = songs.map(({ _id, ...rest }) => rest);
    await Song.insertMany(formattedSongs);
    console.log(`Seeded ${formattedSongs.length} songs successfully into MongoDB Atlas!`);

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
