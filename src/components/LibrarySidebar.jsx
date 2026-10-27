import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X, ChevronRight, Disc } from 'lucide-react';

const LibrarySidebar = ({ onSelectCollection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState([]);

  // Cargar el historial desde localStorage al abrir o montar
  useEffect(() => {
    const loadHistory = () => {
      const saved = JSON.parse(localStorage.getItem('mupisa_library') || '[]');
      setHistory(saved);
    };
    loadHistory();
    // Escuchar cambios si es necesario
    window.addEventListener('storage', loadHistory);
    return () => window.removeEventListener('storage', loadHistory);
  }, [isOpen]);

  return (
    <>
      {/* Botón flotante para abrir la biblioteca */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-40 p-3 bg-white border border-gray-100 rounded-full shadow-md text-gray-700 hover:scale-105 transition-all flex items-center gap-2 font-bold text-xs"
      >
        <BookOpen size={18} />
        <span className="hidden md:inline">Mi Biblioteca</span>
      </button>

      {/* Panel Lateral con AnimatePresence */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Fondo oscuro difuminado */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-100"
            />

            {/* Contenedor del Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-white z-[150] shadow-2xl p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Disc className="text-black" size={24} />
                  <h2 className="font-black text-lg text-gray-900">Llaveros Guardados</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-black rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Lista de elementos */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {history.length === 0 ? (
                  <div className="text-center py-20 text-gray-400 text-sm">
                    <p>Aún no has escaneado ningún llavero.</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.code}
                      onClick={() => {
                        // Cambiar la URL o recargar con el código seleccionado
                        window.location.search = `?code=${item.code}`;
                      }}
                      className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl cursor-pointer transition-all border border-gray-100 group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0">
                        {item.cover ? (
                          <img src={item.cover} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Disc size={20} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-gray-900 truncate">{item.title}</h4>
                        <p className="text-[10px] text-gray-500 truncate">{item.artist}</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-black transition-colors" />
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <p className="text-[10px] text-gray-400">Se guarda localmente en tu dispositivo.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default LibrarySidebar;