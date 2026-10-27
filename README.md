# 📚 Documentación Interna — MUPISA Music

Este repositorio contiene la aplicación web del **Museo Pioneros de la Salsa Caleña (MUPISA)**, diseñada para ofrecer una experiencia de reproducción musical interactiva a través de llaveros físicos con tecnología **NFC**.

---

## ⚙️ ¿Cómo funciona la aplicación? (Arquitectura Técnica)

1. **Lectura de Parámetros NFC / URL:**
   - Al acercar el llavero al teléfono, se abre la web soportando dos parámetros opcionales en la cadena de consulta: `?code=CODIGO` y `id=ID_UNICO`.
   - **Sistema Híbrido (Diccionario + Respaldo):** 
     - La aplicación primero verifica si existe el parámetro `id` en el archivo de mapeo remoto (`src/data/idMap.json`). Si el ID está registrado allí, utiliza el código de colección asociado.
     - Si no hay un `id`, o el ID no se encuentra en el diccionario, la aplicación recurre por defecto al parámetro `code` directo de la URL (garantizando compatibilidad con los llaveros antiguos).
   - La colección se valida mediante `getCollectionByCode(activeCode)` y se almacena en `sessionStorage` (`llavero_code`) para persistir la sesión ante recargas.

2. **Panel de Biblioteca e Historial (`LibrarySidebar.jsx`):**
   - Panel lateral deslizante que almacena localmente (`localStorage` bajo la clave `mupisa_library`) cada llavero o colección escaneada exitosamente.
   - Permite al usuario reanudar colecciones pasadas con un solo toque sin requerir el llavero físico.

3. **Reproductor de Vinilo Interactivo (`VinylPlayer.jsx`):**
   - Simula un tocadiscos real usando **Framer Motion**.
   - **Disco:** Gira de forma continua mediante `requestAnimationFrame` al reproducir.
   - **Brazo de Aguja:** Rota dinámicamente según el progreso de la pista (`progress`).

4. **Gestión de Audio:**
   - Utiliza la API nativa de JavaScript (`Audio`) integrada con `audioService.js` para streaming y control de reproducción (`play`, `pause`, `seek`, `next`, `prev`).

---

## 🗂️ Estructura de Datos y Configuración Remota

### 1. Base de datos estática de canciones: `src/data/songs.js`
Define las colecciones musicales del museo, asociando un identificador de colección (`code`) con sus metadatos y pistas de audio:
```javascript
export const collections = {
  "codigo-de-coleccion": {
    id: "codigo-de-coleccion",
    name: "Nombre de Colección",
    spotify: "https://open.spotify.com/...",
    youtubeMusic: "https://music.youtube.com/...",
    songs: [
      {
        title: "Título",
        artist: "Artista",
        cover: portadaImg,
        mp3: audioMp3,
      }
    ]
  }
};
```

### 2. Diccionario de reasignación remota de IDs: `src/data/idMap.json`
Permite reasignar dinámicamente qué colección reproduce un llavero específico sin alterar el código físico grabado en su chip NFC.
- **Ubicación:** `src/data/idMap.json`
- **Estructura:**
  ```json
  {
    "LLAV-001": "codigo-de-coleccion-A",
    "LLAV-002": "codigo-de-coleccion-B"
  }
  ```

---

## 🔗 Estructura de Enlaces NFC (Físicos)

Cada llavero NFC se programa apuntando al dominio del museo utilizando uno de los dos métodos:

1. **Método Directo (Llaveros Tradicionales):**
   ```text
   https://music.mupisacali.com/?code=codigo-de-coleccion
   ```
2. **Método Dinámico con ID Único (Control Remoto / Analítica):**
   ```text
   https://music.mupisacali.com/?code=codigo-base&id=LLAV-001
   ```

---

## 🛠️ Entorno de Desarrollo Local

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```