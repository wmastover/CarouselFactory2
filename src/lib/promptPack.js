export const PROMPT_PACK_VERSION = 1;

const PROMPT_CONFIG_ARRAY_KEYS = [
  'subject',
  'hair',
  'outfit',
  'setting',
  'lighting',
  'camera',
  'extras',
];

const TEXT_PROMPT_ARRAY_KEYS = ['dynamic', 'twist', 'tone', 'openerStyle'];

function isStringArray(value) {
  return Array.isArray(value) && value.every((x) => typeof x === 'string');
}

function validatePromptConfig(pc) {
  if (!pc || typeof pc !== 'object') return 'promptConfig must be an object';
  if (typeof pc.staticStyle !== 'string') return 'promptConfig.staticStyle must be a string';
  for (const key of PROMPT_CONFIG_ARRAY_KEYS) {
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

/**
 * @param {{ promptConfig: object, textOverlay: string, textPromptConfig: object }} slice
 */
export function buildPromptPack({ promptConfig, textOverlay, textPromptConfig }) {
  return {
    version: PROMPT_PACK_VERSION,
    exportedAt: new Date().toISOString(),
    promptConfig,
    textOverlay,
    textPromptConfig,
  };
}

/**
 * @param {string | unknown} input - raw JSON string or already-parsed value
 * @returns {{ ok: true, data: { promptConfig: object, textOverlay: string, textPromptConfig: object } } | { ok: false, error: string }}
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

  if (obj.version !== PROMPT_PACK_VERSION) {
    return {
      ok: false,
      error: `Unsupported version (expected ${PROMPT_PACK_VERSION})`,
    };
  }

  if (typeof obj.textOverlay !== 'string') {
    return { ok: false, error: 'textOverlay must be a string' };
  }

  const pcErr = validatePromptConfig(obj.promptConfig);
  if (pcErr) return { ok: false, error: pcErr };

  const tpcErr = validateTextPromptConfig(obj.textPromptConfig);
  if (tpcErr) return { ok: false, error: tpcErr };

  return {
    ok: true,
    data: {
      promptConfig: obj.promptConfig,
      textOverlay: obj.textOverlay,
      textPromptConfig: obj.textPromptConfig,
    },
  };
}
