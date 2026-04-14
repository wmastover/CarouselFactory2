const MODEL = 'google/gemini-2.0-flash-001';

const ENTRY_SUGGESTIONS_TOOL = {
  type: 'function',
  function: {
    name: 'generate_entry_suggestions',
    description: 'Output 3 journal entry suggestions about going no contact, self-improvement, and a personal milestone.',
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
                description: 'A short, punchy journal entry title (5–8 words max).',
              },
              body: {
                type: 'string',
                description: '2–3 emotionally honest sentences in the first person about going no contact, working on herself, and a personal milestone.',
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

Write 3 different journal entry drafts from the perspective of a woman who went no contact with an ex and has been actively working on herself — hitting the gym, going to therapy, investing in friendships, picking up hobbies, sleeping better, doing the things she always put off. She just hit a personal milestone and it's making her reflect on how much her life has changed.

The tone is everything: these entries should sound like she's venting or spilling to her absolute best friend — casual, unfiltered, and real. Think stream of consciousness, not polished writing. She uses contractions, she trails off, she repeats herself a little when she's excited or emotional. No full sentences required. No "dear diary." Just raw, honest, emotionally alive thoughts the way they actually sound in her head.

Each entry should:
- Sound conversational and natural — like a voice note transcribed, not an essay
- Touch on the relief and clarity that comes from going no contact — the mental space, the peace, realising how much she was holding herself back
- Weave in her self-improvement journey — something specific she's been working on (fitness, therapy, a new skill, her social life, her ambitions)
- Connect to a personal milestone she just hit — something that made it all feel real and worth it
- Have a short punchy title that sounds like something she'd actually say (not poetic, just real — e.g. "I can't believe I stayed that long", "should've left sooner honestly", "hit my goal today wtf")
- Have 2–3 sentences of unfiltered thought in the body
- Feel distinct from the other two suggestions — vary the emotional angle (e.g. one triumphant, one soft and reflective, one almost amused looking back)

Do not be formal. Write like she's typing fast and feeling a lot. Focus on growth, freedom, self-investment, and the pride of reaching something she set out to do.`;

const MILESTONES = [
  'just hit a new personal record at the gym',
  'booked a solo trip for the first time ever',
  'got a promotion she worked really hard for',
  'finally finished a big project she kept putting off',
  'celebrated a full month of a new healthy habit',
  'ran her first 5k',
  'had a breakthrough session in therapy',
  'reconnected with an old friend she had drifted from',
  'signed up for — and actually showed up to — a class she was scared to try',
  'woke up one morning and realised she hadn\'t thought about him in days',
  'bought herself something meaningful with her own money, just because',
  'looked in the mirror and genuinely liked what she saw',
  'got through a hard week without reaching out to him',
  'cooked a proper meal for herself and felt proud of it',
  'stayed in on a Friday night and actually enjoyed it',
];

const ANGLES = [
  'triumphant and a little shocked at herself',
  'softly reflective and grateful',
  'almost amused looking back at who she used to be',
  'quietly proud but not making a big deal of it',
  'genuinely relieved — like she can finally breathe',
  'fired up and energised, feeling unstoppable',
  'tender and a bit emotional about how far she\'s come',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generates 3 journal entry suggestions about going no contact, self-improvement, and a personal milestone.
 * @returns {Promise<Array<{title: string, body: string}>>}
 */
export async function generateEntrySuggestions() {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_OPENROUTER_API_KEY is not set.');
  }

  const milestone = pick(MILESTONES);
  const angle = pick(ANGLES);

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
        {
          role: 'user',
          content: `Generate 3 journal entry suggestions. Today's milestone: she ${milestone}. Make at least one entry lead with a ${angle} emotional angle.`,
        },
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
