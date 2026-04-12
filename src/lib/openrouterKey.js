/** localStorage key for OpenRouter API key (browser-only; used on Netlify static deploys). */
export const LS_OPENROUTER_API_KEY = 'cf_openrouter_api_key';

/**
 * Resolves the OpenRouter API key: saved UI value first, then Vite env (local dev).
 * @returns {string}
 */
export function getOpenRouterApiKey() {
  const fromLs = localStorage.getItem(LS_OPENROUTER_API_KEY);
  const trimmedLs = typeof fromLs === 'string' ? fromLs.trim() : '';
  if (trimmedLs) return trimmedLs;
  const fromEnv = import.meta.env.VITE_OPENROUTER_API_KEY;
  return (typeof fromEnv === 'string' && fromEnv.trim()) || '';
}

export const OPENROUTER_KEY_MISSING_MSG =
  'OpenRouter API key is not set. Add your key via the API key control in the header, or set VITE_OPENROUTER_API_KEY in a .env file for local development.';
