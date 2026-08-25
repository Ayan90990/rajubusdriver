import { useState, useEffect } from 'react';
import axios from 'axios';

export function useSongs() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get('/api/songs')
      .then((res) => {
        setSongs(res.data.data || FALLBACK_SONGS);
        setLoading(false);
      })
      .catch((err) => {
        console.error('API fetch failed, using fallback songs.', err);
        setSongs(FALLBACK_SONGS);
        setLoading(false);
        setError('Backend offline — using local playlist');
      });
  }, []);

  return { songs, loading, error };
}

const FALLBACK_SONGS = [
  {
    "_id": "1",
    "title": "Agar Tum Mil Jao",
    "artist": "Zeher",
    "file": "/songs/track_1.mp3",
    "year": 1990
  },
  {
    "_id": "2",
    "title": "ALFAAZO",
    "artist": "90s Superhit Special",
    "file": "/songs/track_2.mp3",
    "year": 1991
  },
  {
    "_id": "3",
    "title": "Arz Kiya Hai   Coke Studio Bharat",
    "artist": "90s Superhit Special",
    "file": "/songs/track_3.mp3",
    "year": 1992
  },
  {
    "_id": "4",
    "title": "Bahut Jatate Ho Pyar",
    "artist": "90s Superhit Special",
    "file": "/songs/track_4.mp3",
    "year": 1993
  },
  {
    "_id": "5",
    "title": "Bairan",
    "artist": "90s Superhit Special",
    "file": "/songs/track_5.mp3",
    "year": 1994
  },
  {
    "_id": "6",
    "title": "Bandhu 2.0",
    "artist": "Cocktail 2",
    "file": "/songs/track_6.mp3",
    "year": 1995
  },
  {
    "_id": "7",
    "title": "Barsaat",
    "artist": "90s Superhit Special",
    "file": "/songs/track_7.mp3",
    "year": 1996
  },
  {
    "_id": "8",
    "title": "Chaaha Toh Bahut",
    "artist": "90s Superhit Special",
    "file": "/songs/track_8.mp3",
    "year": 1997
  },
  {
    "_id": "9",
    "title": "Chand Ke Paar Chalo",
    "artist": "90s Superhit Special",
    "file": "/songs/track_9.mp3",
    "year": 1998
  },
  {
    "_id": "10",
    "title": "Chandni O Meri Chandni",
    "artist": "90s Superhit Special",
    "file": "/songs/track_10.mp3",
    "year": 1999
  },
  {
    "_id": "11",
    "title": "Chhodh Ke Na Jaa Ooh Piya",
    "artist": "Maa Tujhhe Salaam   Soundtrack Version",
    "file": "/songs/track_11.mp3",
    "year": 2000
  },
  {
    "_id": "12",
    "title": "Delhi Se Manali (Ladka Tera Diwana)",
    "artist": "90s Superhit Special",
    "file": "/songs/track_12.mp3",
    "year": 2001
  },
  {
    "_id": "13",
    "title": "Dil Jaane Jigar Tujh Pe",
    "artist": "90s Superhit Special",
    "file": "/songs/track_13.mp3",
    "year": 2002
  },
  {
    "_id": "14",
    "title": "Dilbar Dilbar",
    "artist": "90s Superhit Special",
    "file": "/songs/track_14.mp3",
    "year": 2003
  },
  {
    "_id": "15",
    "title": "Do Baatein Ho Sakti Hai",
    "artist": "90s Superhit Special",
    "file": "/songs/track_15.mp3",
    "year": 2004
  },
  {
    "_id": "16",
    "title": "Ek Mulaqat Zaroori Hai Sanam",
    "artist": "90s Superhit Special",
    "file": "/songs/track_16.mp3",
    "year": 1990
  },
  {
    "_id": "17",
    "title": "Hamne Tumko Dil Ye De Diya",
    "artist": "90s Superhit Special",
    "file": "/songs/track_17.mp3",
    "year": 1991
  },
  {
    "_id": "18",
    "title": "Is Tarah Aashiqui Ka",
    "artist": "Kumar Sanu Version",
    "file": "/songs/track_18.mp3",
    "year": 1992
  },
  {
    "_id": "19",
    "title": "Jaadu Teri Nazar",
    "artist": "90s Superhit Special",
    "file": "/songs/track_19.mp3",
    "year": 1993
  },
  {
    "_id": "20",
    "title": "Jeena Nahi",
    "artist": "90s Superhit Special",
    "file": "/songs/track_20.mp3",
    "year": 1994
  },
  {
    "_id": "21",
    "title": "Kisi Din Banoongi Main",
    "artist": "90s Superhit Special",
    "file": "/songs/track_21.mp3",
    "year": 1995
  },
  {
    "_id": "22",
    "title": "Laal Dupatta",
    "artist": "90s Superhit Special",
    "file": "/songs/track_22.mp3",
    "year": 1996
  },
  {
    "_id": "23",
    "title": "Mera Sanam Sabse Pyara Hai",
    "artist": "90s Superhit Special",
    "file": "/songs/track_23.mp3",
    "year": 1997
  },
  {
    "_id": "24",
    "title": "Milne Ki Tum Koshish Karna",
    "artist": "90s Superhit Special",
    "file": "/songs/track_24.mp3",
    "year": 1998
  },
  {
    "_id": "25",
    "title": "O Soniya",
    "artist": "90s Superhit Special",
    "file": "/songs/track_25.mp3",
    "year": 1999
  },
  {
    "_id": "26",
    "title": "Oye Raju",
    "artist": "90s Superhit Special",
    "file": "/songs/track_26.mp3",
    "year": 2000
  },
  {
    "_id": "27",
    "title": "Paa Liya Hain Pyar Tera",
    "artist": "90s Superhit Special",
    "file": "/songs/track_27.mp3",
    "year": 2001
  },
  {
    "_id": "28",
    "title": "Panchhi Soor Main Gaate Hain",
    "artist": "90s Superhit Special",
    "file": "/songs/track_28.mp3",
    "year": 2002
  },
  {
    "_id": "29",
    "title": "Pehle Pyaar Ka Pehla",
    "artist": "90s Superhit Special",
    "file": "/songs/track_29.mp3",
    "year": 2003
  },
  {
    "_id": "30",
    "title": "Pehli Pehli Baar Mohabbat Ki Hai",
    "artist": "90s Superhit Special",
    "file": "/songs/track_30.mp3",
    "year": 2004
  },
  {
    "_id": "31",
    "title": "Phool Maangu Na Bahaar Maangu",
    "artist": "90s Superhit Special",
    "file": "/songs/track_31.mp3",
    "year": 1990
  },
  {
    "_id": "32",
    "title": "Raah Mein Unse Mulaqat",
    "artist": "90s Superhit Special",
    "file": "/songs/track_32.mp3",
    "year": 1991
  },
  {
    "_id": "33",
    "title": "Rab Kare",
    "artist": "90s Superhit Special",
    "file": "/songs/track_33.mp3",
    "year": 1992
  },
  {
    "_id": "34",
    "title": "Soldier Soldier Meethi Baaten",
    "artist": "90s Superhit Special",
    "file": "/songs/track_34.mp3",
    "year": 1993
  },
  {
    "_id": "35",
    "title": "Suno Miya Suno",
    "artist": "90s Superhit Special",
    "file": "/songs/track_35.mp3",
    "year": 1994
  },
  {
    "_id": "36",
    "title": "Tera Mera Rishta - New Version",
    "artist": "Awarapan 2",
    "file": "/songs/track_36.mp3",
    "year": 1995
  },
  {
    "_id": "37",
    "title": "Tere Ishq Mein Naachenge",
    "artist": "90s Superhit Special",
    "file": "/songs/track_37.mp3",
    "year": 1996
  },
  {
    "_id": "38",
    "title": "Tere Naam",
    "artist": "90s Superhit Special",
    "file": "/songs/track_38.mp3",
    "year": 1997
  },
  {
    "_id": "39",
    "title": "Toh Phir Aao",
    "artist": "New Version",
    "file": "/songs/track_39.mp3",
    "year": 1998
  },
  {
    "_id": "40",
    "title": "Tu Jo Hans Hans Ke",
    "artist": "Raja Bhaiya",
    "file": "/songs/track_40.mp3",
    "year": 1999
  },
  {
    "_id": "41",
    "title": "Tujhko",
    "artist": "Cocktail 2",
    "file": "/songs/track_41.mp3",
    "year": 2000
  },
  {
    "_id": "42",
    "title": "Tum Toh Dhokhebaaz Ho",
    "artist": "90s Superhit Special",
    "file": "/songs/track_42.mp3",
    "year": 2001
  },
  {
    "_id": "43",
    "title": "Tumhare Siva",
    "artist": "90s Superhit Special",
    "file": "/songs/track_43.mp3",
    "year": 2002
  },
  {
    "_id": "44",
    "title": "Tumsa Koi Pyaara",
    "artist": "90s Superhit Special",
    "file": "/songs/track_44.mp3",
    "year": 2003
  },
  {
    "_id": "45",
    "title": "Ucha Lamba Kad Forever",
    "artist": "Welcome To The Jungle",
    "file": "/songs/track_45.mp3",
    "year": 2004
  },
  {
    "_id": "46",
    "title": "Ve Junoon",
    "artist": "Awarapan 2",
    "file": "/songs/track_46.mp3",
    "year": 1990
  },
  {
    "_id": "47",
    "title": "Viyah Kar Leni Ae",
    "artist": "90s Superhit Special",
    "file": "/songs/track_47.mp3",
    "year": 1991
  },
  {
    "_id": "48",
    "title": "Woh Aaega",
    "artist": "90s Superhit Special",
    "file": "/songs/track_48.mp3",
    "year": 1992
  },
  {
    "_id": "49",
    "title": "Yeh Awarapan",
    "artist": "Awarapan 2",
    "file": "/songs/track_49.mp3",
    "year": 1993
  }
];
