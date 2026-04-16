export const PROMPT_PACK_VERSION = 3;

const IMAGE1_ARRAY_KEYS = ['subject', 'hair', 'outfit', 'setting', 'lighting', 'camera', 'extras'];

const IMAGE23_ARRAY_KEYS = ['outfit', 'setting', 'mood', 'lighting'];

const TEXT_PROMPT_ARRAY_KEYS = ['dynamic', 'twist', 'tone', 'openerStyle'];

function isStringArray(value) {
  return Array.isArray(value) && value.every((x) => typeof x === 'string');
}

function validateImage1PromptConfig(pc) {
  if (!pc || typeof pc !== 'object') return 'promptConfig must be an object';
  if (typeof pc.staticStyle !== 'string') return 'promptConfig.staticStyle must be a string';
  for (const key of IMAGE1_ARRAY_KEYS) {
    if (!isStringArray(pc[key])) {
      return `promptConfig.${key} must be an array of strings`;
    }
  }
  return null;
}

function validateImage23PromptConfig(pc) {
  if (!pc || typeof pc !== 'object') return 'promptConfig must be an object';
  if (typeof pc.staticStyle !== 'string') return 'promptConfig.staticStyle must be a string';
  for (const key of IMAGE23_ARRAY_KEYS) {
    if (!isStringArray(pc[key])) {
      return `promptConfig.${key} must be an array of strings`;
    }
  }
  return null;
}

function validateTextPromptConfig(tpc) {
  if (!tpc || typeof tpc !== 'object') return 'textPromptConfig must be an object';
  if (typeof tpc.staticInstruction !== 'string') {
    return 'textPromptConfig.staticInstruction must be a string';
  }
  if (typeof tpc.staticExamples !== 'string') {
    return 'textPromptConfig.staticExamples must be a string';
  }
  for (const key of TEXT_PROMPT_ARRAY_KEYS) {
    if (!isStringArray(tpc[key])) {
      return `textPromptConfig.${key} must be an array of strings`;
    }
  }
  return null;
}

function validateEntryPromptConfig(ep) {
  if (!ep || typeof ep !== 'object') return 'entryPromptConfig must be an object';
  if (typeof ep.systemPrompt !== 'string') {
    return 'entryPromptConfig.systemPrompt must be a string';
  }
  return null;
}

/** Legacy Carousel Factory (single image row) — same shape as v1/v2 top-level fields. */
function validateLegacyPromptConfig(pc) {
  return validateImage1PromptConfig(pc);
}

/**
 * CF2 full export (three image days + shared text + entry system prompt).
 * @param {{
 *   img1Config: object,
 *   img1Overlay: string,
 *   img2Config: object,
 *   img2Overlay: string,
 *   img3Config: object,
 *   img3Overlay: string,
 *   textPromptConfig: object,
 *   entryPromptConfig: object,
 * }} slice
 */
export function buildPromptPack({
  img1Config,
  img1Overlay,
  img2Config,
  img2Overlay,
  img3Config,
  img3Overlay,
  textPromptConfig,
  entryPromptConfig,
}) {
  return {
    version: PROMPT_PACK_VERSION,
    exportedAt: new Date().toISOString(),
    images: {
      day1: { promptConfig: img1Config, textOverlay: img1Overlay },
      day7: { promptConfig: img2Config, textOverlay: img2Overlay },
      day100: { promptConfig: img3Config, textOverlay: img3Overlay },
    },
    textPromptConfig,
    entryPromptConfig,
  };
}

/**
 * Normalized pack: v3 includes img2/img3; v1/v2 legacy only sets day1 image fields + text (+ entry for v2).
 * @param {string | unknown} input
 * @returns {{ ok: true, data: object } | { ok: false, error: string }}
 */
export function parsePromptPack(input) {
  let obj;
  if (typeof input === 'string') {
    try {
      obj = JSON.parse(input);
    } catch {
      return { ok: false, error: 'Invalid JSON' };
    }
  } else {
    obj = input;
  }

  if (!obj || typeof obj !== 'object') {
    return { ok: false, error: 'Invalid file: expected a JSON object' };
  }

  const version = obj.version;
  if (version !== 1 && version !== 2 && version !== 3) {
    return {
      ok: false,
      error: 'Unsupported version (expected 1, 2, or 3)',
    };
  }

  if (version === 3) {
    const images = obj.images;
    if (!images || typeof images !== 'object') {
      return { ok: false, error: 'images must be an object' };
    }
    const d1 = images.day1;
    const d7 = images.day7;
    const d100 = images.day100;
    if (!d1 || typeof d1 !== 'object') return { ok: false, error: 'images.day1 is required' };
    if (!d7 || typeof d7 !== 'object') return { ok: false, error: 'images.day7 is required' };
    if (!d100 || typeof d100 !== 'object') return { ok: false, error: 'images.day100 is required' };
    if (typeof d1.textOverlay !== 'string') return { ok: false, error: 'images.day1.textOverlay must be a string' };
    if (typeof d7.textOverlay !== 'string') return { ok: false, error: 'images.day7.textOverlay must be a string' };
    if (typeof d100.textOverlay !== 'string') return { ok: false, error: 'images.day100.textOverlay must be a string' };

    const e1 = validateImage1PromptConfig(d1.promptConfig);
    if (e1) return { ok: false, error: `images.day1.${e1}` };
    const e7 = validateImage23PromptConfig(d7.promptConfig);
    if (e7) return { ok: false, error: `images.day7.${e7}` };
    const e100 = validateImage23PromptConfig(d100.promptConfig);
    if (e100) return { ok: false, error: `images.day100.${e100}` };

    const tpcErr = validateTextPromptConfig(obj.textPromptConfig);
    if (tpcErr) return { ok: false, error: tpcErr };

    const epErr = validateEntryPromptConfig(obj.entryPromptConfig);
    if (epErr) return { ok: false, error: epErr };

    return {
      ok: true,
      data: {
        img1Config: d1.promptConfig,
        img1Overlay: d1.textOverlay,
        img2Config: d7.promptConfig,
        img2Overlay: d7.textOverlay,
        img3Config: d100.promptConfig,
        img3Overlay: d100.textOverlay,
        textPromptConfig: obj.textPromptConfig,
        entryPromptConfig: obj.entryPromptConfig,
      },
    };
  }

  // v1 / v2 — original Carousel Factory: single image promptConfig + textOverlay
  if (typeof obj.textOverlay !== 'string') {
    return { ok: false, error: 'textOverlay must be a string' };
  }

  const pcErr = validateLegacyPromptConfig(obj.promptConfig);
  if (pcErr) return { ok: false, error: pcErr };

  const tpcErr = validateTextPromptConfig(obj.textPromptConfig);
  if (tpcErr) return { ok: false, error: tpcErr };

  if (version === 2) {
    const epErr = validateEntryPromptConfig(obj.entryPromptConfig);
    if (epErr) return { ok: false, error: epErr };
  }

  return {
    ok: true,
    data: {
      img1Config: obj.promptConfig,
      img1Overlay: obj.textOverlay,
      textPromptConfig: obj.textPromptConfig,
      ...(version === 2 && obj.entryPromptConfig
        ? { entryPromptConfig: obj.entryPromptConfig }
        : {}),
    },
  };
}
