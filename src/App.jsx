import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VinylPlayer from './components/VinylPlayer';
import { getCollectionByCode } from './data/songs';
import { getStreamableUrl, revokeStreamableUrl } from './services/audioService';
import { Music, ExternalLink, Share2 } from 'lucide-react';
import MusicMupisa from "./assets/MusicMupisa.png";

const formatTime = (seconds) => {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

function App() {
  const [collection, setCollection] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const [audioError, setAudioError] = useState(null);
  const audioRef = useRef(new Audio());

  const song = collection?.songs[currentSongIndex] || null;

  useEffect(() => {
    // 1. Get code from URL or SessionStorage
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get('code');
    const storedCode = sessionStorage.getItem('llavero_code');
    
    const activeCode = codeFromUrl || storedCode;

    if (activeCode) {
      const foundCollection = getCollectionByCode(activeCode);
      if (foundCollection) {
        // Save to session and clear URL for exclusivity
        sessionStorage.setItem('llavero_code', activeCode);
        if (codeFromUrl) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        setCollection(foundCollection);
        setCurrentSongIndex(0);
        setupAudio(foundCollection.songs[0].mp3);
      }
    }
  }, []);

  const setupAudio = async (mp3Path) => {
    try {
      setAudioError(null);
      const url = await getStreamableUrl(mp3Path);
      setAudioUrl(url);
      audioRef.current.src = url;
      audioRef.current.load(); // Explicitly load the new source
      
      audioRef.current.onended = () => {
        if (collection && currentSongIndex < collection.songs.length - 1) {
          handleNext();
        } else {
          setIsPlaying(false);
          setProgress(0);
        }
      };
      
      audioRef.current.ontimeupdate = () => {
        const p = audioRef.current.currentTime / audioRef.current.duration;
        setProgress(isNaN(p) ? 0 : p);
      };

      audioRef.current.onerror = () => {
        setAudioError("Error al cargar el archivo de audio. Verifica que el archivo exista en public/songs/");
        setIsPlaying(false);
      };

      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    } catch (error) {
      setAudioError(error.message);
    }
  };

  const togglePlay = () => {
    if (audioError) {
      alert(audioError);
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Error al reproducir:", error);
          setAudioError("No se pudo iniciar la reproducción. Asegúrate de haber interactuado con la página primero.");
          setIsPlaying(false);
        });
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (collection && currentSongIndex < collection.songs.length - 1) {
      const nextIndex = currentSongIndex + 1;
      setCurrentSongIndex(nextIndex);
      setupAudio(collection.songs[nextIndex].mp3);
    }
  };

  const handlePrev = () => {
    if (collection && currentSongIndex > 0) {
      const prevIndex = currentSongIndex - 1;
      setCurrentSongIndex(prevIndex);
      setupAudio(collection.songs[prevIndex].mp3);
    }
  };

  const handleSeek = (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickedProgress = Math.max(0, Math.min(1, x / rect.width));
    
    if (audioRef.current.duration) {
      audioRef.current.currentTime = clickedProgress * audioRef.current.duration;
      setProgress(clickedProgress);
    }
  };

  const handleShare = async () => {
    // Shared text adjusted for exclusivity
    const shareData = {
      title: "Music MUPISA",
      text: `¡Me encanta esta canción! Consigue tu llavero para vivir la experiencia.`,
      url: "https://music.mupisacali.com/", // Enlace a la tienda o info del museo, no a la canción directa
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error.name !== 'AbortError') console.error(error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert("¡Enlace del museo copiado!");
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audioUrl) revokeStreamableUrl(audioUrl);
    };
  }, [audioUrl]);

  // Idioma
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const browserLang = navigator.language;

    if (browserLang.startsWith("es")) {
      setLang("es");
    }
  }, []);

  if (!collection) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-12">
          {/* Visual Animation of NFC Scan */}
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="w-32 h-56 bg-black rounded-[2.5rem] border-[6px] border-gray-800 shadow-2xl relative flex items-center justify-center overflow-hidden"
          >
            <div className="w-12 h-1 bg-gray-800 rounded-full absolute top-4" />
            <Music size={40} className="text-white/20" />
            {/* Pulsing NFC Waves */}
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 border-2 border-white/30 rounded-full m-8"
            />
          </motion.div>
          
          <motion.div 
            animate={{ x: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -bottom-6 -right-6 w-20 h-20 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center rotate-12"
          >
             <div className="w-4 h-4 bg-gray-200 rounded-full border-4 border-gray-100" />
             <div className="absolute top-2 right-2 w-2 h-2 bg-gray-300 rounded-full" />
          </motion.div>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">MUPISA MUSIC</h1>
        <p className="text-gray-500 max-w-xs mb-8 font-medium leading-relaxed">
          {lang === "es" ?
          <>Acerca tu llavero <span className="text-black font-bold">MUPISA</span> a la parte trasera de tu teléfono para desbloquear tu música. </>
          :
          <>Put your <span className="text-black font-bold">MUPISA</span> key-chain in the back of your phone to unlock your music</>
          }
        </p>

        <div className="space-y-3 w-full max-w-xs">
          <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 text-left">
            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
              <span className="font-bold text-xs">NFC</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">{lang === "es" ? "¿No sucede nada?" : "No happens?"}</p>
              <p className="text-[10px] text-gray-400">{lang === "es" ? "Asegúrate de tener el NFC activado en los ajustes de tu móvil." : "Make sure NFC is enabled in your mobile settings."}</p>
            </div>
          </div>
          
          <a 
            href="https://wa.me/573209050136?text=Hola%2C+buen+d%C3%ADa.+Estoy+interesado/a+en+comprar+un+llavero+musical.+%C2%BFPodr%C3%ADan+brindarme+informaci%C3%B3n+sobre+los+modelos+disponibles%2C+precios+y+opciones+de+entrega%3F+Muchas+gracias." 
            target="_blank"
            className="block w-full py-4 text-sm font-bold text-gray-400 hover:text-black transition-colors"
          >
            {lang === "es" ? "¿Aún no tienes tu llavero?" : "Dont have your key-chain? Buy one now"}
          </a>
        </div>
      </div>
    );
  }

  // Reproductor

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center py-5 px-4">
      {/* Header / Logo */}
      <div className="mb-5 flex items-center gap-2">
      <div className="w-10 h-10 rounded-xl overflow-hidden">
        <img
          src={MusicMupisa}
          alt="MUPISA MUSIC"
          className="w-full h-full object-cover"
          loading="lazy"
          draggable={false}
        />
      </div>
      <span className="font-bold text-xl tracking-tight text-gray-900">
        MUPISA MUSIC
      </span>
    </div>

      {/* Main Player Container with Global Transition */}
      <div className="relative w-full flex justify-center perspective-1000">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={song?.title + currentSongIndex}
            initial={{ x: 600, opacity: 0, rotate: 120, scale: 0.5 }}
            animate={{ x: 0, opacity: 1, rotate: 0, scale: 1 }}
            exit={{ x: -600, opacity: 0, rotate: -120, scale: 0.5 }}
            transition={{ 
              type: "spring", 
              stiffness: 70, 
              damping: 15,
              mass: 0.8
            }}
            className="w-full flex justify-center z-50"
          >
            <VinylPlayer
              song={song}
              isPlaying={isPlaying}
              onPlayPause={togglePlay}
              onNext={handleNext}
              onPrev={handlePrev}
              hasPrev={currentSongIndex > 0}
              hasNext={collection && currentSongIndex < collection.songs.length - 1}
              progress={progress}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="mt-8 w-full max-w-md px-6">
        {audioError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium text-center">
            {audioError}
          </div>
        )}
        <div 
          onClick={handleSeek}
          className="w-full h-3 bg-gray-200 rounded-full overflow-hidden cursor-pointer group relative flex items-center"
        >
          <div className="absolute inset-0 w-full h-full" /> {/* Interaction area */}
          <motion.div
            className="h-full bg-black relative"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ ease: "linear", duration: 0.1 }}
          >
             <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-full bg-white/20 group-hover:bg-white/40 transition-colors" />
          </motion.div>
        </div>
        <div className="flex justify-between mt-2 text-xs font-medium text-gray-400">
          <span>{formatTime(audioRef.current.currentTime)}</span>
          <span>{formatTime(audioRef.current.duration)}</span>
        </div>
      </div>

      {/* External Links */}
      <div className="mt-12 w-full max-w-md space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center mb-6">
          {lang === "es" ? "¿Con ganas de más música?" : "Listen more music"}
        </h3>

        <div className="grid grid-cols-1 gap-3">
          { collection && collection.spotify && (
            <a
              href={collection.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1DB954]/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm5.503 17.306c-.215.353-.672.463-1.025.249-2.846-1.74-6.429-2.13-10.648-1.168-.404.093-.81-.157-.903-.561-.093-.404.157-.81.561-.903 4.621-1.058 8.583-.611 11.765 1.334.353.214.463.672.249 1.025zm1.468-3.258c-.272.441-.849.581-1.29.31-3.258-2.002-8.225-2.585-12.078-1.415-.497.151-1.022-.132-1.173-.629-.151-.497.132-1.022.629-1.173 4.398-1.335 9.873-.685 13.602 1.61.441.272.581.849.31 1.29zm.126-3.414c-3.906-2.321-10.348-2.534-14.102-1.394-.6.182-1.23-.162-1.412-.762-.182-.6.162-1.23.762-1.412 4.305-1.305 11.415-1.053 15.91 1.616.54.321.716 1.015.395 1.555-.321.54-1.015.716-1.553.397z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-700">Spotify</span>
              </div>
              <ExternalLink size={18} className="text-gray-300 group-hover:text-gray-600 transition-colors" />
            </a>
          )}

          { collection && collection.youtubeMusic && (
            <a  
              href={collection.youtubeMusic}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FF0000]/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#FF0000]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 18.375c-3.514 0-6.375-2.861-6.375-6.375S8.486 5.625 12 5.625 18.375 8.486 18.375 12 15.514 18.375 12 18.375zM12 7.5c-2.481 0-4.5 2.019-4.5 4.5s2.019 4.5 4.5 4.5 4.5-2.019 4.5-4.5-2.019-4.5-4.5-4.5zm0 6.75c-1.241 0-2.25-1.009-2.25-2.25S10.759 9.75 12 9.75s2.25 1.009 2.25 2.25-1.009 2.25-2.25 2.25z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-700">YouTube Music</span>
              </div>
              <ExternalLink size={18} className="text-gray-300 group-hover:text-gray-600 transition-colors" />
            </a>
          )}
        </div>
      </div>

      {/* Share / Info */}
      <div className="mt-12 flex items-center gap-4">
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 font-medium transition-all active:scale-95"
        >
          <Share2 size={18} />
          {lang === "es" ? "Compartir" : "Share"}
        </button>
      </div>

      <footer className="mt-auto pt-16 pb-8 text-gray-400 text-sm text-center">
        <p className='font-bold'>
          &copy; 2026 MUPISA. Museo Pioneros de la Salsa Caleña.
        </p>
        <p>{lang === "es" ? "Todos los derechos reservados." : "All rights reserved."}</p>
        <p>
          {lang === "es" ? "Hecho por" : "Made by"} <a className='hover:font-bold' href="https://museortizmedia.github.io/" target="_blank" rel="noopener noreferrer">Muse Ortiz Media</a>
        </p>
      </footer>
    </div>
  );
}

export default App;