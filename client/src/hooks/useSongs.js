import { useState, useEffect } from 'react';
import axios from 'axios';

export function useSongs() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiBase = process.env.REACT_APP_API_URL || '';
    axios
      .get(`${apiBase}/api/songs`)
      .then((res) => {
        setSongs(res.data.data || FALLBACK_SONGS);
        setLoading(false);
      })
      .catch((err) => {
        console.error('API fetch failed, using fallback songs.', err);
        setSongs(FALLBACK_SONGS);
        setLoading(false);
        setError('Backend offline — playlist is empty');
      });
  }, []);

  return { songs, loading, error };
}

// Add new songs here with their title, artist and local file path.
const FALLBACK_SONGS = [];
