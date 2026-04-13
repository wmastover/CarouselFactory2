function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Image prompt generation ──────────────────────────────────────

export const DEFAULT_STATIC_STYLE =
  'dark hair, sexy neutral expression, not smiling, lips slightly parted, ' +
  'black or dark clothing showing some cleavage, ' +
  'front camera selfie, very close crop on face and chest, ' +
  'night time, warm dim indoor light, ' +
  'realistic iphone photo, slightly grainy, no retouching, natural skin';

export const DEFAULT_SUBJECT = [
  'attractive young woman in her early 20s',
  'young brunette woman with sharp features',
  'confident young woman',
  'striking young woman in her 20s',
];

export const DEFAULT_HAIR = [
  'long dark brown hair spread out',
  'voluminous wavy dark hair',
  'straight dark hair loosely framing face',
  'tousled dark brunette hair, slightly messy',
];

export const DEFAULT_OUTFIT = [
  'black corset top',
  'black bralette, straps visible',
  'tight black low-cut top',
  'black bodysuit with thin straps, showing off some cleavage',
  'black crop top, slightly off shoulder',
];

export const DEFAULT_SETTING = [
  'lying in bed at night, rumpled sheets, dim warm lamp glow',
  'in the passenger seat of a car at night, window behind',
  'in the back seat of a car at night, window behind',
  'lying back on a bed, phone held above, looking up into camera',
  'in a dimly lit bedroom, lying sideways on pillow',
  'in the back seat of a car at night, city lights softly blurred outside',
];

export const DEFAULT_LIGHTING = [
  'warm dim bedside lamp, soft shadows',
  'low warm ambient light, slightly underexposed',
  'dim yellow room light, natural night feel',
  'soft warm glow from off-screen lamp, mostly dark background',
];

export const DEFAULT_CAMERA = [
  'selfie held above looking down, slightly tilted',
  'front camera selfie, very close, candid',
  'selfie angle from slightly above, face and chest filling frame',
  'close front camera crop, slightly grainy, spontaneous',
];

export const DEFAULT_EXTRAS = [
  'glossy nude lip, heavy lashes, dewy skin',
  'smoky eye, glossy lip',
  'minimal makeup, glossy lip, looking directly into lens',
  'heavy lashes, matte skin',
];

const IMAGE_JSON_PROMPT_INSTRUCTION =
  'Generate one cohesive photorealistic image in vertical 9:16 framing. ' +
  'Follow the JSON scene specification below exactly—every field is mandatory. ' +
  'Interpret subject, hair, outfit, setting, lighting, camera, extras, and staticStyle as one unified photograph, not a list of unrelated ideas.';

function buildImagePromptFromSegments(segments) {
  const spec = {
    schemaVersion: 1,
    scene: {
      subject: segments.subject,
      hair: segments.hair,
      outfit: segments.outfit,
      setting: segments.setting,
      lighting: segments.lighting,
      camera: segments.camera,
      extras: segments.extras,
      staticStyle: segments.staticStyle,
    },
  };
  const json = JSON.stringify(spec, null, 2);
  return `${IMAGE_JSON_PROMPT_INSTRUCTION}\n\n\`\`\`json\n${json}\n\`\`\``;
}

export function generateImagePrompt(config) {
  const staticStyle = config?.staticStyle ?? DEFAULT_STATIC_STYLE;

  const segments = {
    subject: pick(config?.subject ?? DEFAULT_SUBJECT),
    hair: pick(config?.hair ?? DEFAULT_HAIR),
    outfit: pick(config?.outfit ?? DEFAULT_OUTFIT),
    setting: pick(config?.setting ?? DEFAULT_SETTING),
    lighting: pick(config?.lighting ?? DEFAULT_LIGHTING),
    camera: pick(config?.camera ?? DEFAULT_CAMERA),
    extras: pick(config?.extras ?? DEFAULT_EXTRAS),
    staticStyle,
  };

  const prompt = buildImagePromptFromSegments(segments);

  return { prompt, segments };
}

// ── Text / iMessage conversation meta-prompt generation ──────────

const STATIC_HOOK_CONTEXT =
  'The carousel this will appear on has the hook: ' +
  '"sometimes you just got to read a mans text and go about your day"';

export const DEFAULT_STATIC_EXAMPLES = `
Example 1:
Me: "im seeing someone else"
Them: "You dating me and someone else?"
Me: "yeah"
Them: "Fuck it make a group chat"
Them: "So I can meet my boyfriend in law"

Example 2:
Them: "Do you like me or not"
Me: "your gf does"
Them: "Don't bring her up"
Them: "This is about us"
Them: "I would treat you better than I treat her"

Example 3:
Them: "My dream girl"
Me: "shut up im not"
Them: "I never said what kind of dreams"
Them: "Ur a nightmare"
`;

export const DEFAULT_STATIC_INSTRUCTION =
  'You are writing a short, punchy iMessage conversation for a viral social media carousel. ' +
  'The conversation must feel real, unfiltered, and instantly relatable. ' +
  'It should be 3–5 messages total. ' +
  'The key is engagement: mild controversy, a twist, a self-own, ragebait, or a moment that makes someone screenshot and share. ' +
  'CRITICAL RULE: The final message in the conversation MUST always be from "them" — never from "me". ' +
  '"Me" does not respond to the last message. The conversation ends with "them" hanging, left on read. ' +
  'Do NOT add quotation marks inside the message text. ' +
  'Do NOT include timestamps, read receipts, or any formatting — just the raw dialogue. ' +
  'Only use \'me\' and \'them\' as senders. ' +
  STATIC_HOOK_CONTEXT;

export const DEFAULT_DYNAMIC = [
  'situationship that never got a label',
  'someone who has a girlfriend but keeps texting you',
  'an ex who thinks they still have a chance',
  'a talking stage that\'s been going on way too long',
  'someone you friend-zoned who hasn\'t accepted it',
  'a guy who\'s clearly in love but will never admit it',
  'someone who ghosted you and just came back',
  'a guy who flirts but acts clueless when called out',
  'someone who thinks they\'re smooth but isn\'t',
  'an ex who saw you looking good and regrets everything',
];

export const DEFAULT_TWIST = [
  'ends with a brutal self-own from them',
  'ends with a complete reversal — they say something that backfires on themselves',
  'has an unexpected reveal in their final message that recontextualises the whole exchange',
  'escalates from innocent to unhinged in their last message',
  'ends with them doubling down on something embarrassing with zero self-awareness',
  'their last message is so chaotic it makes no sense but is somehow perfect',
  'them accidentally exposes themselves completely in their final message',
  'them tries to be slick but ends up accidentally confessing something in the last message',
  'their final message is the most unhinged possible response to something totally normal',
  'ends with them going weirdly philosophical to avoid accountability',
];

export const DEFAULT_TONE = [
  'dry and witty',
  'unbothered and slightly cruel',
  'chaotic and unhinged',
  'passive-aggressive',
  'blunt to the point of being funny',
  'deadpan',
  'overly casual about something that should be a big deal',
];

export const DEFAULT_OPENER_STYLE = [
  'starts with an accusation',
  'starts with a confession',
  'starts with a compliment that immediately goes wrong',
  'starts with a question that has no good answer',
  'starts mid-argument, no context',
  'starts with something sweet that turns sour fast',
  'starts with them sliding back in after a long silence',
  'starts with a bold claim from them that unravels',
];

export function generateTextMetaPrompt(config) {
  const staticInstruction = config?.staticInstruction ?? DEFAULT_STATIC_INSTRUCTION;
  const staticExamples = config?.staticExamples ?? DEFAULT_STATIC_EXAMPLES;
  const dynamic = config?.dynamic ?? DEFAULT_DYNAMIC;
  const twist = config?.twist ?? DEFAULT_TWIST;
  const tone = config?.tone ?? DEFAULT_TONE;
  const openerStyle = config?.openerStyle ?? DEFAULT_OPENER_STYLE;

  const directive =
    `Write a conversation between two people in a ${pick(dynamic)}. ` +
    `The conversation ${pick(openerStyle)}. ` +
    `The tone is ${pick(tone)}. ` +
    `The punchline or ending ${pick(twist)}. ` +
    `Use the examples below as a style guide — match their energy, length, and format.\n\n` +
    `Examples:${staticExamples}`;

  return `${staticInstruction}\n\n${directive}`;
}
