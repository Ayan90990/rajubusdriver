import { useState, useEffect } from 'react';
import axios from 'axios';

const SONG_FILES = [
  ['Aankh Hai Bhari Bhari (Duet Version)', 'Aankh Hai Bhari Bhari (Duet Version) - From _Tum Se Achcha Kaun Hai__spotdown.org.mp3'],
  ['Aankhon Se Tune Kya Keh Diya', 'Aankhon Se Tune Kya Keh Diya_spotdown.org.mp3'],
  ['Aisi Deewangi', 'Aisi Deewangi_spotdown.org.mp3'],
  ['Barsaat Ke Mausam Mein', 'Barsaat Ke Mausam Mein_spotdown.org.mp3'],
  ['Chaaya Hai Jo Dil Pe', 'Chaaya Hai Jo Dil Pe_spotdown.org.mp3'],
  ['Chura Ke Dil Mera', 'Chura Ke Dil Mera_spotdown.org.mp3'],
  ['Dekha Tujhe Toh', 'Dekha Tujhe Toh_spotdown.org.mp3'],
  ['Dekhne Walon Ne', "Dekhne Walon Ne - From ''Chori Chori Chupke Chupke''_spotdown.org.mp3"],
  ['Dhak Dhak Karne Laga', 'Dhak Dhak Karne Laga_spotdown.org.mp3'],
  ['Dil Hai Ke Manta Nahin', 'Dil Hai Ke Manta Nahin_spotdown.org.mp3'],
  ['Dil Hai Tumhaara', 'Dil Hai Tumhaara_spotdown.org.mp3'],
  ['Dil Ka Rishta', 'Dil Ka Rishta_spotdown.org.mp3'],
  ['Dil Mein Dard Sa', 'Dil Mein Dard Sa - From _Kranti__spotdown.org.mp3'],
  ['Dil Mera Tod Diya', 'Dil Mera Tod Diya_spotdown.org.mp3'],
  ['Dil Pardesi Ho Gaya', 'Dil Pardesi Ho Gaya_spotdown.org.mp3'],
  ['Ek Sanam Chahiye Aashiqui Ke Liye', 'Ek Sanam Chahiye Aashiqui Ke Liye_spotdown.org.mp3'],
  ['Ghoonghat Ki Aadh Se', 'Ghoonghat Ki Aadh Se_spotdown.org.mp3'],
  ['Hum Pyaar Hai Tumhare', 'Hum Pyaar Hai Tumhare_spotdown.org.mp3'],
  ['Jaati Hoon Main', 'Jaati Hoon Main_spotdown.org.mp3'],
  ['Jeeta Tha Jiske Liye', 'Jeeta Tha Jiske Liye_spotdown.org.mp3'],
  ['Jo Bhi Kasmein', 'Jo Bhi Kasmein_spotdown.org.mp3'],
  ['Kabhi Hasna Hai Kabhi', 'Kabhi Hasna Hai Kabhi_spotdown.org.mp3'],
  ['Kahin Mujhe Pyar Hua Toh Nahin', 'Kahin Mujhe Pyar Hua Toh Nahin_spotdown.org.mp3'],
  ['Kaho Naa Pyar Hai - Happy', 'Kaho Naa Pyar Hai - Happy_spotdown.org.mp3'],
  ['Kasam Khake Kaho', 'Kasam Khake Kaho_spotdown.org.mp3'],
  ['Kisi Din Banoongi Main', 'Kisi Din Banoongi Main_spotdown.org.mp3'],
  ['Kisi Disco Mein Jaaye', 'Kisi Disco Mein Jaaye_spotdown.org.mp3'],
  ['Kitna Haseen Chehra', 'Kitna Haseen Chehra_spotdown.org.mp3'],
  ['Kitna Pyaara Tujhe Rabne Banaya', 'Kitna Pyaara Tujhe Rabne Banaya_spotdown.org.mp3'],
  ['Kitne Dino Ke Baad Mile Ho', 'Kitne Dino Ke Baad Mile Ho_spotdown.org.mp3'],
  ['Kitni Bechain Hoke', 'Kitni Bechain Hoke_spotdown.org.mp3'],
  ['Kitni Hasrat Hai Humein', 'Kitni Hasrat Hai Humein_spotdown.org.mp3'],
  ['Main Agar Saamne', 'Main Agar Saamne_spotdown.org.mp3'],
  ['Main Paidal Se Jaa Raha', 'Main Paidal Se Jaa Raha_spotdown.org.mp3'],
  ['Main Tujhko Bhaga Laya', 'Main Tujhko Bhaga Laya_spotdown.org.mp3'],
  ['Maine Apna Dil De Diya', 'Maine Apna Dil De Diya_spotdown.org.mp3'],
  ['Mera Dil Bhi Kitna Pagal Hai', 'Mera Dil Bhi Kitna Pagal Hai_spotdown.org.mp3'],
  ['Meri Tarah Tum Bhi', 'Meri Tarah Tum Bhi_spotdown.org.mp3'],
  ['Mohabbat Dil Ka Sakoon', 'Mohabbat Dil Ka Sakoon_spotdown.org.mp3'],
  ['Mohabbat Ki Nahin Jaati', 'Mohabbat Ki Nahin Jaati_spotdown.org.mp3'],
  ['Mujhe Neend Na Aaye', 'Mujhe Neend Na Aaye (From _Dil_)_spotdown.org.mp3'],
  ['O Sahiba O Sahiba', 'O Sahiba O Sahiba_spotdown.org.mp3'],
  ['Paas Woh Aane Lage', 'Paas Woh Aane Lage_spotdown.org.mp3'],
  ['Pyar Dilon Ka Mela Hai', 'Pyar Dilon Ka Mela Hai_spotdown.org.mp3'],
  ['Pyar Ki Kashti Mein', 'Pyar Ki Kashti Mein_spotdown.org.mp3'],
  ['Raah Mein Unse Mulaqat', 'Raah Mein Unse Mulaqat_spotdown.org.mp3'],
  ['Raja KO Rani Se', 'Raja KO Rani Se_spotdown.org.mp3'],
  ['Shikwa Nahin Kisi Se', 'Shikwa Nahin Kisi Se_spotdown.org.mp3'],
  ['Sochenge Tumhe Pyar', 'Sochenge Tumhe Pyar_spotdown.org.mp3'],
  ['Sona Kitna Sona Hai', 'Sona Kitna Sona Hai_spotdown.org.mp3'],
  ['Tere Ishq Mein Naachenge', 'Tere Ishq Mein Naachenge_spotdown.org.mp3'],
  ['Too Shayar Hai Main Teri Shayari', 'Too Shayar Hai Main Teri Shayari_spotdown.org.mp3'],
  ['Tu Jo Hans Hans Ke', 'Tu Jo Hans Hans Ke - From _Raja Bhaiya__spotdown.org.mp3'],
  ['Tu Meri Zindagi Hai', 'Tu Meri Zindagi Hai_spotdown.org.mp3'],
  ['Tu Pyar Hai Kisi Aur Ka', 'Tu Pyar Hai Kisi Aur Ka_spotdown.org.mp3'],
  ['Tumhein Apna Banane Ki Kasam Khai Hai', 'Tumhein Apna Banane Ki Kasam Khai Hai_spotdown.org.mp3'],
  ['Yeh Dil Aashiqana', 'Yeh Dil Aashiqana_spotdown.org.mp3'],
  ['Zindagi Ban Gaye Ho Tum', 'Zindagi Ban Gaye Ho Tum_spotdown.org.mp3'],
];

const FALLBACK_SONGS = SONG_FILES.map(([title, filename], index) => ({
  _id: String(index + 1),
  title,
  artist: '90s Hindi Love Songs',
  file: `/songs/${filename}`,
  year: 1990,
}));

export function useSongs() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiBase = process.env.REACT_APP_API_URL || '';
    axios
      .get(`${apiBase}/api/songs`)
      .then((res) => {
        setSongs(res.data.data?.length ? res.data.data : FALLBACK_SONGS);
        setLoading(false);
      })
      .catch(() => {
        setSongs(FALLBACK_SONGS);
        setLoading(false);
        setError('Backend offline — using local playlist');
      });
  }, []);

  return { songs, loading, error };
}
