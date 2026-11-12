# Aura Audio & Lyrics Player - Versión Android (Capacitor)

Bifurcación móvil oficial de **Aura Player** optimizada para dispositivos Android mediante **Capacitor**. Mantiene el 100% de la funcionalidad de escritorio (parser inteligente de roll-up de YouTube, romanizador multilingüe, soporte para `.opus`, `.m4a`, `.mp3`, letras sincronizadas de LRCLIB) agregando una interfaz táctil moderna con pestañas inferiores, sintonizador de radio por internet y motor de extracción estilo **Spotube**.

---

## 🚀 Características Principales

1. **Interfaz Móvil Adaptable:**
   - **Pestaña Música:** Selector nativo de archivos del teléfono (`.opus`, `.m4a`, `.mp3`, etc.) con emparejamiento automático de subtítulos `.lrc`.
   - **Pestaña Letras:** Escenario de visualización con superposición por bloques (*YouTube Roll-Up Style*) o lista completa desplazable.
   - **Pestaña Radios:** Emisoras online en vivo precargadas (Lofi Girl, Synthwave Plaza, Anime Nights, Rock, Jazz) y sintonizador Icecast/AAC.
   - **Pestaña Descargas:** Búsqueda y streaming/descarga de Spotify y YouTube.
   - **Mini-Reproductor Flotante:** Fijado sobre la barra de navegación que se expande a la vista de letras al tocarlo.

2. **Motor de Extracción Estilo Spotube (`spotube.js`):**
   - Extrae metadatos de Spotify sin credenciales de desarrollador mediante páginas públicas de *Embed* (Canciones, Álbumes, Playlists, Artistas).
   - Busca el stream oficial en YouTube y descarga/reproduce en formato nativo Opus o M4A.
   - Descarga automática de letras sincronizadas palabra por palabra desde **LRCLIB**.

3. **Capacitor 6 + Android:**
   - Permisos nativos configurados en `AndroidManifest.xml` (`READ_MEDIA_AUDIO`, `WAKE_LOCK`, `INTERNET`, `usesCleartextTraffic`).
   - Reproducción sin interrupciones con pantalla bloqueada o en segundo plano.

---

## 🛠️ Cómo Compilar el APK

### Opción 1: Compilación Automática en la Nube (GitHub Actions - Recomendada)
No necesitas tener Android Studio ni Java instalado en tu computadora.

1. Sube este proyecto a tu repositorio de GitHub:
   ```bash
   git init
   git add .
   git commit -m "Aura Player Android"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```
2. Entra a tu repositorio en GitHub y haz clic en la pestaña **Actions**.
3. Verás ejecutándose el flujo **Build Android APK** (definido en `.github/workflows/build-apk.yml`).
4. Al terminar (tarda ~2 minutos), haz clic en la ejecución y descarga el archivo **`AuraPlayer-Debug-APK`**.
5. Transfiere el archivo `.apk` a tu teléfono Android e instálalo directamente.

---

### Opción 2: Compilación Local con Android Studio
Si tienes o instalas Android Studio:

1. Ejecuta en esta carpeta:
   ```bash
   npm run open:android
   ```
2. Android Studio se abrirá con el proyecto listo.
3. En la barra superior de Android Studio, haz clic en **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
4. El archivo generado estará en:
   `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## 📁 Estructura del Proyecto

```
c:\xampp\htdocs\player-mobile\
├── .github/workflows/build-apk.yml   # Flujo CI/CD de compilación automática
├── android/                          # Proyecto nativo Gradle de Android Studio
│   └── app/src/main/AndroidManifest.xml
├── www/                              # Frontend Web adaptado para Android
│   ├── index.html                    # Layout táctil con barra de navegación móvil
│   ├── style.css                     # Estilos responsivos móviles y tema oscuro
│   ├── app.js                        # Lógica de reproducción y selector de archivos
│   ├── spotube.js                    # Motor Spotube (Spotify + YouTube + LRCLIB)
│   ├── parsers.js                    # Parser inteligente de LRC y Roll-up
│   └── romanizer.js                  # Romanizador Hangul, Cirílico, Griego y Kana
├── capacitor.config.json             # Configuración de Capacitor con CapacitorHttp activo
└── package.json                      # Dependencias de Capacitor
```
