# 📚 Documentación Interna — MUPISA Music

Este repositorio contiene la aplicación web del **Museo Pioneros de la Salsa Caleña (MUPISA)**, diseñada para ofrecer una experiencia de reproducción musical interactiva a través de llaveros físicos con tecnología **NFC**.

---

## ⚙️ ¿Cómo funciona la aplicación? (Arquitectura Técnica)

1. **Lectura de Código NFC / URL:**
   - Al acercar el llavero al teléfono, se abre la web con un parámetro en la URL: `https://music.mupisacali.com/?code=CODIGO_AQUI`.
   - La aplicación detecta el parámetro `code` al cargar (`useEffect` en `App.js`), busca la colección mediante la función `getCollectionByCode(code)` y limpia la URL visual para el usuario.
   - La colección se guarda en `sessionStorage` bajo la clave `llavero_code`, lo que permite mantener la música cargada aunque el usuario recargue la página.

2. **Reproductor de Vinilo Interactivo (`VinylPlayer.jsx`):**
   - Simula un tocadiscos real usando **Framer Motion**.
   - **Disco:** Gira de forma continua mediante `requestAnimationFrame` cuando la canción está reproduciéndose.
   - **Brazo de Aguja:** La rotación de la aguja (`needleRotation`) se calcula dinámicamente según el porcentaje de progreso (`progress`) de la canción actual, moviéndose desde la posición de inicio (`0°`) hasta el final (`-25°`), y regresando a reposo (`15°`) al pausar.

3. **Gestión de Audio:**
   - Utiliza la API de audio nativa de JavaScript (`Audio`) integrada con `audioService.js` para gestionar las URLs de streaming.
   - Permite pausar/reproducir, adelantar o retrasar haciendo clic en la barra de progreso (`handleSeek`), y cambiar entre canciones de la misma colección (`handleNext` / `handlePrev`).

4. **Compatibilidad y Permisos:**
   - **Móviles / iOS:** Incluye el componente `AudioPermissionModal.jsx` para gestionar el permiso explícito de reproducción de audio en dispositivos Apple (iOS), guardando la autorización en `sessionStorage`.
   - **i18n (Idiomas):** Detecta automáticamente el idioma del navegador (`navigator.language`) para alternar entre Español e Inglés.

---

## 🎵 1. Cómo subir y registrar nuevas canciones

Para añadir una nueva canción o colección al sistema, debes seguir estos dos pasos:

### Paso 1: Subir los archivos de audio e imágenes
1. Guarda el archivo audio `.mp3` en la carpeta pública del proyecto:
   `public/songs/nombre-cancion.mp3`
2. Si la canción o colección incluye carátula personalizada, guarda la imagen en:
   `public/covers/nombre-portada.jpg` (o en la carpeta de assets configurada).

### Paso 2: Registrar la colección en la base de datos local
Abre el archivo de datos de canciones (ubicado en `src/data/songs.js`) y añade una nueva entrada con la siguiente estructura:

```javascript
// Ejemplo en src/data/songs.js
export const collections = {
  "codigo-de-ejemplo": {
    spotify: "[https://open.spotify.com/album/](https://open.spotify.com/album/)...",      // Opcional
    youtubeMusic: "[https://music.youtube.com/playlist](https://music.youtube.com/playlist)...", // Opcional
    songs: [
      {
        title: "Nombre de la Canción 1",
        artist: "Nombre del Artista / Orquesta",
        mp3: "nombre-cancion-1.mp3", // Archivo en public/songs/
        cover: "/covers/portada-1.jpg"  // Archivo de carátula
      },
      {
        title: "Nombre de la Canción 2",
        artist: "Nombre del Artista",
        mp3: "nombre-cancion-2.mp3",
        cover: "/covers/portada-2.jpg"
      }
    ]
  }
};
```
---

## 🔗 2. Cómo construir los links para los llaveros NFC

Cada llavero físico debe llevar grabado en su chip NFC un enlace único que apunte al código registrado en el archivo de canciones.

### Formato Base del Enlace
```text
[https://music.mupisacali.com/?code=TU_CODIGO_AQUI](https://music.mupisacali.com/?code=TU_CODIGO_AQUI)
```

### Ejemplos Prácticos de Enlaces NFC:

| Colección / Llavero | Código Registrado | URL a Grabar en el Chip NFC |
| :--- | :--- | :--- |
| **Salsa Caleña Vol. 1** | `salsa-calena-1` | `https://music.mupisacali.com/?code=salsa-calena-1` |
| **Orquesta Guayacán** | `guayacan-exitos` | `https://music.mupisacali.com/?code=guayacan-exitos` |
| **Grupo Niche Edición Especial** | `niche-especial` | `https://music.mupisacali.com/?code=niche-especial` |

> ⚠️ **Importante:** Asegúrate de que el valor después de `?code=` coincida exactamente (respetando mayúsculas, minúsculas y guiones) con la clave asignada en `songs.js`.

---

## 🛠️ Desarrollo Local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Iniciar el entorno de desarrollo
   ```bash
   npm run dev
   ```

## 📄 Créditos
- **Proyecto:** MUPISA — Museo Pioneros de la Salsa Caleña.
- **Desarrollo:** [Muse Ortiz Media](https://museortizmedia.github.io/).