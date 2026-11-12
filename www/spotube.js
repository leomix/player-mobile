/**
 * Aura Player - Mobile Spotube & YouTube Engine
 * Extractor modular para Android / Web
 */

window.AuraSpotube = (function() {
  'use strict';

  // Caché de peticiones
  const cache = new Map();

  /**
   * Extrae metadatos de enlaces de Spotify (Track, Album, Playlist, Artist)
   * Sin necesidad de API keys, mediante páginas públicas de Embed
   */
  async function parseSpotifyUrl(url) {
    const cleanUrl = url.trim().split('?')[0];
    const match = cleanUrl.match(/open\.spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/);
    if (!match) {
      throw new Error('Enlace de Spotify inválido. Debe ser de tipo track, album, playlist o artist.');
    }

    const type = match[1];
    const id = match[2];
    const embedUrl = `https://open.spotify.com/embed/${type}/${id}`;

    const res = await fetch(embedUrl);
    if (!res.ok) {
      throw new Error(`No se pudo consultar Spotify (HTTP ${res.status})`);
    }

    const html = await res.text();
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (!nextDataMatch) {
      throw new Error('No se encontraron datos en la página de Spotify.');
    }

    const data = JSON.parse(nextDataMatch[1]);
    const entity = data?.props?.pageProps?.state?.data?.entity;
    if (!entity) {
      throw new Error('No se pudo leer la entidad de Spotify.');
    }

    const title = entity.name || entity.title || 'Desconocido';
    const cover = entity.coverArt?.sources?.[0]?.url || entity.images?.[0]?.url || '';
    const subtitle = entity.subtitle || (entity.artists ? entity.artists.map(a => a.name).join(', ') : '');

    let tracks = [];

    if (type === 'track') {
      tracks.push({
        name: entity.name,
        artist: subtitle,
        album: entity.album?.name || '',
        durationMs: entity.duration || 0,
        coverUrl: cover,
        spotifyUrl: cleanUrl
      });
    } else if (type === 'album') {
      const trackList = entity.trackList || [];
      tracks = trackList.map(t => ({
        name: t.title || t.name,
        artist: t.subtitle || subtitle,
        album: title,
        durationMs: t.duration || 0,
        coverUrl: cover,
        spotifyUrl: cleanUrl
      }));
    } else if (type === 'playlist') {
      const trackList = entity.trackList || [];
      tracks = trackList.map(t => ({
        name: t.title || t.name,
        artist: t.subtitle || 'Varios Artistas',
        album: title,
        durationMs: t.duration || 0,
        coverUrl: cover,
        spotifyUrl: cleanUrl
      }));
    } else if (type === 'artist') {
      const trackList = entity.trackList || [];
      tracks = trackList.map(t => ({
        name: t.title || t.name,
        artist: title,
        album: '',
        durationMs: t.duration || 0,
        coverUrl: cover,
        spotifyUrl: cleanUrl
      }));
    }

    return {
      type,
      id,
      title,
      subtitle,
      coverUrl: cover,
      tracksCount: tracks.length,
      tracks
    };
  }

  /**
   * Obtiene la letra sincronizada (.lrc) desde LRCLIB
   */
  async function fetchLrclibLyrics(trackName, artistName, durationSeconds = 0) {
    try {
      let targetUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(trackName)}&artist_name=${encodeURIComponent(artistName)}`;
      if (durationSeconds > 0) {
        targetUrl += `&duration=${Math.round(durationSeconds)}`;
      }

      let res = await fetch(targetUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.syncedLyrics) return data.syncedLyrics;
        if (data.plainLyrics) return data.plainLyrics;
      }

      // Fallback a búsqueda
      const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(trackName + ' ' + artistName)}`;
      const searchRes = await fetch(searchUrl);
      if (searchRes.ok) {
        const results = await searchRes.json();
        if (Array.isArray(results) && results.length > 0) {
          const matched = results.find(r => r.syncedLyrics) || results[0];
          return matched.syncedLyrics || matched.plainLyrics || null;
        }
      }
    } catch (e) {
      console.warn('Error consultando LRCLIB:', e);
    }
    return null;
  }

  /**
   * Busca en YouTube el videoID correspondiente a una canción
   */
  async function searchYouTubeVideo(query) {
    try {
      const searchRes = await fetch('https://www.youtube.com/youtubei/v1/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: { client: { clientName: 'WEB', clientVersion: '2.20230522.01.00', hl: 'es', gl: 'MX' } },
          query: query
        })
      });

      if (searchRes.ok) {
        const data = await searchRes.json();
        const text = JSON.stringify(data);
        const match = text.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
        if (match) return match[1];
      }
    } catch (e) {
      console.warn('Error en búsqueda YouTube Innertube:', e);
    }

    // Fallback a búsqueda HTML regular
    try {
      const htmlRes = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
      if (htmlRes.ok) {
        const html = await htmlRes.text();
        const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
        if (match) return match[1];
      }
    } catch (e) {
      console.warn('Error en búsqueda YouTube HTML:', e);
    }

    return null;
  }

  /**
   * Resuelve el enlace de stream de audio para un VideoID o URL de YouTube
   * Utiliza el plugin nativo si está disponible en Android (NewPipeExtractor)
   * o proveedores de streaming compatibles
   */
  async function resolveAudioStream(videoIdOrUrl, preferredFormat = 'm4a') {
    let videoId = videoIdOrUrl;
    if (videoIdOrUrl.includes('watch?v=')) {
      const m = videoIdOrUrl.match(/v=([a-zA-Z0-9_-]{11})/);
      if (m) videoId = m[1];
    } else if (videoIdOrUrl.includes('youtu.be/')) {
      const m = videoIdOrUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
      if (m) videoId = m[1];
    }

    // Si Capacitor tiene un plugin nativo de extracción registrado
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.StreamExtractor) {
      try {
        const nativeRes = await window.Capacitor.Plugins.StreamExtractor.getStream({ videoId, format: preferredFormat });
        if (nativeRes && nativeRes.url) {
          return nativeRes;
        }
      } catch (err) {
        console.warn('Fallo en StreamExtractor nativo, usando fallback:', err);
      }
    }

    // Fallback público de streaming de audio
    const publicResolvers = [
      `https://pipedapi.kavin.rocks/streams/${videoId}`,
      `https://api.piped.privacydev.net/streams/${videoId}`
    ];

    for (const endpoint of publicResolvers) {
      try {
        const res = await fetch(endpoint, { signal: AbortSignal.timeout(6000) });
        if (res.ok) {
          const d = await res.json();
          const streams = d.audioStreams || [];
          if (streams.length > 0) {
            let selected = streams[0];
            if (preferredFormat === 'opus') {
              selected = streams.find(s => s.codec && s.codec.includes('opus')) || streams[0];
            } else if (preferredFormat === 'm4a') {
              selected = streams.find(s => s.codec && (s.codec.includes('mp4a') || s.codec.includes('aac'))) || streams[0];
            }
            return {
              title: d.title,
              artist: d.uploader,
              url: selected.url,
              format: preferredFormat,
              duration: d.duration
            };
          }
        }
      } catch (e) {
        // Continuar siguiente fallback
      }
    }

    throw new Error('No se pudo resolver el stream de audio. Verifica tu conexión de red.');
  }

  /**
   * Descarga un archivo a través de Blob y enlace virtual
   * En Capacitor Android, esto activa el Gestor de Descargas nativo de Android
   */
  async function downloadBlobFile(blobOrUrl, filename) {
    let blobUrl = blobOrUrl;
    if (typeof blobOrUrl === 'string' && !blobOrUrl.startsWith('blob:')) {
      const r = await fetch(blobOrUrl);
      const b = await r.blob();
      blobUrl = URL.createObjectURL(b);
    }

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      if (typeof blobOrUrl === 'string' && !blobOrUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    }, 1000);
  }

  return {
    parseSpotifyUrl,
    fetchLrclibLyrics,
    searchYouTubeVideo,
    resolveAudioStream,
    downloadBlobFile
  };
})();
