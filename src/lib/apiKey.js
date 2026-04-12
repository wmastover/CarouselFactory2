const LS_KEY = 'cf_openrouter_api_key';

export function getApiKey() {
  return localStorage.getItem(LS_KEY) || import.meta.env.VITE_OPENROUTER_API_KEY || '';
}

export function setApiKey(key) {
  localStorage.setItem(LS_KEY, key.trim());
}
