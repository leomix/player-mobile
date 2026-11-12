/**
 * Aplicación Reproductor de Audio y Subtítulos Progresivos en Una Línea Activa
 */

const state = {
  currentFolder: null,
  songs: [],
  filteredSongs: [],
  currentSongIndex: -1,
  currentSong: null,
  lyrics: [],
  currentLyricIndex: -1,
  renderedBlocksKey: '',
  syncOffset: 0.0,
  isPlaying: false,
  isShuffle: false,
  repeatMode: 0,
  playbackSpeed: 1.0,
  isDraggingProgress: false,
  previousVolume: 0.8,
  viewMode: 'youtube', // 'youtube' (bloques superpuestos) o 'list' (lista completa)
  isRomanizeEnabled: false,
  currentSubtitleType: null, // 'LRC', 'SRT', 'VTT'
  animationFrameId: null
};

// Referencias del DOM
const elements = {
  audio: document.getElementById('audioElement'),
  btnOpenFolder: document.getElementById('btnOpenFolder'),
  searchInput: document.getElementById('searchInput'),
  btnClearSearch: document.getElementById('btnClearSearch'),
  folderPathText: document.getElementById('folderPathText'),
  folderStatsText: document.getElementById('folderStatsText'),
  songList: document.getElementById('songList'),
  emptyListState: document.getElementById('emptyListState'),

  // Header
  headerTitle: document.getElementById('headerTitle'),
  headerArtist: document.getElementById('headerArtist'),
  headerCover: document.getElementById('headerCover'),
  ambientBg: document.getElementById('ambientBg'),

  // Sync Offset y Vistas
  btnOffsetMinus: document.getElementById('btnOffsetMinus'),
  btnOffsetPlus: document.getElementById('btnOffsetPlus'),
  btnOffsetReset: document.getElementById('btnOffsetReset'),
  offsetValueText: document.getElementById('offsetValueText'),
  btnRomanize: document.getElementById('btnRomanize'),
  btnRomanizeText: document.getElementById('btnRomanizeText'),
  btnToggleViewMode: document.getElementById('btnToggleViewMode'),
  btnViewModeText: document.getElementById('btnViewModeText'),
  btnLoadSubtitleManual: document.getElementById('btnLoadSubtitleManual'),
  btnSubtitleText: document.getElementById('btnSubtitleText'),

  // Stage Superposición por Bloques (YouTube Style)
  youtubeStage: document.getElementById('youtubeStage'),
  stageTitle: document.getElementById('stageTitle'),
  stageArtist: document.getElementById('stageArtist'),
  stageCoverImg: document.getElementById('stageCoverImg'),
  stageCoverFallback: document.getElementById('stageCoverFallback'),
  ytCaptionWindow: document.getElementById('ytCaptionWindow'),

  // Vista alternativa de lista completa
  lyricsViewport: document.getElementById('lyricsViewport'),
  lyricsContainer: document.getElementById('lyricsContainer'),
  lyricsPlaceholder: document.getElementById('lyricsPlaceholder'),

  // Footer Player
  currentCoverImg: document.getElementById('currentCoverImg'),
  coverFallback: document.getElementById('coverFallback'),
  currentTitle: document.getElementById('currentTitle'),
  currentArtist: document.getElementById('currentArtist'),
  currentSubBadge: document.getElementById('currentSubBadge'),

  // Controles
  btnShuffle: document.getElementById('btnShuffle'),
  btnPrev: document.getElementById('btnPrev'),
  btnPlayPause: document.getElementById('btnPlayPause'),
  iconPlay: document.getElementById('iconPlay'),
  iconPause: document.getElementById('iconPause'),
  btnNext: document.getElementById('btnNext'),
  btnRepeat: document.getElementById('btnRepeat'),
  repeatOneIndicator: document.getElementById('repeatOneIndicator'),

  // Progreso interactivo
  timeCurrent: document.getElementById('timeCurrent'),
  timeTotal: document.getElementById('timeTotal'),
  progressBarWrapper: document.getElementById('progressBarWrapper'),
  progressBarFill: document.getElementById('progressBarFill'),
  progressBarThumb: document.getElementById('progressBarThumb'),

  // Velocidad y Volumen
  btnSpeed: document.getElementById('btnSpeed'),
  speedContainer: document.getElementById('speedContainer'),
  speedSliderWrapper: document.getElementById('speedSliderWrapper'),
  speedSlider: document.getElementById('speedSlider'),
  btnSpeedReset: document.getElementById('btnSpeedReset'),
  btnMute: document.getElementById('btnMute'),
  iconVolumeHigh: document.getElementById('iconVolumeHigh'),
  iconVolumeMute: document.getElementById('iconVolumeMute'),
  volumeRange: document.getElementById('volumeRange'),

  // Modal Descarga de YouTube
  btnOpenDownloadModal: document.getElementById('btnOpenDownloadModal'),
  ytDownloadModal: document.getElementById('ytDownloadModal'),
  btnCloseYtModal: document.getElementById('btnCloseYtModal'),
  btnCancelYtDownload: document.getElementById('btnCancelYtDownload'),
  ytUrlInput: document.getElementById('ytUrlInput'),
  btnPasteYtUrl: document.getElementById('btnPasteYtUrl'),
  ytTargetFolderText: document.getElementById('ytTargetFolderText'),
  btnChangeYtFolder: document.getElementById('btnChangeYtFolder'),
  chkYtPlaylist: document.getElementById('chkYtPlaylist'),
  selectYtFormat: document.getElementById('selectYtFormat'),
  btnStartYtDownload: document.getElementById('btnStartYtDownload'),
  btnStartYtDownloadText: document.getElementById('btnStartYtDownloadText'),
  ytProgressContainer: document.getElementById('ytProgressContainer'),
  ytProgressStatus: document.getElementById('ytProgressStatus'),
  ytProgressPercent: document.getElementById('ytProgressPercent'),
  ytProgressBarFill: document.getElementById('ytProgressBarFill'),
  ytProgressSpeed: document.getElementById('ytProgressSpeed'),
  ytProgressEta: document.getElementById('ytProgressEta'),
  ytDownloadError: document.getElementById('ytDownloadError'),

  // Modal Descarga de Spotify
  btnOpenSpotifyModal: document.getElementById('btnOpenSpotifyModal'),
  spotifyDownloadModal: document.getElementById('spotifyDownloadModal'),
  btnCloseSpotifyModal: document.getElementById('btnCloseSpotifyModal'),
  btnCancelSpotifyDownload: document.getElementById('btnCancelSpotifyDownload'),
  spotifyUrlInput: document.getElementById('spotifyUrlInput'),
  btnPasteSpotifyUrl: document.getElementById('btnPasteSpotifyUrl'),
  btnAnalyzeSpotify: document.getElementById('btnAnalyzeSpotify'),
  spotifyTargetFolderText: document.getElementById('spotifyTargetFolderText'),
  btnChangeSpotifyFolder: document.getElementById('btnChangeSpotifyFolder'),
  selectSpotifyFormat: document.getElementById('selectSpotifyFormat'),
  spotifyPreviewCard: document.getElementById('spotifyPreviewCard'),
  spotifyPreviewCover: document.getElementById('spotifyPreviewCover'),
  spotifyPreviewType: document.getElementById('spotifyPreviewType'),
  spotifyPreviewTitle: document.getElementById('spotifyPreviewTitle'),
  spotifyPreviewSubtitle: document.getElementById('spotifyPreviewSubtitle'),
  spotifyPreviewCount: document.getElementById('spotifyPreviewCount'),
  spotifyTrackList: document.getElementById('spotifyTrackList'),
  spotifyProgressContainer: document.getElementById('spotifyProgressContainer'),
  spotifyCurrentTrackName: document.getElementById('spotifyCurrentTrackName'),
  spotifyBatchCount: document.getElementById('spotifyBatchCount'),
  spotifyProgressBarFill: document.getElementById('spotifyProgressBarFill'),
  spotifyProgressStatus: document.getElementById('spotifyProgressStatus'),
  spotifyLrcStatus: document.getElementById('spotifyLrcStatus'),
  spotifyDownloadError: document.getElementById('spotifyDownloadError'),
  btnStartSpotifyDownload: document.getElementById('btnStartSpotifyDownload'),
  btnStartSpotifyDownloadText: document.getElementById('btnStartSpotifyDownloadText')
};

// ========================================================
// INICIALIZACIÓN
// ========================================================
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  elements.audio.volume = parseFloat(elements.volumeRange.value);
  startPlaybackLoop();
});

function setupEventListeners() {
  elements.btnOpenFolder.addEventListener('click', handleOpenFolder);

  elements.searchInput.addEventListener('input', handleSearchInput);
  elements.btnClearSearch.addEventListener('click', () => {
    elements.searchInput.value = '';
    elements.btnClearSearch.classList.add('hidden');
    renderSongList(state.songs);
  });

  elements.btnPlayPause.addEventListener('click', togglePlayPause);
  elements.btnNext.addEventListener('click', playNextSong);
  elements.btnPrev.addEventListener('click', playPrevSong);
  elements.btnShuffle.addEventListener('click', toggleShuffle);
  elements.btnRepeat.addEventListener('click', toggleRepeat);

  // Inicializar barra de progreso interactiva (Seekbar)
  setupProgressBar();

  // Inicializar selector de velocidad de reproducción
  setupSpeedControl();

  elements.audio.addEventListener('loadedmetadata', onAudioLoadedMetadata);
  elements.audio.addEventListener('ended', onAudioEnded);
  elements.audio.addEventListener('play', () => updatePlayPauseUI(true));
  elements.audio.addEventListener('pause', () => updatePlayPauseUI(false));

  elements.volumeRange.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    elements.audio.volume = val;
    updateVolumeUI(val);
  });
  elements.btnMute.addEventListener('click', toggleMute);

  // Sync Offset
  elements.btnOffsetMinus.addEventListener('click', () => changeOffset(-0.2));
  elements.btnOffsetPlus.addEventListener('click', () => changeOffset(0.2));
  elements.btnOffsetReset.addEventListener('click', () => {
    state.syncOffset = 0.0;
    updateOffsetUI();
  });

  // Romanización al vuelo
  if (elements.btnRomanize) {
    elements.btnRomanize.addEventListener('click', toggleRomanize);
  }

  // Selector manual de subtítulo
  elements.btnLoadSubtitleManual.addEventListener('click', handleLoadManualSubtitle);

  // Alternar vista: 1 Línea vs Lista
  elements.btnToggleViewMode.addEventListener('click', toggleViewMode);

  // Atajos de teclado
  document.addEventListener('keydown', handleKeyShortcuts);

  // Drag and drop
  setupDragAndDrop();

  // Descargador de YouTube con yt-dlp
  setupYouTubeDownloader();

  // Descargador de Spotify con yt-dlp + LRCLIB
  setupSpotifyDownloader();

  // Inicialización de selector de archivos móvil
  const mobileFileInput = document.getElementById('mobileFileInput');
  if (mobileFileInput) {
    mobileFileInput.addEventListener('change', (e) => {
      loadFilesFromMobileInput(e.target.files);
    });
  }
  const mobileFolderInput = document.getElementById('mobileFolderInput');
  if (mobileFolderInput) {
    mobileFolderInput.addEventListener('change', (e) => {
      loadFilesFromMobileInput(e.target.files);
    });
  }

  // Navegación por pestañas móvil y sistema de Radio Online
  initMobileNavigation();
  initRadioSystem();
}

// ========================================================
// SISTEMA DE NAVEGACIÓN MÓVIL Y RADIOS ONLINE
// ========================================================
function initMobileNavigation() {
  document.body.classList.add('tab-songs');

  const tabs = [
    { id: 'tabBtnSongs', tab: 'tab-songs' },
    { id: 'tabBtnLyrics', tab: 'tab-lyrics' },
    { id: 'tabBtnRadios', tab: 'tab-radios' },
    { id: 'tabBtnDownloads', tab: 'tab-downloads' }
  ];

  tabs.forEach(t => {
    const btn = document.getElementById(t.id);
    if (!btn) return;
    btn.addEventListener('click', () => {
      document.body.classList.remove('tab-songs', 'tab-lyrics', 'tab-radios', 'tab-downloads');
      document.body.classList.add(t.tab);
      document.querySelectorAll('.mobile-nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (t.tab === 'tab-radios') {
        const modal = document.getElementById('radiosModal');
        if (modal) modal.classList.remove('hidden');
      } else if (t.tab === 'tab-downloads') {
        openSpotifyModal();
      }
    });
  });

  // Tap en el reproductor inferior en móvil -> abre pestaña de letras automáticamente
  const playerBar = document.querySelector('.player-bar');
  if (playerBar) {
    playerBar.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && !e.target.closest('button') && !e.target.closest('input')) {
        const lyricsBtn = document.getElementById('tabBtnLyrics');
        if (lyricsBtn) lyricsBtn.click();
      }
    });
  }
}

const RADIO_PRESETS = [
  { name: 'Lofi Girl (Chillhop)', genre: 'Lo-Fi / Study & Relax', url: 'https://play.streamafrica.net/lofiradio' },
  { name: 'Nightwave Plaza', genre: 'Synthwave / Vaporwave', url: 'https://plaza.one/mp3' },
  { name: 'Anime Radio Nights', genre: 'J-Pop / Anime Soundtracks', url: 'https://cast1.torontocast.com:2160/stream' },
  { name: 'Chillhop Café', genre: 'Beats to study / sleep', url: 'https://streams.ilovemusic.de/iloveradio17.mp3' },
  { name: 'Rock Antenne', genre: 'Classic & Modern Rock', url: 'https://stream.rockantenne.de/rockantenne/stream/mp3' },
  { name: 'Jazz Radio', genre: 'Pure Jazz & Blues', url: 'https://jazz-wr01.ice.infomaniak.ch/jazz-wr01-128.mp3' }
];

function initRadioSystem() {
  const container = document.getElementById('radioPresetsList');
  const modal = document.getElementById('radiosModal');
  const btnClose = document.getElementById('btnCloseRadiosModal');
  const btnCustom = document.getElementById('btnPlayCustomRadio');
  const inputCustom = document.getElementById('customRadioUrl');

  if (btnClose && modal) {
    btnClose.addEventListener('click', () => modal.classList.add('hidden'));
  }

  if (btnCustom && inputCustom) {
    btnCustom.addEventListener('click', () => {
      const url = inputCustom.value.trim();
      if (!url) return;
      playRadioStream('Radio Personalizada', 'Icecast / Directo', url);
      modal.classList.add('hidden');
    });
  }

  if (container) {
    container.innerHTML = '';
    RADIO_PRESETS.forEach(st => {
      const div = document.createElement('div');
      div.className = 'radio-preset-item';
      div.innerHTML = `
        <div class="radio-preset-info">
          <span class="radio-preset-name">${st.name}</span>
          <span class="radio-preset-genre">${st.genre}</span>
        </div>
        <div class="radio-preset-play">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </div>
      `;
      div.addEventListener('click', () => {
        playRadioStream(st.name, st.genre, st.url);
        if (modal) modal.classList.add('hidden');
      });
      container.appendChild(div);
    });
  }
}

function playRadioStream(name, genre, url) {
  elements.audio.src = url;
  elements.audio.play().catch(e => console.warn('Error sintonizando radio:', e));
  state.currentSong = {
    title: name,
    artist: `Radio en Vivo (${genre})`,
    name: name,
    extension: 'LIVE'
  };
  elements.headerTitle.textContent = name;
  elements.headerArtist.textContent = `Radio en Vivo • ${genre}`;
  elements.stageTitle.textContent = name;
  elements.stageArtist.textContent = `Sintonizando emisión en vivo...`;
  elements.currentTitle.textContent = name;
  elements.currentArtist.textContent = genre;
  elements.currentSubBadge.textContent = 'LIVE';
  elements.currentSubBadge.classList.remove('hidden');
  showNoLyricsState();
}

// ========================================================
// BUCLE DE ALTA PRECISIÓN (60 FPS CON requestAnimationFrame)
// ========================================================
function startPlaybackLoop() {
  function loop() {
    if (!elements.audio.paused && elements.audio.duration) {
      const current = elements.audio.currentTime;
      const duration = elements.audio.duration;

      // Actualizar seekbar si no se está arrastrando
      if (!state.isDraggingProgress) {
        const percent = (current / duration) * 100;
        elements.progressBarFill.style.width = `${percent}%`;
        elements.progressBarThumb.style.left = `${percent}%`;
        elements.timeCurrent.textContent = formatTime(current);
      }

      // Sincronizar subtítulos con Superposición por Bloques estilo YouTube
      updateYoutubeOverlappingCaptions(current);
    }
    state.animationFrameId = requestAnimationFrame(loop);
  }
  state.animationFrameId = requestAnimationFrame(loop);
}

/**
 * Motor de Superposición por Bloques (Overlapping) estilo YouTube:
 * Mantiene en pantalla una ventana contextual de 2 líneas (Roll-up):
 *   - Bloque superior: Línea previa de contexto ya leída.
 *   - Bloque inferior: Línea activa donde se resalta la palabra en curso con GLOW.
 * Soporta también cues con solapamiento temporal nativo en el archivo fuente.
 */
function updateYoutubeOverlappingCaptions(currentTime) {
  if (!state.lyrics || state.lyrics.length === 0) return;

  const effectiveTime = currentTime + state.syncOffset;
  const cues = state.lyrics;
  const isLrc = state.currentSubtitleType === 'LRC' ||
    (state.currentSong && state.currentSong.subtitle && state.currentSong.subtitle.type.toUpperCase() === 'LRC');

  // 1. Identificar cues con tiempo activo directo
  const directActive = [];
  let primaryActiveIdx = -1;

  for (let i = 0; i < cues.length; i++) {
    const cue = cues[i];
    if (effectiveTime >= cue.start && effectiveTime <= cue.end) {
      directActive.push({ cue, index: i, role: 'active' });
      if (primaryActiveIdx === -1) primaryActiveIdx = i;
    }
  }

  // Si no hay ninguna cue activa directamente en este instante
  if (directActive.length === 0) {
    // A) Antes de que empiece la primera frase
    if (effectiveTime < cues[0].start) {
      renderYtSpecialBlock('intro', '♪ [Introducción] ♪');
      return;
    }

    // B) Después de que terminó la última frase
    if (effectiveTime > cues[cues.length - 1].end) {
      renderYtSpecialBlock('end', '♪ [Fin de la canción] ♪');
      return;
    }

    // C) Interludio entre dos frases
    let lastPassedIdx = -1;
    for (let i = 0; i < cues.length; i++) {
      if (cues[i].end < effectiveTime) lastPassedIdx = i;
    }

    if (isLrc) {
      // Para LRC: no mostrar frase anterior ni siguiente, solo interludio
      renderYtSpecialBlock('interlude', '♪ [Interludio Instrumental] ♪');
    } else {
      // Para SRT/VTT: si la última frase terminó hace poco (< 2.5s), mantenerla como contexto
      if (lastPassedIdx >= 0 && (effectiveTime - cues[lastPassedIdx].end) < 2.5) {
        const bPrev = { cue: cues[lastPassedIdx], index: lastPassedIdx, role: 'context' };
        mountYtBlocks([bPrev], effectiveTime);
      } else {
        renderYtSpecialBlock('interlude', '♪ [Interludio Instrumental] ♪');
      }
    }
    return;
  }

  // 2. Determinar los bloques a mostrar en pantalla
  let blocksToDisplay = [];

  if (isLrc) {
    // PARA SUBTÍTULOS LRC: ocultar frase anterior y frase siguiente, dejando SOLO la frase actual
    const activeItem = directActive[directActive.length - 1];
    primaryActiveIdx = activeItem.index;
    blocksToDisplay = [{ cue: activeItem.cue, index: activeItem.index, role: 'active' }];
  } else {
    // PARA OTROS FORMATOS (SRT, VTT): mantener superposición contextual estilo YouTube
    if (directActive.length >= 2) {
      blocksToDisplay = [
        { cue: directActive[0].cue, index: directActive[0].index, role: 'context' },
        { cue: directActive[1].cue, index: directActive[1].index, role: 'active' }
      ];
    } else {
      const activeItem = directActive[0];
      const prevCue = cues[activeItem.index - 1];

      // Si existe una frase previa y no ocurrió hace mucho tiempo (menos de 6s), superponerla arriba
      if (prevCue && (effectiveTime - prevCue.end) < 6.0) {
        blocksToDisplay.push({ cue: prevCue, index: activeItem.index - 1, role: 'context' });
      }
      blocksToDisplay.push({ cue: activeItem.cue, index: activeItem.index, role: 'active' });
    }
  }

  // Montar y actualizar los bloques superpuestos
  mountYtBlocks(blocksToDisplay, effectiveTime);

  // Sincronizar también lista vertical si está visible
  if (state.viewMode === 'list' && primaryActiveIdx >= 0) {
    highlightActiveInList(primaryActiveIdx);
  }
}

/**
 * Monta los bloques en el DOM sólo cuando cambian de conjunto (evitando recrear en cada frame)
 */
function mountYtBlocks(blocks, effectiveTime) {
  const isLrc = state.currentSubtitleType === 'LRC' ||
    (state.currentSong && state.currentSong.subtitle && state.currentSong.subtitle.type.toUpperCase() === 'LRC');
  const romSuffix = state.isRomanizeEnabled ? '__rom' : '';
  const lrcSuffix = isLrc ? '__lrc' : '';
  const key = blocks.map(b => `${b.cue.id}-${b.role}`).join('__') + romSuffix + lrcSuffix;

  if (state.renderedBlocksKey !== key) {
    state.renderedBlocksKey = key;
    elements.ytCaptionWindow.innerHTML = '';

    const fragment = document.createDocumentFragment();

    blocks.forEach((b) => {
      const blockDiv = document.createElement('div');
      let roleClass = 'yt-block-context';
      if (b.role === 'active') {
        roleClass = isLrc ? 'yt-block-active yt-block-plain' : 'yt-block-active';
      } else if (b.role === 'upcoming') {
        roleClass = 'yt-block-upcoming';
      }
      blockDiv.className = `yt-block ${roleClass}`;
      blockDiv.dataset.cueId = b.cue.id;
      blockDiv.dataset.role = b.role;

      const words = b.cue.words || [{ text: b.cue.text, start: b.cue.start, end: b.cue.end }];
      words.forEach((w, wIdx) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = isLrc ? 'yt-word plain' : 'yt-word pending';
        wordSpan.dataset.wordIdx = wIdx;

        const displayText = state.isRomanizeEnabled && window.romanizeText
          ? window.romanizeText(w.text)
          : w.text;
        wordSpan.textContent = displayText;

        wordSpan.addEventListener('click', (e) => {
          e.stopPropagation();
          seekToLyric(w.start);
        });

        blockDiv.appendChild(wordSpan);
      });

      blockDiv.addEventListener('click', () => {
        seekToLyric(b.cue.start);
      });

      fragment.appendChild(blockDiv);
    });

    elements.ytCaptionWindow.appendChild(fragment);
  }

  // Actualizar estado de las palabras en tiempo real dentro de cada bloque montado
  const blockElements = elements.ytCaptionWindow.querySelectorAll('.yt-block');
  blocks.forEach((b, bIdx) => {
    const blockEl = blockElements[bIdx];
    if (!blockEl) return;

    const words = b.cue.words || [{ text: b.cue.text, start: b.cue.start, end: b.cue.end }];
    const wordSpans = blockEl.querySelectorAll('.yt-word');

    words.forEach((w, wIdx) => {
      const span = wordSpans[wIdx];
      if (!span) return;

      if (isLrc) {
        // En LRC no se resalta la palabra en curso: se muestra la frase limpia y uniforme sin resaltar
        if (span.className !== 'yt-word plain') {
          span.className = 'yt-word plain';
        }
      } else if (b.role === 'context') {
        // Bloque previo de contexto: todas las palabras ya fueron pronunciadas
        if (span.className !== 'yt-word passed') {
          span.className = 'yt-word passed';
        }
      } else if (b.role === 'upcoming') {
        // Bloque siguiente en segundo plano: palabras aún pendientes
        if (span.className !== 'yt-word pending') {
          span.className = 'yt-word pending';
        }
      } else {
        // Bloque activo: evaluar qué palabra se está diciendo en este milisegundo exacto
        if (effectiveTime < w.start) {
          if (span.className !== 'yt-word pending') span.className = 'yt-word pending';
        } else if (effectiveTime >= w.start && effectiveTime <= w.end) {
          // Palabra activa en curso (resaltado nítido)
          if (span.className !== 'yt-word active') span.className = 'yt-word active';
        } else {
          if (span.className !== 'yt-word passed') span.className = 'yt-word passed';
        }
      }
    });
  });
}

function renderYtSpecialBlock(type, message) {
  const key = `special-${type}`;
  if (state.renderedBlocksKey !== key) {
    state.renderedBlocksKey = key;
    elements.ytCaptionWindow.innerHTML = `
      <div class="yt-block yt-block-idle">
        <span class="yt-word pending">${message}</span>
      </div>
    `;
  }
}

function highlightActiveInList(activeIndex) {
  const lines = elements.lyricsContainer.querySelectorAll('.lyric-line');
  lines.forEach((line, idx) => {
    if (idx === activeIndex) {
      line.classList.add('active');
      line.classList.remove('passed');
      line.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (idx < activeIndex) {
      line.classList.remove('active');
      line.classList.add('passed');
    } else {
      line.classList.remove('active', 'passed');
    }
  });
}

// ========================================================
// MANEJO DE ARCHIVOS Y CARPETAS
// ========================================================
async function handleOpenFolder() {
  if (window.electronAPI && window.electronAPI.selectFolder) {
    try {
      const folderPath = await window.electronAPI.selectFolder();
      if (folderPath) {
        await loadDirectory(folderPath);
      }
    } catch (err) {
      console.error('Error al abrir carpeta:', err);
      alert('No se pudo abrir la carpeta seleccionada.');
    }
    return;
  }

  // Móvil / Capacitor: Abrir selector de archivos nativo de Android
  const mobileInput = document.getElementById('mobileFileInput');
  if (mobileInput) {
    mobileInput.click();
  }
}

async function loadFilesFromMobileInput(files) {
  if (!files || !files.length) return;

  const audioFiles = [];
  const lrcMap = new Map();

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const ext = f.name.split('.').pop().toLowerCase();
    if (['mp3', 'm4a', 'opus', 'wav', 'flac', 'ogg', 'aac'].includes(ext)) {
      audioFiles.push(f);
    } else if (['lrc', 'srt', 'vtt'].includes(ext)) {
      const base = f.name.replace(/\.(lrc|srt|vtt)$/i, '').replace(/\.es$/i, '').toLowerCase();
      lrcMap.set(base, f);
    }
  }

  if (audioFiles.length === 0) {
    alert('No se encontraron archivos de audio (.mp3, .m4a, .opus, .wav, .flac) seleccionados.');
    return;
  }

  const loadedSongs = [];
  for (let idx = 0; idx < audioFiles.length; idx++) {
    const af = audioFiles[idx];
    const baseName = af.name.substring(0, af.name.lastIndexOf('.'));
    const matchedSub = lrcMap.get(baseName.toLowerCase());

    let lrcText = null;
    if (matchedSub) {
      try {
        lrcText = await matchedSub.text();
      } catch (e) {
        console.warn('Error leyendo subtítulo:', e);
      }
    }

    loadedSongs.push({
      id: 'local_' + idx + '_' + Date.now(),
      name: af.name,
      title: baseName,
      artist: 'Audio Local',
      extension: af.name.split('.').pop().toUpperCase(),
      file: af,
      url: URL.createObjectURL(af),
      lrcContent: lrcText,
      subtitle: matchedSub ? { name: matchedSub.name, type: 'LRC' } : null
    });
  }

  state.songs = loadedSongs;
  state.filteredSongs = loadedSongs;
  const withSub = loadedSongs.filter(s => s.lrcContent).length;
  elements.folderPathText.textContent = 'Almacenamiento Local';
  elements.folderStatsText.textContent = `${loadedSongs.length} canciones (${withSub} con letra)`;
  elements.emptyListState.classList.add('hidden');
  renderSongList(loadedSongs);
}

async function loadDirectory(folderPath) {
  state.currentFolder = folderPath;
  elements.folderPathText.textContent = folderPath;
  elements.folderPathText.title = folderPath;

  const songs = await window.electronAPI.scanDirectory(folderPath);
  state.songs = songs;
  state.filteredSongs = songs;

  const withSub = songs.filter(s => s.subtitle).length;
  elements.folderStatsText.textContent = `${songs.length} canciones (${withSub} con letra)`;

  renderSongList(songs);

  if (songs.length === 0) {
    elements.emptyListState.classList.remove('hidden');
    elements.emptyListState.querySelector('p').textContent = 'No se encontraron archivos de audio en esta carpeta.';
  } else {
    elements.emptyListState.classList.add('hidden');
  }
}

function renderSongList(songsToRender) {
  elements.songList.innerHTML = '';
  if (songsToRender.length === 0) return;

  songsToRender.forEach((song, index) => {
    const li = document.createElement('li');
    li.className = 'song-item';
    if (state.currentSong && state.currentSong.id === song.id) {
      li.classList.add('active');
    }

    let badgeHtml = '';
    if (song.subtitle) {
      const type = song.subtitle.type.toLowerCase();
      badgeHtml = `<span class="sub-badge badge-${type}">${type}</span>`;
    } else {
      badgeHtml = `<span class="sub-badge badge-none">Sin letra</span>`;
    }

    li.innerHTML = `
      <div class="song-item-left">
        <span class="song-index" id="songIndex_${song.id}">
          ${state.currentSong && state.currentSong.id === song.id && state.isPlaying 
            ? getSoundWaveHtml() 
            : (index + 1)}
        </span>
        <div class="song-info">
          <span class="song-title" title="${song.relativeFolder ? song.relativeFolder + '/' : ''}${song.fileName}">${song.name}</span>
          <span class="song-artist">${song.artist ? song.artist + ' • ' : ''}${song.relativeFolder ? song.relativeFolder + ' • ' : ''}${song.extension} • ${song.subtitle ? song.subtitle.type : 'Audio'}</span>
        </div>
      </div>
      <div class="song-badges">
        ${badgeHtml}
      </div>
    `;

    li.addEventListener('dblclick', () => {
      const actualIndex = state.songs.findIndex(s => s.id === song.id);
      playSongAtIndex(actualIndex);
    });

    elements.songList.appendChild(li);
  });
}

function getSoundWaveHtml() {
  return `<div class="sound-wave"><span></span><span></span><span></span></div>`;
}

// ========================================================
// REPRODUCCIÓN
// ========================================================
async function playSongAtIndex(index) {
  if (index < 0 || index >= state.songs.length) return;

  state.currentSongIndex = index;
  const song = state.songs[index];
  state.currentSong = song;

  updateActiveSongInList();

  state.lyrics = [];
  state.currentLyricIndex = -1;
  state.syncOffset = 0.0;
  updateOffsetUI();

  let mediaUrl = song.url;
  if (!mediaUrl && window.electronAPI && window.electronAPI.getMediaUrl) {
    mediaUrl = await window.electronAPI.getMediaUrl(song.filePath);
  }
  elements.audio.src = mediaUrl;
  elements.audio.playbackRate = state.playbackSpeed;

  try {
    await elements.audio.play();
  } catch (e) {
    console.warn('Reproducción encolada:', e);
  }

  updateNowPlayingBasic(song);
  loadMetadataAsync(song);

  if (song.lrcContent) {
    loadSubtitleFromRawText(song.lrcContent, 'LRC');
  } else if (song.subtitleFile) {
    try {
      const text = await song.subtitleFile.text();
      loadSubtitleFromRawText(text, 'LRC');
    } catch (e) {
      showNoLyricsState();
    }
  } else if (song.subtitle && window.electronAPI) {
    await loadSubtitleFile(song.subtitle.path, song.subtitle.type);
  } else {
    showNoLyricsState();
    // Búsqueda automática en LRCLIB para la canción actual
    fetchAutoLrclib(song);
  }
}

function loadSubtitleFromRawText(rawContent, type = 'LRC') {
  try {
    const cues = parseSubtitles(rawContent, type);
    if (cues && cues.length > 0) {
      state.lyrics = cues;
      state.currentSubtitleType = type.toUpperCase();
      state.currentLyricIndex = -1;
      state.renderedBlocksKey = '';
      renderLyricsList(cues);

      if (window.preloadJapaneseBatch) {
        const allTexts = [];
        cues.forEach(c => {
          allTexts.push(c.text);
          if (c.words) c.words.forEach(w => allTexts.push(w.text));
        });
        window.preloadJapaneseBatch(allTexts);
      }
      elements.currentSubBadge.textContent = type;
      elements.currentSubBadge.classList.remove('hidden');
    } else {
      showNoLyricsState();
    }
  } catch (err) {
    console.error('Error al parsear letra:', err);
    showNoLyricsState();
  }
}

async function fetchAutoLrclib(song) {
  if (!window.AuraSpotube) return;
  const title = song.title || song.name;
  const artist = song.artist && song.artist !== 'Audio Local' ? song.artist : '';
  try {
    const lrc = await window.AuraSpotube.fetchLrclibLyrics(title, artist);
    if (lrc && state.currentSong === song) {
      song.lrcContent = lrc;
      loadSubtitleFromRawText(lrc, 'LRC');
    }
  } catch (e) {
    console.warn('Auto LRCLIB warning:', e);
  }
}

async function loadMetadataAsync(song) {
  if (song.cover) {
    elements.headerCover.innerHTML = `<img src="${song.cover}" alt="Cover">`;
    elements.currentCoverImg.src = song.cover;
    elements.currentCoverImg.classList.remove('hidden');
    elements.coverFallback.classList.add('hidden');
    elements.stageCoverImg.src = song.cover;
    elements.stageCoverImg.classList.remove('hidden');
    elements.stageCoverFallback.classList.add('hidden');
  }

  if (!window.electronAPI || !song.filePath) return;

  try {
    const meta = await window.electronAPI.getAudioMetadata(song.filePath);
    const title = meta.title || song.title || song.name;
    const artist = meta.artist || song.artist || 'Artista Desconocido';

    elements.headerTitle.textContent = title;
    elements.headerArtist.textContent = meta.album ? `${artist} • ${meta.album}` : artist;
    elements.stageTitle.textContent = title;
    elements.stageArtist.textContent = artist;
    elements.currentTitle.textContent = title;
    elements.currentArtist.textContent = artist;

    if (meta.cover) {
      elements.headerCover.innerHTML = `<img src="${meta.cover}" alt="Cover">`;
      elements.currentCoverImg.src = meta.cover;
      elements.currentCoverImg.classList.remove('hidden');
      elements.coverFallback.classList.add('hidden');

      elements.stageCoverImg.src = meta.cover;
      elements.stageCoverImg.classList.remove('hidden');
      elements.stageCoverFallback.classList.add('hidden');
    } else {
      elements.headerCover.innerHTML = getDefaultCoverIcon();
      elements.currentCoverImg.classList.add('hidden');
      elements.coverFallback.classList.remove('hidden');

      elements.stageCoverImg.classList.add('hidden');
      elements.stageCoverFallback.classList.remove('hidden');
    }
  } catch (err) {
    console.warn('Error al cargar metadatos:', err);
  }
}

function updateNowPlayingBasic(song) {
  elements.headerTitle.textContent = song.name;
  elements.headerArtist.textContent = song.extension;
  elements.stageTitle.textContent = song.name;
  elements.stageArtist.textContent = song.extension;
  elements.currentTitle.textContent = song.name;
  elements.currentArtist.textContent = song.extension;

  if (song.subtitle) {
    elements.currentSubBadge.textContent = song.subtitle.type;
    elements.currentSubBadge.className = `current-sub-badge badge-${song.subtitle.type.toLowerCase()}`;
    elements.currentSubBadge.classList.remove('hidden');
    elements.btnSubtitleText.textContent = `Letra (${song.subtitle.type})`;
  } else {
    elements.currentSubBadge.classList.add('hidden');
    elements.btnSubtitleText.textContent = 'Cargar Letra';
  }
}

function getDefaultCoverIcon() {
  return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>
  </svg>`;
}

function updateActiveSongInList() {
  const items = elements.songList.querySelectorAll('.song-item');
  items.forEach((item, idx) => {
    const isThisActive = state.currentSong && state.songs[idx] && state.songs[idx].id === state.currentSong.id;
    item.classList.toggle('active', isThisActive);
    const indexSpan = item.querySelector('.song-index');
    if (indexSpan) {
      indexSpan.innerHTML = isThisActive && state.isPlaying ? getSoundWaveHtml() : (idx + 1);
    }
  });
}

// ========================================================
// CARGA Y PARSEO DE SUBTÍTULOS
// ========================================================
async function loadSubtitleFile(filePath, type) {
  try {
    const rawContent = await window.electronAPI.readSubtitle(filePath);
    const cues = parseSubtitles(rawContent, type);

    if (cues && cues.length > 0) {
      state.lyrics = cues;
      state.currentSubtitleType = (type || (filePath ? filePath.split('.').pop() : '')).toUpperCase();
      state.currentLyricIndex = -1;
      state.renderedBlocksKey = '';
      renderLyricsList(cues);

      // Precargar conversiones japonesas (Kanji / Kana) en segundo plano
      if (window.preloadJapaneseBatch) {
        const allTexts = [];
        cues.forEach(c => {
          allTexts.push(c.text);
          if (c.words) c.words.forEach(w => allTexts.push(w.text));
        });
        window.preloadJapaneseBatch(allTexts);
      }
    } else {
      state.currentSubtitleType = null;
      showEmptyLyricsState('El archivo de letras no contiene marcas de tiempo válidas.');
    }
  } catch (err) {
    state.currentSubtitleType = null;
    console.error('Error al leer subtítulo:', err);
    showEmptyLyricsState('No se pudo leer el archivo de letra.');
  }
}

function renderLyricsList(cues) {
  elements.lyricsPlaceholder.classList.add('hidden');
  elements.lyricsContainer.innerHTML = '';
  const fragment = document.createDocumentFragment();

  cues.forEach((cue, index) => {
    const lineDiv = document.createElement('div');
    lineDiv.className = 'lyric-line';
    lineDiv.dataset.index = index;
    lineDiv.dataset.start = cue.start;
    lineDiv.dataset.end = cue.end;

    const displayText = state.isRomanizeEnabled && window.romanizeText
      ? window.romanizeText(cue.text)
      : cue.text;
    lineDiv.textContent = displayText;

    lineDiv.addEventListener('click', () => {
      seekToLyric(cue.start);
    });

    fragment.appendChild(lineDiv);
  });

  elements.lyricsContainer.appendChild(fragment);
}

function toggleRomanize() {
  state.isRomanizeEnabled = !state.isRomanizeEnabled;

  if (elements.btnRomanize) {
    elements.btnRomanize.classList.toggle('active', state.isRomanizeEnabled);
  }
  if (elements.btnRomanizeText) {
    elements.btnRomanizeText.textContent = state.isRomanizeEnabled ? 'Romanizado' : 'Romanizar';
  }

  // Si se activa la romanización, solicitar lote de frases en japonés si existen
  if (state.isRomanizeEnabled && state.lyrics && window.preloadJapaneseBatch) {
    const allTexts = [];
    state.lyrics.forEach(c => {
      allTexts.push(c.text);
      if (c.words) c.words.forEach(w => allTexts.push(w.text));
    });
    window.preloadJapaneseBatch(allTexts);
  }

  // Invalidar caché de bloques para redibujar inmediatamente
  state.renderedBlocksKey = '';

  if (state.lyrics && state.lyrics.length > 0) {
    renderLyricsList(state.lyrics);
    const effectiveTime = elements.audio.currentTime + state.syncOffset;
    updateYoutubeOverlappingCaptions(effectiveTime);
  }
}

// Callback invocado cuando Kuroshiro completa conversiones asíncronas de Kanji
window.onRomanizationUpdated = function() {
  if (state.isRomanizeEnabled && state.lyrics && state.lyrics.length > 0) {
    state.renderedBlocksKey = '';
    renderLyricsList(state.lyrics);
    const effectiveTime = elements.audio.currentTime + state.syncOffset;
    updateYoutubeOverlappingCaptions(effectiveTime);
  }
};

function seekToLyric(startTime) {
  const targetTime = Math.max(0, startTime - state.syncOffset);
  elements.audio.currentTime = targetTime;
  if (elements.audio.paused) {
    elements.audio.play();
  }
}

function showNoLyricsState() {
  state.lyrics = [];
  state.currentSubtitleType = null;
  state.renderedBlocksKey = '';
  elements.ytCaptionWindow.innerHTML = '<div class="yt-block yt-block-idle"><span class="yt-word pending">Sin archivo de letra asociado</span></div>';
  elements.lyricsContainer.innerHTML = '';
  elements.lyricsPlaceholder.classList.remove('hidden');
}

function showEmptyLyricsState(msg) {
  state.lyrics = [];
  state.currentSubtitleType = null;
  state.renderedBlocksKey = '';
  elements.ytCaptionWindow.innerHTML = `<div class="yt-block yt-block-idle"><span class="yt-word pending">${msg}</span></div>`;
}

async function handleLoadManualSubtitle() {
  if (!state.currentSong) {
    alert('Por favor selecciona primero una canción.');
    return;
  }

  try {
    const subFilePath = await window.electronAPI.selectSubtitleFile();
    if (subFilePath) {
      const ext = subFilePath.split('.').pop().toLowerCase();
      const fileName = subFilePath.replace(/\\/g, '/').split('/').pop();

      state.currentSong.subtitle = {
        path: subFilePath,
        name: fileName,
        type: ext.toUpperCase()
      };

      elements.currentSubBadge.textContent = ext.toUpperCase();
      elements.currentSubBadge.className = `current-sub-badge badge-${ext}`;
      elements.currentSubBadge.classList.remove('hidden');
      elements.btnSubtitleText.textContent = `Letra (${ext.toUpperCase()})`;

      await loadSubtitleFile(subFilePath, ext);
      updateActiveSongInList();
    }
  } catch (err) {
    console.error('Error al seleccionar subtítulo manual:', err);
  }
}

function changeOffset(delta) {
  state.syncOffset = Math.round((state.syncOffset + delta) * 10) / 10;
  updateOffsetUI();
}

function updateOffsetUI() {
  const sign = state.syncOffset > 0 ? '+' : '';
  elements.offsetValueText.textContent = `${sign}${state.syncOffset.toFixed(1)}s`;
}

function toggleViewMode() {
  if (state.viewMode === 'youtube') {
    state.viewMode = 'list';
    elements.youtubeStage.classList.add('hidden');
    elements.lyricsViewport.classList.remove('hidden');
    elements.btnViewModeText.textContent = 'Ver Bloques (YouTube)';

    // Centrar y resaltar de inmediato la línea activa en la lista completa
    if (state.lyrics && state.lyrics.length > 0) {
      const effectiveTime = elements.audio.currentTime + state.syncOffset;
      const activeIdx = state.lyrics.findIndex(c => effectiveTime >= c.start && effectiveTime <= c.end);
      if (activeIdx >= 0) {
        highlightActiveInList(activeIdx);
      }
    }
  } else {
    state.viewMode = 'youtube';
    elements.youtubeStage.classList.remove('hidden');
    elements.lyricsViewport.classList.add('hidden');
    elements.btnViewModeText.textContent = 'Ver Lista Completa';
    state.renderedBlocksKey = '';
    const current = elements.audio.currentTime + state.syncOffset;
    updateYoutubeOverlappingCaptions(current);
  }
}

// ========================================================
// TRANSPORTE Y CONTROLES
// ========================================================
function togglePlayPause() {
  if (!state.currentSong && state.songs.length > 0) {
    playSongAtIndex(0);
    return;
  }

  if (elements.audio.paused) {
    elements.audio.play();
  } else {
    elements.audio.pause();
  }
}

function updatePlayPauseUI(isPlaying) {
  state.isPlaying = isPlaying;
  if (isPlaying) {
    elements.iconPlay.classList.add('hidden');
    elements.iconPause.classList.remove('hidden');
  } else {
    elements.iconPlay.classList.remove('hidden');
    elements.iconPause.classList.add('hidden');
  }
  updateActiveSongInList();
}

function playNextSong() {
  if (state.songs.length === 0) return;

  if (state.repeatMode === 2) {
    elements.audio.currentTime = 0;
    elements.audio.play();
    return;
  }

  let nextIndex;
  if (state.isShuffle) {
    nextIndex = Math.floor(Math.random() * state.songs.length);
    if (state.songs.length > 1 && nextIndex === state.currentSongIndex) {
      nextIndex = (nextIndex + 1) % state.songs.length;
    }
  } else {
    nextIndex = state.currentSongIndex + 1;
    if (nextIndex >= state.songs.length) {
      if (state.repeatMode === 1) {
        nextIndex = 0;
      } else {
        return;
      }
    }
  }

  playSongAtIndex(nextIndex);
}

function playPrevSong() {
  if (state.songs.length === 0) return;

  if (elements.audio.currentTime > 3) {
    elements.audio.currentTime = 0;
    return;
  }

  let prevIndex = state.currentSongIndex - 1;
  if (prevIndex < 0) {
    prevIndex = state.songs.length - 1;
  }

  playSongAtIndex(prevIndex);
}

function toggleShuffle() {
  state.isShuffle = !state.isShuffle;
  elements.btnShuffle.classList.toggle('active', state.isShuffle);
}

function toggleRepeat() {
  state.repeatMode = (state.repeatMode + 1) % 3;
  if (state.repeatMode === 0) {
    elements.btnRepeat.classList.remove('active');
    elements.repeatOneIndicator.classList.add('hidden');
  } else if (state.repeatMode === 1) {
    elements.btnRepeat.classList.add('active');
    elements.repeatOneIndicator.classList.add('hidden');
  } else if (state.repeatMode === 2) {
    elements.btnRepeat.classList.add('active');
    elements.repeatOneIndicator.classList.remove('hidden');
  }
}

function onAudioLoadedMetadata() {
  elements.timeTotal.textContent = formatTime(elements.audio.duration || 0);
}

function onAudioEnded() {
  if (state.repeatMode === 2) {
    elements.audio.currentTime = 0;
    elements.audio.play();
  } else {
    playNextSong();
  }
}

// ========================================================
// BARRA DE PROGRESO INTERACTIVA (SEEKBAR)
// ========================================================
function setupProgressBar() {
  function seekToPosition(clientX) {
    if (!elements.audio.duration || isNaN(elements.audio.duration)) return 0;
    const rect = elements.progressBarWrapper.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = clickX / rect.width;
    elements.progressBarFill.style.width = `${percent * 100}%`;
    elements.progressBarThumb.style.left = `${percent * 100}%`;
    const targetTime = percent * elements.audio.duration;
    elements.timeCurrent.textContent = formatTime(targetTime);
    return targetTime;
  }

  // Clic directo o inicio de arrastre
  elements.progressBarWrapper.addEventListener('mousedown', (e) => {
    if (!elements.audio.duration) return;
    state.isDraggingProgress = true;
    elements.progressBarWrapper.classList.add('dragging');
    const targetTime = seekToPosition(e.clientX);
    elements.audio.currentTime = targetTime;
  });

  // Arrastre fluido a través de la ventana
  window.addEventListener('mousemove', (e) => {
    if (!state.isDraggingProgress) return;
    seekToPosition(e.clientX);
  });

  // Fin de arrastre
  window.addEventListener('mouseup', (e) => {
    if (state.isDraggingProgress) {
      const targetTime = seekToPosition(e.clientX);
      if (elements.audio.duration && !isNaN(targetTime)) {
        elements.audio.currentTime = targetTime;
      }
      setTimeout(() => {
        state.isDraggingProgress = false;
        elements.progressBarWrapper.classList.remove('dragging');
      }, 100);
    }
  });
}

// ========================================================
// SELECTOR DE VELOCIDAD DE REPRODUCCIÓN (PLAYBACK SPEED)
// ========================================================
function setupSpeedControl() {
  if (!elements.btnSpeed || !elements.speedSlider) return;

  // Clic en el botón: alternar visualización del slider
  elements.btnSpeed.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = elements.speedSliderWrapper.classList.toggle('hidden');
    elements.btnSpeed.classList.toggle('active', !isHidden);
  });

  // Evento input del slider de velocidad
  elements.speedSlider.addEventListener('input', (e) => {
    const speed = parseFloat(e.target.value);
    setPlaybackSpeed(speed);
  });

  // Botón reset para volver a 1.0x rápidamente
  if (elements.btnSpeedReset) {
    elements.btnSpeedReset.addEventListener('click', (e) => {
      e.stopPropagation();
      setPlaybackSpeed(1.0);
    });
  }

  // Doble clic en el botón speed también restablece a 1.0x
  elements.btnSpeed.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    setPlaybackSpeed(1.0);
  });

  // Cerrar el slider al hacer clic fuera del contenedor
  document.addEventListener('click', (e) => {
    if (elements.speedContainer && !elements.speedContainer.contains(e.target)) {
      elements.speedSliderWrapper.classList.add('hidden');
      elements.btnSpeed.classList.remove('active');
    }
  });
}

function setPlaybackSpeed(speed) {
  const rounded = Math.round(speed * 100) / 100;
  state.playbackSpeed = rounded;
  elements.audio.playbackRate = rounded;
  elements.btnSpeed.textContent = `${rounded % 1 === 0 ? rounded.toFixed(1) : rounded}x`;
  if (elements.speedSlider) {
    elements.speedSlider.value = rounded;
  }
}

function toggleMute() {
  if (elements.audio.volume > 0) {
    state.previousVolume = elements.audio.volume;
    elements.audio.volume = 0;
    elements.volumeRange.value = 0;
    updateVolumeUI(0);
  } else {
    const restore = state.previousVolume || 0.8;
    elements.audio.volume = restore;
    elements.volumeRange.value = restore;
    updateVolumeUI(restore);
  }
}

function updateVolumeUI(volume) {
  if (volume === 0) {
    elements.iconVolumeHigh.classList.add('hidden');
    elements.iconVolumeMute.classList.remove('hidden');
  } else {
    elements.iconVolumeHigh.classList.remove('hidden');
    elements.iconVolumeMute.classList.add('hidden');
  }
}

function handleSearchInput(e) {
  const query = e.target.value.toLowerCase().trim();
  elements.btnClearSearch.classList.toggle('hidden', query.length === 0);

  if (!query) {
    state.filteredSongs = state.songs;
    renderSongList(state.songs);
    return;
  }

  state.filteredSongs = state.songs.filter(song => {
    return song.name.toLowerCase().includes(query) ||
           song.fileName.toLowerCase().includes(query) ||
           (song.artist && song.artist.toLowerCase().includes(query)) ||
           (song.album && song.album.toLowerCase().includes(query)) ||
           (song.relativeFolder && song.relativeFolder.toLowerCase().includes(query));
  });

  renderSongList(state.filteredSongs);
}

function setupDragAndDrop() {
  window.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  window.addEventListener('drop', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const firstItem = e.dataTransfer.files[0];
      if (firstItem.path) {
        await loadDirectory(firstItem.path);
      }
    }
  });
}

function handleKeyShortcuts(e) {
  if (e.target.tagName === 'INPUT' && e.target.type === 'text') return;

  switch (e.code) {
    case 'Space':
      e.preventDefault();
      togglePlayPause();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      elements.audio.currentTime = Math.max(0, elements.audio.currentTime - 5);
      break;
    case 'ArrowRight':
      e.preventDefault();
      elements.audio.currentTime = Math.min(elements.audio.duration || 0, elements.audio.currentTime + 5);
      break;
    case 'ArrowUp':
      e.preventDefault();
      elements.audio.volume = Math.min(1, elements.audio.volume + 0.05);
      elements.volumeRange.value = elements.audio.volume;
      updateVolumeUI(elements.audio.volume);
      break;
    case 'ArrowDown':
      e.preventDefault();
      elements.audio.volume = Math.max(0, elements.audio.volume - 0.05);
      elements.volumeRange.value = elements.audio.volume;
      updateVolumeUI(elements.audio.volume);
      break;
    case 'KeyM':
      toggleMute();
      break;
    case 'KeyR':
      toggleRomanize();
      break;
    case 'Period':
      if (e.shiftKey) {
        // Shift + > : Aumentar velocidad
        e.preventDefault();
        const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
        const nextSpeed = speeds.find(s => s > state.playbackSpeed) || 2.0;
        setPlaybackSpeed(nextSpeed);
      }
      break;
    case 'Comma':
      if (e.shiftKey) {
        // Shift + < : Disminuir velocidad
        e.preventDefault();
        const speeds = [2.0, 1.75, 1.5, 1.25, 1.0, 0.75, 0.5];
        const prevSpeed = speeds.find(s => s < state.playbackSpeed) || 0.5;
        setPlaybackSpeed(prevSpeed);
      }
      break;
  }
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

// ========================================================
// DESCARGADOR DE YOUTUBE CON YT-DLP (AUDIO MP3 + SUBTÍTULOS LRC ES)
// ========================================================
let isDownloadingYouTube = false;
let downloadProgressCleanup = null;

function setupYouTubeDownloader() {
  if (!elements.btnOpenDownloadModal) return;

  // Abrir modal
  elements.btnOpenDownloadModal.addEventListener('click', openYouTubeModal);

  // Cerrar modal
  elements.btnCloseYtModal.addEventListener('click', closeYouTubeModal);
  elements.btnCancelYtDownload.addEventListener('click', handleCancelOrCloseYouTubeModal);

  // Cerrar al hacer clic en el fondo oscuro
  elements.ytDownloadModal.addEventListener('click', (e) => {
    if (e.target === elements.ytDownloadModal && !isDownloadingYouTube) {
      closeYouTubeModal();
    }
  });

  // Pegar enlace del portapapeles
  if (elements.btnPasteYtUrl) {
    elements.btnPasteYtUrl.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) elements.ytUrlInput.value = text.trim();
      } catch (e) {
        console.warn('No se pudo leer el portapapeles:', e);
      }
    });
  }

  // Cambiar carpeta de destino
  if (elements.btnChangeYtFolder) {
    elements.btnChangeYtFolder.addEventListener('click', async () => {
      try {
        const folder = await window.electronAPI.selectFolder();
        if (folder) {
          state.currentFolder = folder;
          updateYtModalFolder();
          elements.folderPathText.textContent = folder;
          elements.folderPathText.title = folder;
        }
      } catch (e) {
        console.error('Error al seleccionar carpeta:', e);
      }
    });
  }

  // Iniciar descarga
  if (elements.btnStartYtDownload) {
    elements.btnStartYtDownload.addEventListener('click', startYouTubeDownload);
  }

  // Atajo Enter en el campo de texto del enlace
  if (elements.ytUrlInput) {
    elements.ytUrlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !isDownloadingYouTube) {
        startYouTubeDownload();
      }
    });
  }
}

function updateYtModalFolder() {
  const folder = state.currentFolder || '';
  if (folder) {
    elements.ytTargetFolderText.textContent = folder;
    elements.ytTargetFolderText.title = folder;
    elements.ytTargetFolderText.style.color = 'var(--text-primary)';
  } else {
    elements.ytTargetFolderText.textContent = 'Ninguna carpeta seleccionada (clic en Cambiar)';
    elements.ytTargetFolderText.style.color = 'var(--text-muted)';
  }
}

function openYouTubeModal() {
  updateYtModalFolder();
  elements.ytDownloadError.classList.add('hidden');
  elements.ytDownloadError.textContent = '';

  if (!isDownloadingYouTube) {
    elements.ytProgressContainer.classList.add('hidden');
    elements.btnStartYtDownload.disabled = false;
    elements.btnStartYtDownloadText.textContent = 'Descargar';
    elements.btnCancelYtDownload.textContent = 'Cerrar';
  }

  elements.ytDownloadModal.classList.remove('hidden');
  setTimeout(() => elements.ytUrlInput.focus(), 50);
}

function closeYouTubeModal() {
  if (isDownloadingYouTube) return;
  elements.ytDownloadModal.classList.add('hidden');
}

async function handleCancelOrCloseYouTubeModal() {
  if (isDownloadingYouTube) {
    const confirmCancel = confirm('¿Deseas cancelar la descarga actual de YouTube?');
    if (confirmCancel && window.electronAPI.cancelYouTubeDownload) {
      await window.electronAPI.cancelYouTubeDownload();
      isDownloadingYouTube = false;
      elements.ytProgressStatus.textContent = 'Descarga cancelada por el usuario';
      elements.btnStartYtDownload.disabled = false;
      elements.btnStartYtDownloadText.textContent = 'Descargar';
      elements.btnCancelYtDownload.textContent = 'Cerrar';
    }
  } else {
    closeYouTubeModal();
  }
}

async function startYouTubeDownload() {
  const url = (elements.ytUrlInput.value || '').trim();
  if (!url) {
    showYtError('Por favor ingresa un enlace válido de YouTube.');
    elements.ytUrlInput.focus();
    return;
  }

  const audioFormat = elements.selectYtFormat ? elements.selectYtFormat.value : 'm4a';

  if (!window.electronAPI) {
    isDownloadingYouTube = true;
    elements.ytDownloadError.classList.add('hidden');
    elements.ytProgressContainer.classList.remove('hidden');
    elements.ytProgressBarFill.style.width = '30%';
    elements.ytProgressPercent.textContent = '30%';
    elements.ytProgressStatus.textContent = 'Resolviendo stream con motor Spotube...';
    elements.btnStartYtDownload.disabled = true;

    try {
      const streamInfo = await window.AuraSpotube.resolveAudioStream(url, audioFormat);
      elements.ytProgressBarFill.style.width = '75%';
      elements.ytProgressPercent.textContent = '75%';
      elements.ytProgressStatus.textContent = 'Añadiendo pista al reproductor...';

      const newSong = {
        id: 'yt_' + Date.now(),
        name: streamInfo.title || 'YouTube Audio',
        title: streamInfo.title || 'YouTube Audio',
        artist: streamInfo.artist || 'YouTube',
        extension: audioFormat.toUpperCase(),
        url: streamInfo.url
      };

      state.songs.push(newSong);
      renderSongList(state.songs);
      elements.folderStatsText.textContent = `${state.songs.length} canciones`;
      elements.emptyListState.classList.add('hidden');

      elements.ytProgressBarFill.style.width = '100%';
      elements.ytProgressPercent.textContent = '100%';
      elements.ytProgressStatus.textContent = '¡Completado! Reproduciendo...';

      playSongAtIndex(state.songs.length - 1);

      setTimeout(() => {
        closeYouTubeModal();
      }, 1000);
    } catch (err) {
      showYtError(err.message || 'Error al obtener stream de YouTube');
    } finally {
      isDownloadingYouTube = false;
      elements.btnStartYtDownload.disabled = false;
    }
    return;
  }

  // Si no hay carpeta seleccionada, pedirle una al usuario (Modo Desktop)
  if (!state.currentFolder) {
    const folder = await window.electronAPI.selectFolder();
    if (!folder) {
      showYtError('Debes seleccionar una carpeta de destino para guardar la descarga.');
      return;
    }
    state.currentFolder = folder;
    updateYtModalFolder();
    elements.folderPathText.textContent = folder;
    elements.folderPathText.title = folder;
  }

  const outputDir = state.currentFolder;
  const isPlaylist = elements.chkYtPlaylist ? elements.chkYtPlaylist.checked : false;

  // Iniciar estado de descarga
  isDownloadingYouTube = true;
  elements.ytDownloadError.classList.add('hidden');
  elements.ytDownloadError.textContent = '';
  elements.ytProgressContainer.classList.remove('hidden');
  elements.ytProgressBarFill.style.width = '0%';
  elements.ytProgressPercent.textContent = '0%';
  elements.ytProgressStatus.textContent = 'Iniciando conexión con YouTube...';
  elements.ytProgressSpeed.textContent = '-- MiB/s';
  elements.ytProgressEta.textContent = 'ETA: --:--';

  elements.btnStartYtDownload.disabled = true;
  elements.btnStartYtDownloadText.textContent = 'Descargando...';
  elements.btnCancelYtDownload.textContent = 'Cancelar';

  // Registrar callback de progreso en tiempo real
  if (downloadProgressCleanup) {
    downloadProgressCleanup();
    downloadProgressCleanup = null;
  }

  downloadProgressCleanup = window.electronAPI.onYouTubeDownloadProgress((data) => {
    if (data.percent !== undefined) {
      const pct = Math.min(100, Math.max(0, data.percent));
      elements.ytProgressBarFill.style.width = `${pct}%`;
      elements.ytProgressPercent.textContent = `${Math.round(pct)}%`;
    }
    if (data.status) {
      elements.ytProgressStatus.textContent = data.status;
    }
    if (data.speed) {
      elements.ytProgressSpeed.textContent = data.speed;
    }
    if (data.eta) {
      elements.ytProgressEta.textContent = `ETA: ${data.eta}`;
    }
  });

  try {
    const result = await window.electronAPI.downloadYouTube({
      url,
      outputDir,
      isPlaylist,
      audioFormat
    });

    if (downloadProgressCleanup) {
      downloadProgressCleanup();
      downloadProgressCleanup = null;
    }

    isDownloadingYouTube = false;
    elements.btnStartYtDownload.disabled = false;
    elements.btnStartYtDownloadText.textContent = 'Descargar';
    elements.btnCancelYtDownload.textContent = 'Cerrar';

    if (result && result.success) {
      elements.ytProgressStatus.textContent = '¡Completado! Actualizando canciones...';
      elements.ytProgressBarFill.style.width = '100%';
      elements.ytProgressPercent.textContent = '100%';
      elements.ytUrlInput.value = '';

      // Re-escanear la carpeta para que el archivo aparezca de inmediato
      await loadDirectory(outputDir);

      setTimeout(() => {
        closeYouTubeModal();
      }, 1400);
    } else {
      showYtError(result.error || 'Ocurrió un error al descargar con yt-dlp.');
    }
  } catch (err) {
    if (downloadProgressCleanup) {
      downloadProgressCleanup();
      downloadProgressCleanup = null;
    }
    isDownloadingYouTube = false;
    elements.btnStartYtDownload.disabled = false;
    elements.btnStartYtDownloadText.textContent = 'Descargar';
    elements.btnCancelYtDownload.textContent = 'Cerrar';
    showYtError(err.message || 'Error de comunicación al ejecutar la descarga.');
  }
}

function showYtError(msg) {
  elements.ytDownloadError.textContent = msg;
  elements.ytDownloadError.classList.remove('hidden');
}

// ========================================================
// DESCARGADOR DE SPOTIFY (METADATOS + YT-DLP + LRCLIB)
// ========================================================
let isDownloadingSpotify = false;
let isAnalyzingSpotify = false;
let currentSpotifyMetadata = null;
let spotifyProgressCleanup = null;

function setupSpotifyDownloader() {
  if (!elements.btnOpenSpotifyModal) return;

  elements.btnOpenSpotifyModal.addEventListener('click', openSpotifyModal);
  elements.btnCloseSpotifyModal.addEventListener('click', closeSpotifyModal);
  elements.btnCancelSpotifyDownload.addEventListener('click', handleCancelOrCloseSpotifyModal);

  elements.spotifyDownloadModal.addEventListener('click', (e) => {
    if (e.target === elements.spotifyDownloadModal && !isDownloadingSpotify) {
      closeSpotifyModal();
    }
  });

  if (elements.btnPasteSpotifyUrl) {
    elements.btnPasteSpotifyUrl.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          elements.spotifyUrlInput.value = text.trim();
          handleAnalyzeSpotify();
        }
      } catch (e) {
        console.warn('No se pudo leer el portapapeles:', e);
      }
    });
  }

  if (elements.btnAnalyzeSpotify) {
    elements.btnAnalyzeSpotify.addEventListener('click', handleAnalyzeSpotify);
  }

  if (elements.spotifyUrlInput) {
    elements.spotifyUrlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (!currentSpotifyMetadata) {
          handleAnalyzeSpotify();
        } else if (!isDownloadingSpotify) {
          startSpotifyDownload();
        }
      }
    });
  }

  if (elements.btnChangeSpotifyFolder) {
    elements.btnChangeSpotifyFolder.addEventListener('click', async () => {
      try {
        const folder = await window.electronAPI.selectFolder();
        if (folder) {
          state.currentFolder = folder;
          updateSpotifyModalFolder();
          elements.folderPathText.textContent = folder;
          elements.folderPathText.title = folder;
        }
      } catch (e) {
        console.error('Error al seleccionar carpeta:', e);
      }
    });
  }

  if (elements.btnStartSpotifyDownload) {
    elements.btnStartSpotifyDownload.addEventListener('click', startSpotifyDownload);
  }
}

function updateSpotifyModalFolder() {
  const folder = state.currentFolder || '';
  if (folder) {
    elements.spotifyTargetFolderText.textContent = folder;
    elements.spotifyTargetFolderText.title = folder;
    elements.spotifyTargetFolderText.style.color = 'var(--text-primary)';
  } else {
    elements.spotifyTargetFolderText.textContent = 'Ninguna carpeta seleccionada (clic en Cambiar)';
    elements.spotifyTargetFolderText.style.color = 'var(--text-muted)';
  }
}

function openSpotifyModal() {
  updateSpotifyModalFolder();
  elements.spotifyDownloadError.classList.add('hidden');
  elements.spotifyDownloadError.textContent = '';

  if (!isDownloadingSpotify) {
    elements.spotifyProgressContainer.classList.add('hidden');
    elements.btnCancelSpotifyDownload.textContent = 'Cerrar';
  }

  elements.spotifyDownloadModal.classList.remove('hidden');
  setTimeout(() => elements.spotifyUrlInput.focus(), 50);
}

function closeSpotifyModal() {
  if (isDownloadingSpotify) return;
  elements.spotifyDownloadModal.classList.add('hidden');
}

async function handleCancelOrCloseSpotifyModal() {
  if (isDownloadingSpotify) {
    const confirmCancel = confirm('¿Deseas cancelar la descarga actual de Spotify?');
    if (confirmCancel && window.electronAPI.cancelSpotifyDownload) {
      await window.electronAPI.cancelSpotifyDownload();
      isDownloadingSpotify = false;
      elements.spotifyProgressStatus.textContent = 'Descarga cancelada por el usuario';
      elements.btnStartSpotifyDownload.disabled = false;
      elements.btnStartSpotifyDownloadText.textContent = 'Descargar Canciones';
      elements.btnCancelSpotifyDownload.textContent = 'Cerrar';
    }
  } else {
    closeSpotifyModal();
  }
}

async function handleAnalyzeSpotify() {
  const url = (elements.spotifyUrlInput.value || '').trim();
  if (!url) {
    showSpotifyError('Por favor ingresa un enlace de Spotify (canción, álbum, playlist o artista).');
    elements.spotifyUrlInput.focus();
    return;
  }

  isAnalyzingSpotify = true;
  elements.spotifyDownloadError.classList.add('hidden');
  elements.spotifyDownloadError.textContent = '';
  elements.btnAnalyzeSpotify.disabled = true;
  elements.btnAnalyzeSpotify.textContent = 'Buscando...';
  elements.btnStartSpotifyDownload.disabled = true;
  elements.spotifyPreviewCard.classList.add('hidden');

  if (!window.electronAPI) {
    // Móvil / Capacitor: Extracción Spotube
    try {
      const meta = await window.AuraSpotube.parseSpotifyUrl(url);
      currentSpotifyMetadata = {
        type: meta.type,
        typeLabel: meta.type.toUpperCase(),
        title: meta.title,
        subtitle: meta.subtitle,
        cover: meta.coverUrl,
        tracksCount: meta.tracksCount,
        tracks: meta.tracks.map(t => ({
          title: t.name,
          artist: t.artist,
          durationStr: t.durationMs ? `${Math.floor(t.durationMs / 60000)}:${Math.floor((t.durationMs % 60000) / 1000).toString().padStart(2, '0')}` : '--:--',
          durationSeconds: t.durationMs ? Math.round(t.durationMs / 1000) : 0,
          coverUrl: t.coverUrl
        }))
      };

      elements.spotifyPreviewType.textContent = currentSpotifyMetadata.typeLabel;
      elements.spotifyPreviewTitle.textContent = currentSpotifyMetadata.title;
      elements.spotifyPreviewSubtitle.textContent = currentSpotifyMetadata.subtitle;
      elements.spotifyPreviewCount.textContent = `${currentSpotifyMetadata.tracksCount} ${currentSpotifyMetadata.tracksCount === 1 ? 'canción lista' : 'canciones listas'} para descargar`;

      if (currentSpotifyMetadata.cover) {
        elements.spotifyPreviewCover.src = currentSpotifyMetadata.cover;
        elements.spotifyPreviewCover.classList.remove('hidden');
      }

      elements.spotifyTrackList.innerHTML = '';
      const fragment = document.createDocumentFragment();
      currentSpotifyMetadata.tracks.forEach((t, idx) => {
        const li = document.createElement('li');
        li.className = 'spotify-track-item';
        li.innerHTML = `
          <span class="spotify-track-item-title">${idx + 1}. ${t.artist} - ${t.title}</span>
          <span class="spotify-track-item-dur">${t.durationStr}</span>
        `;
        fragment.appendChild(li);
      });
      elements.spotifyTrackList.appendChild(fragment);

      elements.spotifyPreviewCard.classList.remove('hidden');
      elements.btnStartSpotifyDownload.disabled = false;
      elements.btnStartSpotifyDownloadText.textContent = `Descargar ${currentSpotifyMetadata.tracksCount > 1 ? currentSpotifyMetadata.tracksCount + ' Canciones' : 'Canción'}`;
    } catch (err) {
      currentSpotifyMetadata = null;
      showSpotifyError(err.message || 'Error al conectar con Spotify.');
    } finally {
      isAnalyzingSpotify = false;
      elements.btnAnalyzeSpotify.disabled = false;
      elements.btnAnalyzeSpotify.textContent = 'Buscar';
    }
    return;
  }

  try {
    const res = await window.electronAPI.analyzeSpotify(url);
    isAnalyzingSpotify = false;
    elements.btnAnalyzeSpotify.disabled = false;
    elements.btnAnalyzeSpotify.textContent = 'Buscar';

    if (res && res.success && res.metadata) {
      currentSpotifyMetadata = res.metadata;

      // Renderizar vista previa
      elements.spotifyPreviewType.textContent = res.metadata.typeLabel;
      elements.spotifyPreviewTitle.textContent = res.metadata.title;
      elements.spotifyPreviewSubtitle.textContent = res.metadata.subtitle;
      elements.spotifyPreviewCount.textContent = `${res.metadata.tracksCount} ${res.metadata.tracksCount === 1 ? 'canción lista' : 'canciones listas'} para descargar`;

      if (res.metadata.cover) {
        elements.spotifyPreviewCover.src = res.metadata.cover;
        elements.spotifyPreviewCover.classList.remove('hidden');
      } else {
        elements.spotifyPreviewCover.classList.add('hidden');
      }

      // Renderizar lista de pistas
      elements.spotifyTrackList.innerHTML = '';
      const fragment = document.createDocumentFragment();
      res.metadata.tracks.forEach((t, idx) => {
        const li = document.createElement('li');
        li.className = 'spotify-track-item';
        li.innerHTML = `
          <span class="spotify-track-item-title">${idx + 1}. ${t.artist} - ${t.title}</span>
          <span class="spotify-track-item-dur">${t.durationStr}</span>
        `;
        fragment.appendChild(li);
      });
      elements.spotifyTrackList.appendChild(fragment);

      elements.spotifyPreviewCard.classList.remove('hidden');
      elements.btnStartSpotifyDownload.disabled = false;
      elements.btnStartSpotifyDownloadText.textContent = `Descargar ${res.metadata.tracksCount > 1 ? res.metadata.tracksCount + ' Canciones' : 'Canción'}`;
    } else {
      currentSpotifyMetadata = null;
      showSpotifyError(res.error || 'No se pudo obtener información del enlace de Spotify.');
    }
  } catch (err) {
    isAnalyzingSpotify = false;
    elements.btnAnalyzeSpotify.disabled = false;
    elements.btnAnalyzeSpotify.textContent = 'Buscar';
    currentSpotifyMetadata = null;
    showSpotifyError(err.message || 'Error al conectar con Spotify.');
  }
}

async function startSpotifyDownload() {
  if (!currentSpotifyMetadata || !currentSpotifyMetadata.tracks || currentSpotifyMetadata.tracks.length === 0) {
    showSpotifyError('Primero ingresa un enlace y presiona Buscar para cargar las canciones.');
    return;
  }

  const audioFormat = elements.selectSpotifyFormat ? elements.selectSpotifyFormat.value : 'm4a';
  const tracks = currentSpotifyMetadata.tracks;

  if (!window.electronAPI) {
    // Modo Móvil / Capacitor: Extracción y streaming Spotube
    isDownloadingSpotify = true;
    elements.spotifyDownloadError.classList.add('hidden');
    elements.spotifyDownloadError.textContent = '';
    elements.spotifyProgressContainer.classList.remove('hidden');
    elements.spotifyProgressBarFill.style.width = '0%';
    elements.btnStartSpotifyDownload.disabled = true;
    elements.btnStartSpotifyDownloadText.textContent = 'Procesando...';
    elements.btnAnalyzeSpotify.disabled = true;
    elements.btnCancelSpotifyDownload.textContent = 'Cerrar';

    let successCount = 0;

    for (let i = 0; i < tracks.length; i++) {
      const t = tracks[i];
      elements.spotifyCurrentTrackName.textContent = `${t.artist} - ${t.title}`;
      elements.spotifyBatchCount.textContent = `${i + 1} / ${tracks.length}`;
      const pct = Math.round(((i + 1) / tracks.length) * 100);
      elements.spotifyProgressBarFill.style.width = `${pct}%`;
      elements.spotifyProgressStatus.textContent = 'Buscando en YouTube y LRCLIB...';
      elements.spotifyLrcStatus.textContent = 'Buscando .lrc...';

      try {
        const query = `${t.title} ${t.artist} official audio`;
        const videoId = await window.AuraSpotube.searchYouTubeVideo(query);
        const lrc = await window.AuraSpotube.fetchLrclibLyrics(t.title, t.artist, t.durationSeconds || 0);

        if (lrc) {
          elements.spotifyLrcStatus.textContent = '✓ .lrc sincronizado';
          elements.spotifyLrcStatus.className = 'progress-detail spotify-lrc-pill ok';
        } else {
          elements.spotifyLrcStatus.textContent = 'Sin .lrc';
          elements.spotifyLrcStatus.className = 'progress-detail spotify-lrc-pill';
        }

        const newTrack = {
          id: 'sp_' + Date.now() + '_' + i,
          title: t.title,
          artist: t.artist,
          name: `${t.artist} - ${t.title}`,
          extension: audioFormat.toUpperCase(),
          cover: t.coverUrl || currentSpotifyMetadata.cover,
          lrcContent: lrc || null,
          videoId: videoId
        };

        if (videoId) {
          try {
            const streamInfo = await window.AuraSpotube.resolveAudioStream(videoId, audioFormat);
            newTrack.url = streamInfo.url;
          } catch (stErr) {
            console.warn('Fallback stream error:', stErr);
          }
        }

        state.songs.push(newTrack);
        successCount++;
      } catch (err) {
        console.warn('Error procesando pista:', t.title, err);
      }
    }

    renderSongList(state.songs);
    elements.folderStatsText.textContent = `${state.songs.length} canciones cargadas`;
    elements.emptyListState.classList.add('hidden');

    isDownloadingSpotify = false;
    elements.btnStartSpotifyDownload.disabled = false;
    elements.btnStartSpotifyDownloadText.textContent = 'Descargar Canciones';
    elements.btnAnalyzeSpotify.disabled = false;
    elements.spotifyProgressStatus.textContent = `¡Listo! ${successCount} de ${tracks.length} canciones añadidas al reproductor.`;
    elements.spotifyProgressBarFill.style.width = '100%';

    setTimeout(() => {
      closeSpotifyModal();
    }, 1500);
    return;
  }

  // Verificar o solicitar carpeta de destino (Modo Desktop)
  if (!state.currentFolder) {
    const folder = await window.electronAPI.selectFolder();
    if (!folder) {
      showSpotifyError('Debes seleccionar una carpeta de destino para guardar la música.');
      return;
    }
    state.currentFolder = folder;
    updateSpotifyModalFolder();
    elements.folderPathText.textContent = folder;
    elements.folderPathText.title = folder;
  }

  const outputDir = state.currentFolder;

  isDownloadingSpotify = true;
  elements.spotifyDownloadError.classList.add('hidden');
  elements.spotifyDownloadError.textContent = '';
  elements.spotifyProgressContainer.classList.remove('hidden');
  elements.spotifyProgressBarFill.style.width = '0%';
  elements.spotifyCurrentTrackName.textContent = `Preparando ${tracks.length} canciones...`;
  elements.spotifyBatchCount.textContent = `1 / ${tracks.length}`;
  elements.spotifyProgressStatus.textContent = 'Buscando en YouTube y LRCLIB...';
  elements.spotifyLrcStatus.textContent = 'LRC';
  elements.spotifyLrcStatus.className = 'progress-detail spotify-lrc-pill';

  elements.btnStartSpotifyDownload.disabled = true;
  elements.btnStartSpotifyDownloadText.textContent = 'Descargando...';
  elements.btnAnalyzeSpotify.disabled = true;
  elements.btnCancelSpotifyDownload.textContent = 'Cancelar';

  if (spotifyProgressCleanup) {
    spotifyProgressCleanup();
    spotifyProgressCleanup = null;
  }

  spotifyProgressCleanup = window.electronAPI.onSpotifyDownloadProgress((data) => {
    if (data.trackName) {
      elements.spotifyCurrentTrackName.textContent = data.trackName;
    }
    if (data.trackIndex && data.totalTracks) {
      elements.spotifyBatchCount.textContent = `${data.trackIndex} / ${data.totalTracks}`;
      const totalPct = ((data.trackIndex - 1 + ((data.percent || 0) / 100)) / data.totalTracks) * 100;
      elements.spotifyProgressBarFill.style.width = `${Math.min(100, Math.max(0, totalPct))}%`;
    }
    if (data.status) {
      elements.spotifyProgressStatus.textContent = data.status;
    }
    if (data.lrcStatus) {
      if (data.lrcStatus === 'encontrada') {
        elements.spotifyLrcStatus.textContent = '✓ Letra .lrc sincronizada';
        elements.spotifyLrcStatus.className = 'progress-detail spotify-lrc-pill ok';
      } else if (data.lrcStatus === 'buscando') {
        elements.spotifyLrcStatus.textContent = 'Buscando .lrc...';
        elements.spotifyLrcStatus.className = 'progress-detail spotify-lrc-pill';
      } else {
        elements.spotifyLrcStatus.textContent = 'Sin .lrc';
        elements.spotifyLrcStatus.className = 'progress-detail spotify-lrc-pill';
      }
    }
  });

  try {
    const result = await window.electronAPI.downloadSpotify({
      tracks,
      outputDir,
      audioFormat
    });

    if (spotifyProgressCleanup) {
      spotifyProgressCleanup();
      spotifyProgressCleanup = null;
    }

    isDownloadingSpotify = false;
    elements.btnStartSpotifyDownload.disabled = false;
    elements.btnStartSpotifyDownloadText.textContent = 'Descargar Canciones';
    elements.btnAnalyzeSpotify.disabled = false;
    elements.btnCancelSpotifyDownload.textContent = 'Cerrar';

    if (result && result.success) {
      elements.spotifyProgressStatus.textContent = `¡Completado! (${result.downloadedCount} de ${tracks.length} descargadas)`;
      elements.spotifyProgressBarFill.style.width = '100%';

      // Re-escanear carpeta activa para que aparezcan todas las canciones descargadas con sus .lrc
      await loadDirectory(outputDir);

      setTimeout(() => {
        closeSpotifyModal();
      }, 1500);
    } else {
      const errText = result.errors && result.errors.length > 0
        ? result.errors.join('\n')
        : (result.error || 'Ocurrió un error al descargar canciones de Spotify.');
      showSpotifyError(errText);
    }
  } catch (err) {
    if (spotifyProgressCleanup) {
      spotifyProgressCleanup();
      spotifyProgressCleanup = null;
    }
    isDownloadingSpotify = false;
    elements.btnStartSpotifyDownload.disabled = false;
    elements.btnStartSpotifyDownloadText.textContent = 'Descargar Canciones';
    elements.btnAnalyzeSpotify.disabled = false;
    elements.btnCancelSpotifyDownload.textContent = 'Cerrar';
    showSpotifyError(err.message || 'Error de comunicación al ejecutar la descarga de Spotify.');
  }
}

function showSpotifyError(msg) {
  elements.spotifyDownloadError.textContent = msg;
  elements.spotifyDownloadError.classList.remove('hidden');
}
