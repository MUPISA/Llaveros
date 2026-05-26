import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Music } from 'lucide-react';

const VinylPlayer = ({ 
  song, 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrev, 
  hasPrev, 
  hasNext, 
  progress = 0 
}) => {
  // 💿 CALIBRACIÓN VISUAL DE LA AGUJA (Ángulos en grados)
  // El pivote está en la esquina superior derecha (top-right)
  const AJUSTES_AGUJA = {
    fuera: 15,    // Posición de reposo (Pausado)
    inicio: 0,    // Posición al empezar la canción (0%)
    final: -25,   // Posición al terminar la canción (100%)
    largo: 174    // Largo del brazo en píxeles (w-36 = 144px)
  };

  const [rotation, setRotation] = useState(0);
  const animationRef = useRef();

  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        setRotation((prev) => (prev + 1.5) % 360);
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animationRef.current);
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying]);

  // Cálculo de rotación basado en los ajustes superiores
  const needleRotation = isPlaying 
    ? AJUSTES_AGUJA.inicio + (progress * (AJUSTES_AGUJA.final - AJUSTES_AGUJA.inicio)) 
    : AJUSTES_AGUJA.fuera;

  const showNavigation = hasPrev || hasNext;

  return (
    <div className="relative flex flex-col items-center justify-center p-10 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 max-w-md w-full transition-all duration-500">
      {/* Vinyl Record Container */}
      <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center">
        {/* The Player Base Shadow */}
        <div className="absolute inset-4 bg-black/5 rounded-full blur-2xl" />
        
        {/* The Vinyl Container with Transition Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={song?.title} // Triggers animation on song change
            initial={{ rotate: -180, opacity: 0, scale: 0.8 }}
            animate={{ rotate: rotation, opacity: 1, scale: 1 }}
            exit={{ rotate: 180, opacity: 0, scale: 0.8 }}
            transition={{ 
              rotate: { ease: "linear", duration: isPlaying ? 0 : 0.6 },
              scale: { duration: 0.4 },
              opacity: { duration: 0.3 }
            }}
            className="relative w-64 h-64 md:w-72 md:h-72 bg-[#121212] rounded-full shadow-[0_20px_60px_rgba(0,0,0,0.4)] flex items-center justify-center border-[6px] border-[#1a1a1a] z-20"
        >
          {/* Groove Texture */}
          <div className="absolute inset-0 rounded-full" style={{
            background: 'repeating-radial-gradient(circle, #1a1a1a 0%, #1a1a1a 1%, #222 1.2%, #1a1a1a 1.4%)',
            opacity: 0.4
          }} />
          
          {/* Center Label (Cover Art) */}
          <div className="relative w-24 h-24 md:w-28 md:h-28 bg-white rounded-full overflow-hidden border-[5px] border-black/80 z-10 shadow-lg">
            {song?.cover ? (
              <img src={song.cover} alt="Cover" className="w-full h-full object-cover" draggable="false" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                <Music size={32} />
              </div>
            )}
            {/* Center Hole */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border border-gray-200 z-20 shadow-inner flex items-center justify-center">
              <div className="w-1 h-1 bg-gray-400 rounded-full" />
            </div>
          </div>
        </motion.div>
        </AnimatePresence>

        {/* The Needle Arm */}
        <motion.div
          initial={{ rotate: 180 }}
          animate={{ rotate: needleRotation }}
          transition={{ 
            rotate: { 
              type: "spring", 
              stiffness: isPlaying ? 30 : 40, 
              damping: 15,
              mass: 1
            } 
          }}
          className="absolute top-4 right-4 h-6 origin-top-right z-30"
          style={{ 
            transformOrigin: 'calc(100% - 12px) 12px',
            width: `${AJUSTES_AGUJA.largo}px`
          }}
        >
          <div className="relative w-full h-full flex items-center">
            {/* Arm Body */}
            <div className="w-full h-2 bg-gradient-to-l from-gray-400 to-gray-300 rounded-full shadow-md" />
            {/* Needle Head */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-5 bg-gray-700 rounded-sm transform -rotate-6 shadow-lg flex items-center justify-center">
               <div className="w-1 h-3 bg-gray-500 rounded-full" />
            </div>
            {/* Pivot Point */}
            <div className="absolute right-0 top-0 w-8 h-8 bg-gray-400 rounded-full border-2 border-gray-200 shadow-xl flex items-center justify-center">
               <div className="w-4 h-4 bg-gray-500 rounded-full" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Song Info */}
      <div className="mt-8 text-center h-20 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={song?.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 line-clamp-1">{song?.title || "Selecciona una canción"}</h2>
            <p className="text-gray-500 font-medium">{song?.artist || "Escanea tu llavero"}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center gap-8">
        {showNavigation && (
          <button 
            onClick={onPrev}
            disabled={!hasPrev}
            className={`p-2 transition-all duration-300 ${!hasPrev ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:text-gray-600 hover:scale-110 active:scale-90'}`}
          >
            <SkipBack size={24} fill="currentColor" />
          </button>
        )}
        
        <button 
          onClick={onPlayPause}
          className="w-16 h-16 flex items-center justify-center bg-black text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
        </button>

        {showNavigation && (
          <button 
            onClick={onNext}
            disabled={!hasNext}
            className={`p-2 transition-all duration-300 ${!hasNext ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:text-gray-600 hover:scale-110 active:scale-90'}`}
          >
            <SkipForward size={24} fill="currentColor" />
          </button>
        )}
      </div>
    </div>
  );
};

export default VinylPlayer;