import { getOpenRouterApiKey, OPENROUTER_KEY_MISSING_MSG } from './openrouterKey';

/** OpenRouter model id used for image generation (shown in UI). */
export const IMAGE_GEN_MODEL = 'google/gemini-3.1-flash-image-preview';

/**
 * Generates an image via OpenRouter using Gemini's image generation.
 * @param {string} prompt
 * @returns {Promise<string>} base64 data URL of the generated image
 */
export async function generateImage(prompt, { signal } = {}) {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) {
    throw new Error(OPENROUTER_KEY_MISSING_MSG);
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    signal,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
    },
    body: JSON.stringify({
      model: IMAGE_GEN_MODEL,
      messages: [{ role: 'user', content: prompt }],
      modalities: ['image', 'text'],
      image_config: { aspect_ratio: '9:16' },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Image API error ${response.status}`);
  }

  const data = await response.json();

  // OpenRouter returns the image as a base64 data URL in images array
  const imageUrl =
    data?.choices?.[0]?.message?.images?.[0]?.image_url?.url ||
    data?.choices?.[0]?.message?.content?.find?.((c) => c.type === 'image_url')?.image_url?.url;

  if (!imageUrl) {
    const textContent =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.message?.content?.find?.((c) => c.type === 'text')?.text;
    const reason = typeof textContent === 'string' && textContent.trim()
      ? `Model responded with text instead of an image: "${textContent.trim().slice(0, 200)}"`
      : `No image in response. Finish reason: ${data?.choices?.[0]?.finish_reason ?? 'unknown'}`;
    throw new Error(reason);
  }

  return imageUrl;
}
