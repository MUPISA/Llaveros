export const collections = {
  "e8c2e575": {
    id: "e8c2e575",
    name: "Colección Benito",
    spotify: "https://open.spotify.com/track/5ttwRN6Dpd5LPXwbHvX5rX?si=ofYX0NXtS-u5hXCN3zHKHA",
    youtubeMusic: "https://music.youtube.com/watch?v=vJXIa6wmBSQ",
    songs: [
      {
        title: "El Tesoro de Benito",
        artist: "MUPISA",
        cover: "covers/El Tesoro de Benito.jpg",
        mp3: "/songs/El Tesoro de Benito.mp3",
      },
      {
        title: "El Tesoro de Benito",
        artist: "MUPISA",
        cover: "covers/El Tesoro de Benito 2.jpg",
        mp3: "/songs/El Tesoro de Benito.mp3",
      },
    ]
  },
};

export const getCollectionByCode = (code) => {
  return collections[code] || null;
};