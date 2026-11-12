/**
 * Módulo de Romanización / Transliteración al Vuelo
 * Soporta: Coreano (Hangul), Ruso (Cirílico), Griego y Japonés (Kana).
 */

// ==========================================
// 1. COREANO (HANGUL - REVISED ROMANIZATION)
// ==========================================
const HANGUL_CHOSEONG = [
  'g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '',
  'j', 'jj', 'ch', 'k', 't', 'p', 'h'
];

const HANGUL_JUNGSEONG = [
  'a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o',
  'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi',
  'yu', 'eu', 'ui', 'i'
];

const HANGUL_JONGSEONG = [
  '', 'k', 'k', 'ks', 'n', 'nj', 'nh', 't', 'l', 'lg', 'lm', 'lb', 'ls', 'lt', 'lp', 'lh',
  'm', 'p', 'ps', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 'h'
];

function romanizeHangul(text) {
  if (!text) return '';
  return text.replace(/[\uAC00-\uD7A3]/g, (char) => {
    const code = char.charCodeAt(0) - 0xAC00;
    const choseongIndex = Math.floor(code / 588);
    const jungseongIndex = Math.floor((code % 588) / 28);
    const jongseongIndex = code % 28;

    const initial = HANGUL_CHOSEONG[choseongIndex] || '';
    const vowel = HANGUL_JUNGSEONG[jungseongIndex] || '';
    const finalConsonant = HANGUL_JONGSEONG[jongseongIndex] || '';

    return initial + vowel + finalConsonant;
  });
}

// ==========================================
// 2. RUSO (CIRÍLICO - BGN/PCGN / ISO 9)
// ==========================================
const CYRILLIC_MAP = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z',
  'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
  'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
  'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',

  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh', 'З': 'Z',
  'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'N': 'N', 'О': 'O', 'П': 'P', 'Р': 'R',
  'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
  'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
};

function romanizeCyrillic(text) {
  if (!text) return '';
  return text.split('').map(ch => CYRILLIC_MAP[ch] !== undefined ? CYRILLIC_MAP[ch] : ch).join('');
}

// ==========================================
// 3. GRIEGO MODERNO (ISO 843 / ELOT 743)
// ==========================================
const GREEK_MAP = {
  'α': 'a', 'ά': 'a', 'β': 'v', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'έ': 'e', 'ζ': 'z', 'η': 'i', 'ή': 'i',
  'θ': 'th', 'ι': 'i', 'ί': 'i', 'ϊ': 'i', 'ΐ': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x',
  'ο': 'o', 'ό': 'o', 'π': 'p', 'р': 'r', 'ρ': 'r', 'σ': 's', 'ς': 's', 'τ': 't', 'υ': 'y', 'ύ': 'y',
  'ϋ': 'y', 'ΰ': 'y', 'φ': 'f', 'χ': 'ch', 'ψ': 'ps', 'ω': 'o', 'ώ': 'o',

  'Α': 'A', 'Ά': 'A', 'Β': 'V', 'Γ': 'G', 'Δ': 'D', 'Ε': 'E', 'Έ': 'E', 'Ζ': 'Z', 'Η': 'I', 'Ή': 'I',
  'Θ': 'Th', 'Ι': 'I', 'Ί': 'I', 'Κ': 'K', 'Λ': 'L', 'Μ': 'M', 'Ν': 'N', 'Ξ': 'X', 'Ο': 'O', 'Ό': 'O',
  'Π': 'P', 'Ρ': 'R', 'Σ': 'S', 'Τ': 'T', 'Υ': 'Y', 'Ύ': 'Y', 'Φ': 'F', 'Χ': 'Ch', 'Ψ': 'Ps', 'Ω': 'O', 'Ώ': 'O'
};

function romanizeGreek(text) {
  if (!text) return '';
  // Diptongos griegos comunes
  let t = text
    .replace(/ου/g, 'ou').replace(/Ου/g, 'Ou').replace(/ΟΥ/g, 'OU').replace(/ού/g, 'ou')
    .replace(/αυ([θκξπστφχs]|\s|$)/gi, 'af$1').replace(/αυ/gi, 'av')
    .replace(/ευ([θκξπστφχs]|\s|$)/gi, 'ef$1').replace(/ευ/gi, 'ev')
    .replace(/μπ/g, 'b').replace(/Μπ/g, 'B')
    .replace(/ντ/g, 'd').replace(/Ντ/g, 'D');

  return t.split('').map(ch => GREEK_MAP[ch] !== undefined ? GREEK_MAP[ch] : ch).join('');
}

// ==========================================
// 4. JAPONÉS KANA (HIRAGANA & KATAKANA)
// ==========================================
const KANA_MAP = {
  'あ':'a','い':'i','う':'u','え':'e','お':'o','か':'ka','き':'ki','く':'ku','け':'ke','こ':'ko',
  'さ':'sa','し':'shi','す':'su','せ':'se','そ':'so','た':'ta','ち':'chi','つ':'tsu','て':'te','と':'to',
  'な':'na','に':'ni','ぬ':'nu','ね':'ne','の':'no','は':'ha','ひ':'hi','ふ':'fu','へ':'he','ほ':'ho',
  'ま':'ma','み':'mi','む':'mu','め':'me','mo':'mo','や':'ya','ゆ':'yu','よ':'yo',
  'ら':'ra','り':'ri','る':'ru','れ':'re','ろ':'ro','わ':'wa','を':'wo','ん':'n',
  'が':'ga','ぎ':'gi','ぐ':'gu','げ':'ge','ご':'go','ざ':'za','じ':'ji','ず':'zu','ぜ':'ze','ぞ':'zo',
  'だ':'da','ぢ':'ji','づ':'zu','で':'de','ど':'do','ば':'ba','び':'bi','ぶ':'bu','べ':'be','ぼ':'bo',
  'ぱ':'pa','ぴ':'pi','ぷ':'pu','ぺ':'pe','ぽ':'po',
  // Katakana
  'ア':'a','イ':'i','ウ':'u','エ':'e','オ':'o','カ':'ka','キ':'ki','ク':'ku','ケ':'ke','コ':'ko',
  'サ':'sa','シ':'shi','ス':'su','セ':'se','ソ':'so','タ':'ta','チ':'chi','ツ':'tsu','テ':'te','ト':'to',
  'ナ':'na','ニ':'ni','ヌ':'nu','ネ':'ne','ノ':'no','ハ':'ha','ヒ':'hi','フ':'fu','ヘ':'he','ホ':'ho',
  'マ':'ma','ミ':'mi','ム':'mu','メ':'me','モ':'mo','ヤ':'ya','ユ':'yu','ヨ':'yo',
  'ラ':'ra','リ':'ri','ル':'ru','レ':'re','ロ':'ro','ワ':'wa','ヲ':'wo','ン':'n',
  'ガ':'ga','ギ':'gi','グ':'gu','ゲ':'ge','ゴ':'go','ザ':'za','ジ':'ji','ズ':'zu','ゼ':'ze','ゾ':'zo',
  'ダ':'da','ヂ':'ji','ヅ':'zu','デ':'de','ド':'do','バ':'ba','ビ':'bi','ブ':'bu','ベ':'be','ボ':'bo',
  'パ':'pa','ピ':'pi','プ':'pu','ペ':'pe','ポ':'po'
};

function romanizeKana(text) {
  if (!text) return '';
  return text.split('').map(ch => KANA_MAP[ch] !== undefined ? KANA_MAP[ch] : ch).join('');
}

// ==========================================
// 5. CACHÉ Y MOTOR JAPONÉS AVANZADO (KANJI + KANA)
// ==========================================
const JAPANESE_KANJI_REGEX = /[\u4E00-\u9FAF\u3400-\u4DBF]/;
const JAPANESE_ANY_REGEX = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]/;
const rendererJapaneseCache = new Map();
const pendingLookups = new Set();

/**
 * Precarga en lote todas las frases en japonés (Kanji / Kana) usando el analizador morfológico Kuroshiro
 */
async function preloadJapaneseBatch(texts) {
  if (!Array.isArray(texts)) return;
  if (typeof window === 'undefined' || !window.electronAPI || !window.electronAPI.romanizeJapaneseBatch) return;

  const needed = texts.filter(t => t && JAPANESE_ANY_REGEX.test(t) && !rendererJapaneseCache.has(t));
  if (needed.length === 0) return;

  const uniqueTexts = [...new Set(needed)];
  try {
    const results = await window.electronAPI.romanizeJapaneseBatch(uniqueTexts);
    for (let i = 0; i < uniqueTexts.length; i++) {
      if (results[i]) {
        rendererJapaneseCache.set(uniqueTexts[i], results[i]);
      }
    }
    if (typeof window.onRomanizationUpdated === 'function') {
      window.onRomanizationUpdated();
    }
  } catch (err) {
    console.warn('Error precargando lote japonés:', err);
  }
}

// ==========================================
// FUNCIÓN PRINCIPAL DE ROMANIZACIÓN AL VUELO
// ==========================================
function romanizeText(text) {
  if (!text || typeof text !== 'string') return '';

  let result = text;

  // 1. Coreano
  if (/[\uAC00-\uD7A3]/.test(result)) {
    result = romanizeHangul(result);
  }

  // 2. Cirílico (Ruso)
  if (/[\u0400-\u04FF]/.test(result)) {
    result = romanizeCyrillic(result);
  }

  // 3. Griego
  if (/[\u0370-\u03FF]/.test(result)) {
    result = romanizeGreek(result);
  }

  // 4. Japonés (Kanji y Kana)
  if (JAPANESE_ANY_REGEX.test(result)) {
    if (rendererJapaneseCache.has(result)) {
      return rendererJapaneseCache.get(result);
    }

    // Si contiene Kanji, solicitar conversión a Kuroshiro si aún no se ha pedido
    if (JAPANESE_KANJI_REGEX.test(result)) {
      if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.romanizeJapanese && !pendingLookups.has(result)) {
        pendingLookups.add(result);
        window.electronAPI.romanizeJapanese(result)
          .then((romaji) => {
            pendingLookups.delete(result);
            if (romaji) {
              rendererJapaneseCache.set(result, romaji);
              if (typeof window.onRomanizationUpdated === 'function') {
                window.onRomanizationUpdated(result, romaji);
              }
            }
          })
          .catch(() => pendingLookups.delete(result));
      }
      return romanizeKana(result);
    } else {
      result = romanizeKana(result);
    }
  }

  return result;
}

/**
 * Comprueba si una cadena contiene caracteres romanizables (Hangul, Cirílico, Griego, Kana y Kanji)
 */
function hasRomanizableCharacters(text) {
  if (!text) return false;
  return /[\uAC00-\uD7A3\u0400-\u04FF\u0370-\u03FF\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
}

// Exportar para entorno navegador o Node
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    romanizeText,
    romanizeHangul,
    romanizeCyrillic,
    romanizeGreek,
    romanizeKana,
    preloadJapaneseBatch,
    hasRomanizableCharacters
  };
}
if (typeof window !== 'undefined') {
  window.romanizeText = romanizeText;
  window.preloadJapaneseBatch = preloadJapaneseBatch;
  window.rendererJapaneseCache = rendererJapaneseCache;
  window.hasRomanizableCharacters = hasRomanizableCharacters;
}
