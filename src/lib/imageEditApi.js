import { getOpenRouterApiKey, OPENROUTER_KEY_MISSING_MSG } from './openrouterKey';

const MODEL = 'google/gemini-3.1-flash-image-preview';

/**
 * Inpaints an image using multimodal Gemini.
 * @param {string} originalDataUrl - base64 data URL of the original image
 * @param {string} annotatedDataUrl - base64 data URL of original + red mask overlay
 * @param {string} userPrompt - description of desired change in the masked region
 * @returns {Promise<string>} base64 data URL of the edited image
 */
export async function inpaintImage(originalDataUrl, annotatedDataUrl, userPrompt, { signal } = {}) {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) throw new Error(OPENROUTER_KEY_MISSING_MSG);

  const instruction =
    `You are a photo editor. I'm giving you two images:\n` +
    `1. The original photo.\n` +
    `2. The same photo with red brush marks painted over specific areas.\n\n` +
    `Your task: edit the original photo so that the red-marked areas show: ${userPrompt}\n\n` +
    `Rules:\n` +
    `- Keep everything OUTSIDE the red marks completely identical.\n` +
    `- Match the original photo's lighting, grain, realism, and style.\n` +
    `- Output only the edited photo, no text.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    signal,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: instruction },
            { type: 'image_url', image_url: { url: originalDataUrl } },
            { type: 'image_url', image_url: { url: annotatedDataUrl } },
          ],
        },
      ],
      modalities: ['image', 'text'],
      image_config: { aspect_ratio: '9:16' },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Image edit API error ${response.status}`);
  }

  const data = await response.json();
  const imageUrl =
    data?.choices?.[0]?.message?.images?.[0]?.image_url?.url ||
    data?.choices?.[0]?.message?.content?.find?.((c) => c.type === 'image_url')?.image_url?.url;

  if (!imageUrl) {
    const textContent =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.message?.content?.find?.((c) => c.type === 'text')?.text;
    const reason = typeof textContent === 'string' && textContent.trim()
      ? `Model declined: "${textContent.trim().slice(0, 200)}"`
      : `No image in response. Finish reason: ${data?.choices?.[0]?.finish_reason ?? 'unknown'}`;
    throw new Error(reason);
  }

  return imageUrl;
}
