
//Importar canciones desde assets para que no sea publico
import TesoroBenito from "../assets/songs/El Tesoro de Benito.mp3";

//Importar canciones desde assets para que no sea publico
import Visajea from "../assets/songs/VISAJEA Sonora Trucupey.mp3";
import Caleñidad from "../assets/songs/CALEÑIDAD Sonora Trucupey Orquesta de Cali.mp3";



//Importar carátulas desde asset para que no sean publicas
import TesoroBenitoCover from "../assets/covers/El Tesoro de Benito.jpg";
import TesoroBenitoCover2 from "../assets/covers/El Tesoro de Benito 2.jpg";

import VisajeaCover from "../assets/covers/visajea.jpg";
import CaleñidadCover from "../assets/covers/Caleñidad.jpg";



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
        cover: TesoroBenitoCover,
        mp3: TesoroBenito,
      },
      {
        title: "El Tesoro de Benito",
        artist: "MUPISA",
        cover: TesoroBenitoCover2,
        mp3: TesoroBenito,
      },
    ]
  },
  "a4f9c1d7": {
    id: "a4f9c1d7",
    name: "Visajea",
    spotify: "https://open.spotify.com/track/5ttwRN6Dpd5LPXwbHvX5rX?si=ofYX0NXtS-u5hXCN3zHKHA",
    youtubeMusic: "https://music.youtube.com/watch?v=vJXIa6wmBSQ",
    songs: [
      {
        title: "Visajea",
        artist: "Sonora Trucpey",
        cover: VisajeaCover,
        mp3: Visajea,
      },
    ]
  },
  "7e3b8a2c": {
    id: "7e3b8a2c",
    name: "Caleñidad",
    spotify: "https://open.spotify.com/intl-es/track/3nDA3mAWxY9LbaGRE4D7s5",
    youtubeMusic: "https://music.youtube.com/watch?v=-BDSp0g1IIQ",
    songs: [
      {
        title: "Caleñidad",
        artist: "Sonora Trucpey",
        cover: CaleñidadCover,
        mp3: Caleñidad,
      },
    ]
  },
};

export const getCollectionByCode = (code) => {
  return collections[code] || null;
};