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
  const [audioReady, setAudioReady] = useState(false); // Estado de carga para el buffer[cite: 3]
  const audioRef = useRef(new Audio());

  const song = collection?.songs[currentSongIndex] || null;

  const setupAudio = async (mp3Path) => {
    setAudioReady(false);
    setAudioError(null);
    try {
      const url = await getStreamableUrl(mp3Path);
      setAudioUrl(url);
      
      const audio = audioRef.current;
      audio.src = url;
      audio.preload = "auto";
      audio.load();
      
      audio.oncanplaythrough = () => setAudioReady(true); // Se activa cuando el audio está listo para sonar[cite: 3]
      
      audio.onended = () => {
        if (collection && currentSongIndex < collection.songs.length - 1) {
          handleNext();
        } else {
          setIsPlaying(false);
          setProgress(0);
        }
      };
      
      audio.ontimeupdate = () => {
        const p = audio.currentTime / audio.duration;
        setProgress(isNaN(p) ? 0 : p);
      };

      audio.onerror = () => {
        setAudioError("Error al cargar el archivo de audio.");
        setIsPlaying(false);
      };
    } catch (error) {
      setAudioError(error.message);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get('code');
    const storedCode = sessionStorage.getItem('llavero_code');
    const activeCode = codeFromUrl || storedCode;

    if (activeCode) {
      const foundCollection = getCollectionByCode(activeCode);
      if (foundCollection) {
        sessionStorage.setItem('llavero_code', activeCode);
        if (codeFromUrl) window.history.replaceState({}, document.title, window.location.pathname);
        setCollection(foundCollection);
        setupAudio(foundCollection.songs[0].mp3);
      }
    }
  }, []);

  const togglePlay = () => {
    if (audioError) {
      alert(audioError);
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error(e));
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
    const shareData = { title: "Music MUPISA", text: `¡Me encanta esta canción!`, url: "https://music.mupisacali.com/" };
    if (navigator.share) await navigator.share(shareData);
    else await navigator.clipboard.writeText(shareData.url);
  };

  useEffect(() => {
    return () => { if (audioUrl) revokeStreamableUrl(audioUrl); };
  }, [audioUrl]);

  if (!collection) return (/* UI de escaneo NFC */ <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 text-center">...</div>);

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center py-5 px-4">
      <div className="mb-5 flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl overflow-hidden"><img src={MusicMupisa} alt="MUPISA MUSIC" className="w-full h-full object-cover" /></div>
        <span className="font-bold text-xl tracking-tight text-gray-900">MUPISA MUSIC</span>
      </div>

      <VinylPlayer
        song={song}
        isAudioReady={audioReady} // Pasamos el estado de carga al reproductor[cite: 3]
        isPlaying={isPlaying}
        onPlayPause={togglePlay}
        onNext={handleNext}
        onPrev={handlePrev}
        hasPrev={currentSongIndex > 0}
        hasNext={collection && currentSongIndex < collection.songs.length - 1}
        progress={progress}
      />

      <div className="mt-8 w-full max-w-md px-6">
        {audioError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-medium text-center rounded-xl">{audioError}</div>}
        <div onClick={handleSeek} className="w-full h-3 bg-gray-200 rounded-full cursor-pointer relative overflow-hidden">
          <motion.div className="h-full bg-black" initial={{ width: 0 }} animate={{ width: `${progress * 100}%` }} />
        </div>
      </div>
      
      {/* Footer y resto de links aquí */}
    </div>
  );
}

export default App;