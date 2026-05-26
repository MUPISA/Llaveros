/**
 * Fetches an audio file and returns a Blob URL to "protect" the direct path.
 * This is a basic form of protection that prevents simple right-click saves
 * and hides the original asset URL from the <audio> tag.
 */
export const getStreamableUrl = async (mp3Path) => {
  try {
    const response = await fetch(mp3Path);
    if (!response.ok) {
      throw new Error(`No se pudo encontrar el archivo de audio: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('text/html')) {
      throw new Error('El archivo solicitado no es un audio válido (posible 404 del servidor).');
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error en streaming de audio:", error);
    throw error; // Re-throw to handle it in the UI
  }
};

export const revokeStreamableUrl = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};