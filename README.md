# 🚌 बस ड्राइवर — Bus Driver Playlist (MERN Clone)

A full MERN stack clone of [busdriver.wtf](https://busdriver.wtf/) — a nostalgic 80s & 90s Hindi songs jukebox themed around the iconic Indian bus driver dashboard vibe.

## Features

- 🎵 Streams songs live via YouTube IFrame API (no audio files hosted)
- 🚌 Road-shaped progress bar with a moving bus icon
- 🎪 Animated jhalar tassels at the top
- 📺 Scrolling destination board marquee (NH 48 · Delhi – Mumbai)
- 🔀 No-repeat shuffle queue
- 📯 Horn easter egg (Web Audio synth)
- 🌐 Online listener count badge
- 📱 Fully responsive (mobile first)
- 🗄️ MongoDB backend with songs API
- 🔄 Graceful fallback if backend is offline

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React 18, react-youtube, Axios    |
| Backend  | Node.js, Express.js               |
| Database | MongoDB, Mongoose                 |
| Fonts    | Baloo 2, Noto Sans Devanagari     |

## Project Structure

```
busdriver-clone/
├── client/                  # React frontend
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── Tassels.js         # Animated jhalar tassels
│       │   ├── DestinationBoard.js # Scrolling marquee
│       │   ├── Player.js          # Main music player
│       │   ├── RoadProgress.js    # Road progress bar
│       │   └── Playlist.js        # Song list panel
│       ├── hooks/
│       │   └── useSongs.js        # API fetch + fallback
│       ├── App.js
│       ├── App.css
│       └── index.css
├── server/                  # Express backend
│   ├── models/
│   │   └── Song.js          # Mongoose schema
│   ├── routes/
│   │   └── songs.js         # CRUD API routes
│   ├── data/
│   │   └── songs.js         # Seed data (15 songs)
│   ├── index.js             # Express server
│   ├── seed.js              # DB seeder
│   └── .env
└── package.json
```

## Setup & Run

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) OR MongoDB Atlas URI

### 1. Install dependencies

```bash
# Install server deps
cd server
npm install

# Install client deps
cd ../client
npm install
```

### 2. Configure environment

Edit `server/.env`:
```env
MONGO_URI=mongodb://localhost:27017/busdriver
PORT=5000
```

For MongoDB Atlas, replace the URI with your connection string.

### 3. Seed the database

```bash
cd server
node seed.js
```

### 4. Run the app

Open **two terminals**:

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm start
```

App opens at **http://localhost:3000**

> **Note:** If the backend is offline, the app automatically falls back to a local playlist of 12 songs — so the player always works.

## API Endpoints

| Method | Endpoint       | Description         |
|--------|----------------|---------------------|
| GET    | /api/songs     | Get all songs       |
| GET    | /api/songs/:id | Get one song        |
| POST   | /api/songs     | Add a new song      |
| DELETE | /api/songs/:id | Delete a song       |
| GET    | /api/health    | Health check        |

## Adding Songs

Songs stream from YouTube. To add a song, POST to `/api/songs`:

```json
{
  "title": "Song Name",
  "artist": "Singer — Movie/Album",
  "videoId": "YouTube_Video_ID",
  "year": 1994,
  "channel": "T-Series"
}
```

Or add entries directly to `server/data/songs.js` and re-run `node seed.js`.
