/**
 * Módulo de Parsers de Subtítulos con Soporte de Superposición por Bloques (YouTube Style)
 * Formatos soportados: LRC, SRT, WebVTT.
 */

function parseTimeString(timeStr) {
  if (!timeStr) return 0;
  const normalized = timeStr.trim().replace(',', '.');
  const parts = normalized.split(':');

  if (parts.length === 3) {
    const hours = parseFloat(parts[0]) || 0;
    const minutes = parseFloat(parts[1]) || 0;
    const seconds = parseFloat(parts[2]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    const minutes = parseFloat(parts[0]) || 0;
    const seconds = parseFloat(parts[1]) || 0;
    return minutes * 60 + seconds;
  } else if (parts.length === 1) {
    return parseFloat(parts[0]) || 0;
  }
  return 0;
}

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Detecta si el contenido LRC corresponde a subtítulos exportados de YouTube
 * (roll-up / Lavf / yt-dlp) caracterizados por repeticiones consecutivas de texto en ventanas cortas
 * y líneas vacías de espaciado.
 */
function isYouTubeRollupContent(lines) {
  const timeTagRegex = /\[(\d{1,2}:\d{2}(?:\.\d{1,3})?)\](.*)/;
  let textEntries = 0;
  let duplicateCount = 0;
  let blankCount = 0;
  const recentTexts = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const match = line.match(timeTagRegex);
    if (!match) continue;

    const text = match[2].trim();
    if (!text) {
      blankCount++;
    } else {
      textEntries++;
      if (recentTexts.includes(text)) {
        duplicateCount++;
      }
      recentTexts.push(text);
      if (recentTexts.length > 6) recentTexts.shift();
    }
  }

  return textEntries >= 8 && ((duplicateCount / textEntries) > 0.20 || (duplicateCount >= 4 && blankCount >= 4));
}

/**
 * Parser especializado para subtítulos Roll-Up de YouTube (Lavf / yt-dlp):
 * Reconstruye el flujo natural de diálogos sin duplicaciones, triplicaciones ni notas vacías '♪',
 * calculando los tiempos exactos de inicio (cuando la frase entra) y fin (cuando desaparece de pantalla).
 */
function parseYouTubeLRC(lines, offset = 0) {
  const timeTagRegex = /\[(\d{1,2}:\d{2}(?:\.\d{1,3})?)\](.*)/;
  const timeGroups = [];
  let currentGroup = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const match = line.match(timeTagRegex);
    if (!match) continue;

    const time = Math.max(0, parseTimeString(match[1]) + offset);
    const text = match[2].trim();

    if (!currentGroup || Math.abs(currentGroup.time - time) > 0.03) {
      currentGroup = { time, texts: [] };
      timeGroups.push(currentGroup);
    }
    if (text) {
      currentGroup.texts.push(text);
    }
  }

  const rawCues = [];
  let prevTexts = [];

  for (let g = 0; g < timeGroups.length; g++) {
    const group = timeGroups[g];
    const currTexts = group.texts;

    // Detectar frases nuevas que entran a pantalla
    for (const t of currTexts) {
      if (!prevTexts.includes(t)) {
        rawCues.push({
          text: t,
          start: group.time,
          end: null
        });
      }
    }

    // Detectar frases que salen de pantalla para cerrar su timestamp 'end'
    for (const t of prevTexts) {
      if (!currTexts.includes(t)) {
        for (let c = rawCues.length - 1; c >= 0; c--) {
          if (rawCues[c].text === t && rawCues[c].end === null) {
            rawCues[c].end = group.time;
            break;
          }
        }
      }
    }

    prevTexts = currTexts;
  }

  const lastTime = timeGroups.length > 0 ? timeGroups[timeGroups.length - 1].time : 0;
  for (let i = 0; i < rawCues.length; i++) {
    const c = rawCues[i];
    if (c.end === null) {
      c.end = i < rawCues.length - 1 ? rawCues[i + 1].start + 3.0 : lastTime + 4.0;
    }
    if (c.end <= c.start) {
      c.end = i < rawCues.length - 1 ? Math.max(c.start + 1.0, rawCues[i + 1].start) : c.start + 3.0;
    }
  }

  // Formatear y construir palabras
  const finalCues = rawCues.map((c, idx) => {
    const cleanText = capitalizeFirst(c.text);
    const subWords = cleanText.split(/\s+/).filter(Boolean);
    const totalDur = Math.max(0.1, c.end - c.start);
    const wDur = totalDur / Math.max(1, subWords.length);
    const words = subWords.map((w, wIdx) => ({
      text: w,
      start: c.start + (wIdx * wDur),
      end: c.start + ((wIdx + 1) * wDur)
    }));

    return {
      id: idx + 1,
      start: c.start,
      end: c.end,
      text: cleanText,
      words: words,
      isYouTubeRollup: true
    };
  });

  finalCues.isYouTubeRollup = true;
  return finalCues;
}

/**
 * Parser LRC con soporte de marcas por palabra y metadatos
 */
function parseLRC(content) {
  const lines = content.split(/\r?\n/);
  const rawCues = [];
  let offset = 0;

  const timeTagRegex = /\[(\d{1,2}:\d{2}(?:\.\d{1,3})?)\]/g;
  const metaRegex = /^\[([a-zA-Z]+):(.*)\]$/;
  const wordTagRegex = /<(\d{1,2}:\d{2}(?:\.\d{1,3})?)>([^<]*)/g;

  // Extraer metadata previa (offset)
  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const metaMatch = line.match(metaRegex);
    if (metaMatch && !line.match(timeTagRegex)) {
      const tag = metaMatch[1].toLowerCase();
      const val = metaMatch[2].trim();
      if (tag === 'offset') {
        const ms = parseInt(val, 10);
        if (!isNaN(ms)) offset = ms / 1000;
      }
    }
  }

  // Si detectamos formato Roll-Up de YouTube (Lavf / yt-dlp), usar el parser de roll-up
  if (isYouTubeRollupContent(lines)) {
    return parseYouTubeLRC(lines, offset);
  }

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const metaMatch = line.match(metaRegex);
    if (metaMatch && !line.match(timeTagRegex)) continue;

    const matches = [...line.matchAll(timeTagRegex)];
    if (matches.length > 0) {
      const rawText = line.replace(timeTagRegex, '').trim();
      if (!rawText) continue; // Ignorar líneas vacías sin texto para evitar cues espurias

      const wordMatches = [...rawText.matchAll(wordTagRegex)];
      let words = null;
      let cleanText = '';

      if (wordMatches.length > 0) {
        words = [];
        for (let w = 0; w < wordMatches.length; w++) {
          const wStart = Math.max(0, parseTimeString(wordMatches[w][1]) + offset);
          const wText = wordMatches[w][2];
          cleanText += wText;
          const nextW = wordMatches[w + 1];
          const wEnd = nextW ? Math.max(0, parseTimeString(nextW[1]) + offset) : wStart + 1.2;
          words.push({ text: wText, start: wStart, end: wEnd });
        }
        cleanText = cleanText.trim();
      } else {
        cleanText = rawText.replace(/<[^>]+>/g, '').trim();
      }

      if (!cleanText) continue;

      for (const m of matches) {
        const start = Math.max(0, parseTimeString(m[1]) + offset);
        rawCues.push({
          start,
          end: null,
          text: cleanText,
          words: words || null
        });
      }
    }
  }

  rawCues.sort((a, b) => a.start - b.start);

  // Filtrar duplicados exactos en el mismo timestamp
  const filtered = [];
  for (let i = 0; i < rawCues.length; i++) {
    const curr = rawCues[i];
    if (filtered.length > 0) {
      const prev = filtered[filtered.length - 1];
      if (Math.abs(curr.start - prev.start) < 0.05 && curr.text === prev.text) {
        continue;
      }
    }
    filtered.push(curr);
  }

  for (let i = 0; i < filtered.length; i++) {
    filtered[i].id = i + 1;
    if (i < filtered.length - 1) {
      const nextStart = filtered[i + 1].start;
      const gap = nextStart - filtered[i].start;
      filtered[i].end = gap > 7 ? filtered[i].start + 5.5 : nextStart;
    } else {
      filtered[i].end = filtered[i].start + 5.0;
    }
  }

  return filtered;
}

/**
 * Parser SRT nativo (soporta cues solapadas en tiempo)
 */
function parseSRT(content) {
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split(/\n\s*\n/);
  const cues = [];
  let idCounter = 1;

  const timePattern = /(\d{1,2}:\d{2}:\d{2}[,\.]\d{1,3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,\.]\d{1,3})/;

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;

    let timeLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (timePattern.test(lines[i])) {
        timeLineIndex = i;
        break;
      }
    }

    if (timeLineIndex === -1) continue;

    const timeMatch = lines[timeLineIndex].match(timePattern);
    const start = parseTimeString(timeMatch[1]);
    const end = parseTimeString(timeMatch[2]);

    const textLines = lines.slice(timeLineIndex + 1);
    const cleanText = textLines
      .join(' ')
      .replace(/<[^>]+>/g, '')
      .trim();

    if (cleanText) {
      cues.push({
        id: idCounter++,
        start,
        end: end > start ? end : start + 3,
        text: cleanText,
        words: null
      });
    }
  }

  cues.sort((a, b) => a.start - b.start);
  return cues;
}

/**
 * Parser WebVTT (soporta cues solapadas en tiempo)
 */
function parseVTT(content) {
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.split(/\n\s*\n/);
  const cues = [];
  let idCounter = 1;

  const timePattern = /((?:\d{1,2}:)?\d{1,2}:\d{2}[,\.]\d{1,3})\s*-->\s*((?:\d{1,2}:)?\d{1,2}:\d{2}[,\.]\d{1,3})/;

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    if (lines[0].startsWith('WEBVTT') || lines[0].startsWith('NOTE') || lines[0].startsWith('STYLE')) {
      continue;
    }

    let timeLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (timePattern.test(lines[i])) {
        timeLineIndex = i;
        break;
      }
    }

    if (timeLineIndex === -1) continue;

    const timeMatch = lines[timeLineIndex].match(timePattern);
    const start = parseTimeString(timeMatch[1]);
    const end = parseTimeString(timeMatch[2]);

    const textLines = lines.slice(timeLineIndex + 1);
    const cleanText = textLines
      .join(' ')
      .replace(/<[^>]+>/g, '')
      .trim();

    if (cleanText) {
      cues.push({
        id: idCounter++,
        start,
        end: end > start ? end : start + 3,
        text: cleanText,
        words: null
      });
    }
  }

  cues.sort((a, b) => a.start - b.start);
  return cues;
}

/**
 * Preprocesa y unifica subtítulos acumulativos para evitar repeticiones de palabras:
 * Si una cue siguiente extiende el texto de la anterior como prefijo, se fusiona en un
 * bloque unificado con marcas de tiempo por palabra.
 */
function preprocessAndMergeSubtitles(cues) {
  if (!cues || cues.length === 0) return [];
  // Los subtítulos roll-up de YouTube ya han sido consolidados y calibrados de forma precisa
  if (cues.isYouTubeRollup || (cues[0] && cues[0].isYouTubeRollup)) {
    return cues;
  }
  const merged = [];
  let i = 0;

  function normalizeText(str) {
    return (str || '')
      .toLowerCase()
      .replace(/[\s\p{P}\p{S}]+/gu, '') // Quita espacios y cualquier signo de puntuación o símbolo de cualquier idioma (Unicode)
      .trim();
  }

  while (i < cues.length) {
    let currentCue = cues[i];
    let group = [currentCue];
    let j = i + 1;

    while (j < cues.length) {
      const prevNorm = normalizeText(group[group.length - 1].text);
      const nextNorm = normalizeText(cues[j].text);
      const timeGap = cues[j].start - group[group.length - 1].end;

      // 1. Progresión acumulativa (frase que se va completando palabra por palabra)
      const isCumulative = prevNorm.length > 0 && nextNorm.length > prevNorm.length && nextNorm.startsWith(prevNorm);

      // 2. Duplicado exacto consecutivo (misma frase repetida en el mismo lapso)
      const isDuplicate = prevNorm.length > 0 && prevNorm === nextNorm;

      if ((isCumulative || isDuplicate) && timeGap <= 6.0) {
        group.push(cues[j]);
        j++;
      } else {
        break;
      }
    }

    if (group.length > 1) {
      const finalCue = group[group.length - 1];
      const words = [];

      for (let g = 0; g < group.length; g++) {
        const item = group[g];
        const nextItem = group[g + 1];

        let addedText = '';
        if (g === 0) {
          addedText = item.text.trim();
        } else {
          const prevRaw = group[g - 1].text.trim();
          if (item.text.toLowerCase().startsWith(prevRaw.toLowerCase())) {
            addedText = item.text.slice(prevRaw.length).trim();
          } else {
            const prevWords = prevRaw.split(/\s+/);
            const currentWords = item.text.trim().split(/\s+/);
            addedText = currentWords.slice(prevWords.length).join(' ');
          }
        }

        const start = item.start;
        const end = nextItem ? nextItem.start : item.end;
        const subWords = addedText ? addedText.split(/\s+/).filter(Boolean) : [];
        if (subWords.length > 0) {
          const wordDuration = Math.max(0.1, (end - start) / Math.max(1, subWords.length));
          subWords.forEach((w, wIdx) => {
            words.push({
              text: w,
              start: start + (wIdx * wordDuration),
              end: start + ((wIdx + 1) * wordDuration)
            });
          });
        }
      }

      // Si por alguna razón no se generaron palabras, derivar del texto final consolidado
      if (words.length === 0) {
        const subWords = finalCue.text.split(/\s+/).filter(Boolean);
        const totalDur = Math.max(0.1, finalCue.end - group[0].start);
        const wDur = totalDur / Math.max(1, subWords.length);
        subWords.forEach((w, wIdx) => {
          words.push({
            text: w,
            start: group[0].start + (wIdx * wDur),
            end: group[0].start + ((wIdx + 1) * wDur)
          });
        });
      }

      merged.push({
        id: merged.length + 1,
        text: finalCue.text,
        start: group[0].start,
        end: finalCue.end,
        words: words
      });

      i = j;
    } else {
      let words = currentCue.words;
      if (!words || words.length === 0) {
        const subWords = currentCue.text.split(/\s+/).filter(Boolean);
        const totalDur = Math.max(0.1, currentCue.end - currentCue.start);
        const wDur = totalDur / Math.max(1, subWords.length);
        words = subWords.map((w, wIdx) => ({
          text: w,
          start: currentCue.start + (wIdx * wDur),
          end: currentCue.start + ((wIdx + 1) * wDur)
        }));
      }

      merged.push({
        id: merged.length + 1,
        text: currentCue.text,
        start: currentCue.start,
        end: currentCue.end,
        words: words
      });
      i++;
    }
  }

  return merged;
}

/**
 * Función principal unificada
 */
function parseSubtitles(rawText, type = 'lrc') {
  if (!rawText || !rawText.trim()) return [];

  const cleanType = (type || '').toLowerCase();
  let rawCues = [];

  if (cleanType.includes('lrc')) {
    rawCues = parseLRC(rawText);
  } else if (cleanType.includes('srt')) {
    rawCues = parseSRT(rawText);
  } else if (cleanType.includes('vtt') || rawText.trim().startsWith('WEBVTT')) {
    rawCues = parseVTT(rawText);
  } else {
    if (rawText.includes('WEBVTT')) {
      rawCues = parseVTT(rawText);
    } else if (/-->/.test(rawText)) {
      rawCues = parseSRT(rawText);
    } else if (/\[\d{1,2}:\d{2}/.test(rawText)) {
      rawCues = parseLRC(rawText);
    }
  }

  return preprocessAndMergeSubtitles(rawCues);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseLRC, parseSRT, parseVTT, parseSubtitles, preprocessAndMergeSubtitles };
}
