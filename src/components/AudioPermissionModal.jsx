import React, { useState, useEffect } from 'react';

const AudioPermissionModal = ({ onAuthorized }) => {
  const [isVisible, setIsVisible] = useState(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const alreadyAuth = sessionStorage.getItem('audio_authorized') === 'true';
    return isIOS && !alreadyAuth;
  });

  useEffect(() => {
    // Si no es iOS, o ya estaba autorizado, avisamos a App inmediatamente
    if (!isVisible) {
      onAuthorized();
    }
  }, [isVisible, onAuthorized]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white p-6 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Enable Audio</h2>
        <p className="text-gray-600 mb-8">This app requires permission to play audio. Please tap accept to continue.</p>
        <button 
          onClick={() => {
            sessionStorage.setItem('audio_authorized', 'true');
            setIsVisible(false);
          }}
          className="w-full px-8 py-4 bg-blue-600 text-white rounded-full font-bold shadow-lg"
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default AudioPermissionModal;