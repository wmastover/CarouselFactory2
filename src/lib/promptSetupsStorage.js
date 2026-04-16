export const PROMPT_SETUPS_LS_KEY = 'cf2_saved_prompt_setups';

const ENVELOPE_VERSION = 1;

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `s-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isValidSetupEntry(s) {
  return (
    s &&
    typeof s === 'object' &&
    typeof s.id === 'string' &&
    typeof s.name === 'string' &&
    s.pack &&
    typeof s.pack === 'object'
  );
}

/** @returns {{ id: string, name: string, savedAt: string, pack: object }[]} */
export function readSavedPromptSetups() {
  try {
    const raw = localStorage.getItem(PROMPT_SETUPS_LS_KEY);
    if (!raw) return [];
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== 'object' || !Array.isArray(obj.setups)) return [];
    return obj.setups.filter(isValidSetupEntry);
  } catch {
    return [];
  }
}

/** @param {{ id: string, name: string, savedAt: string, pack: object }[]} setups */
export function writeSavedPromptSetups(setups) {
  localStorage.setItem(
    PROMPT_SETUPS_LS_KEY,
    JSON.stringify({ version: ENVELOPE_VERSION, setups })
  );
}

/** @param {object} pack — return value of buildPromptPack */
export function upsertSavedPromptSetup(name, pack) {
  const trimmed = name.trim();
  const setups = readSavedPromptSetups();
  if (!trimmed) {
    return { ok: false, error: 'Setup name is required', setups };
  }
  const idx = setups.findIndex((s) => s.name.trim() === trimmed);
  const savedAt = new Date().toISOString();
  const entry = {
    id: idx >= 0 ? setups[idx].id : newId(),
    name: trimmed,
    savedAt,
    pack,
  };
  const next =
    idx >= 0 ? [...setups.slice(0, idx), entry, ...setups.slice(idx + 1)] : [...setups, entry];
  writeSavedPromptSetups(next);
  return { ok: true, setups: next };
}

export function deleteSavedPromptSetup(id) {
  const setups = readSavedPromptSetups().filter((s) => s.id !== id);
  writeSavedPromptSetups(setups);
  return setups;
}
