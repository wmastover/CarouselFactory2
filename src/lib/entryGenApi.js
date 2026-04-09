const MODEL = 'google/gemini-2.0-flash-001';

const ENTRY_SUGGESTIONS_TOOL = {
  type: 'function',
  function: {
    name: 'generate_entry_suggestions',
    description: 'Output 3 journal entry suggestions written from the perspective of the girl texting.',
    parameters: {
      type: 'object',
      properties: {
        suggestions: {
          type: 'array',
          description: '3 journal entry suggestions.',
          items: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'A short, evocative journal entry title (5–8 words max).',
              },
              body: {
                type: 'string',
                description: '2–3 emotionally honest sentences written in the first person from the girl\'s perspective.',
              },
            },
            required: ['title', 'body'],
          },
          minItems: 3,
          maxItems: 3,
        },
      },
      required: ['suggestions'],
    },
  },
};

const SYSTEM_PROMPT = `You are helping generate journal entry suggestions for a journaling app called Entries.

Given a text message conversation, write 3 different journal entry drafts from the perspective of the person labelled "Me" in the conversation.

The tone is everything: these entries should sound like the girl is venting or spilling to her absolute best friend — casual, unfiltered, and real. Think stream of consciousness, not polished writing. She uses contractions, she trails off, she repeats herself a little when she's worked up. No full sentences required. No "dear diary." Just raw, honest, emotionally messy thoughts the way they actually sound in her head.

Each entry should:
- Sound conversational and natural — like a voice note transcribed, not an essay
- React to the emotional content of the conversation — what she's feeling right now, what's bugging her, what she can't stop thinking about
- Have a short punchy title that sounds like something she'd actually say (not poetic, just real — e.g. "why did he even say that", "omg I can't", "idk how to feel rn")
- Have 2–3 sentences of unfiltered thought in the body
- Feel distinct from the other two suggestions — vary the emotional angle (e.g. one venting, one sad and soft, one confused or overthinking)

Do not summarise the conversation. Do not be formal. Write like she's typing fast and feeling a lot.`;

/**
 * Generates 3 journal entry suggestions based on a text message conversation.
 * @param {Array<{sender: 'me'|'them', text: string}>} messages
 * @returns {Promise<Array<{title: string, body: string}>>}
 */
export async function generateEntrySuggestions(messages) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_OPENROUTER_API_KEY is not set.');
  }

  const convText = messages
    .map((m) => `${m.sender === 'me' ? 'Me' : 'Them'}: ${m.text}`)
    .join('\n');

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Here is the conversation:\n\n${convText}` },
      ],
      tools: [ENTRY_SUGGESTIONS_TOOL],
      tool_choice: { type: 'function', function: { name: 'generate_entry_suggestions' } },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Entry suggestions API error ${response.status}`);
  }

  const data = await response.json();
  const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];

  if (!toolCall) {
    throw new Error('No tool call returned from entry suggestions API');
  }

  const args = JSON.parse(toolCall.function.arguments);
  return args.suggestions;
}
