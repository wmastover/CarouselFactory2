import { getOpenRouterApiKey, OPENROUTER_KEY_MISSING_MSG } from './openrouterKey';

const MODEL = 'google/gemini-2.0-flash-001';

const CONVERSATION_TOOL = {
  type: 'function',
  function: {
    name: 'create_conversation',
    description: 'Output the iMessage conversation as a structured list of messages.',
    parameters: {
      type: 'object',
      properties: {
        messages: {
          type: 'array',
          description: 'The conversation messages in order.',
          items: {
            type: 'object',
            properties: {
              sender: {
                type: 'string',
                enum: ['me', 'them'],
                description: "'me' for the user's messages, 'them' for the other person.",
              },
              text: {
                type: 'string',
                description: 'The raw message text with no surrounding quotes.',
              },
            },
            required: ['sender', 'text'],
          },
          minItems: 3,
          maxItems: 5,
        },
      },
      required: ['messages'],
    },
  },
};

/**
 * Regenerates the text for a single message in an existing conversation.
 * @param {Array<{sender: 'me'|'them', text: string}>} messages
 * @param {number} targetIdx - index of the message to replace
 * @returns {Promise<string>} new message text
 */
export async function regenerateMessage(messages, targetIdx) {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) throw new Error(OPENROUTER_KEY_MISSING_MSG);

  const contextStr = messages
    .map((m, i) =>
      `${m.sender === 'me' ? 'Me' : 'Them'}: "${m.text}"${i === targetIdx ? ' ← REPLACE THIS' : ''}`
    )
    .join('\n');

  const prompt =
    `You are editing an iMessage conversation for a viral social media post.\n\n` +
    `Here is the conversation:\n${contextStr}\n\n` +
    `Rewrite ONLY the message marked "← REPLACE THIS" with a fresh alternative that fits the tone and flow of the conversation. ` +
    `Keep it short (one line, no more than ~10 words). ` +
    `Return ONLY the new message text — no quotes, no labels, no explanation.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Text API error ${response.status}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('No response from API');
  return text;
}

/**
 * Generates an iMessage conversation via OpenRouter.
 * @param {string} metaPrompt
 * @returns {Promise<Array<{sender: 'me'|'them', text: string}>>}
 */
export async function generateConversation(metaPrompt, { signal } = {}) {
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
      model: MODEL,
      messages: [{ role: 'user', content: metaPrompt }],
      tools: [CONVERSATION_TOOL],
      tool_choice: { type: 'function', function: { name: 'create_conversation' } },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Text API error ${response.status}`);
  }

  const data = await response.json();
  const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];

  if (!toolCall) {
    throw new Error('No tool call returned from API');
  }

  const args = JSON.parse(toolCall.function.arguments);
  return args.messages;
}
