import defaultCarouselImagePrompts from '../data/defaultCarouselImagePrompts.json';

function pick(arr) {
  if (!arr || arr.length === 0) return '';
  return arr[Math.floor(Math.random() * arr.length)];
}

const img1 = defaultCarouselImagePrompts.image1.config;
const img2 = defaultCarouselImagePrompts.image2.config;
const img3 = defaultCarouselImagePrompts.image3.config;

// ── Image 1 defaults (Day 1) — from defaultCarouselImagePrompts.json ──

export const DEFAULT_IMAGE1_OVERLAY = defaultCarouselImagePrompts.image1.overlay;

export const DEFAULT_IMAGE1_STATIC_STYLE = img1.staticStyle;

export const DEFAULT_IMAGE1_SUBJECT = [...img1.subject];
export const DEFAULT_IMAGE1_HAIR = [...img1.hair];
export const DEFAULT_IMAGE1_OUTFIT = [...img1.outfit];
export const DEFAULT_IMAGE1_SETTING = [...img1.setting];
export const DEFAULT_IMAGE1_LIGHTING = [...img1.lighting];
export const DEFAULT_IMAGE1_CAMERA = [...img1.camera];
export const DEFAULT_IMAGE1_EXTRAS = [...img1.extras];

// ── Image 2 defaults (Day 7) ─────────────────────────────────────

export const DEFAULT_IMAGE2_OVERLAY = defaultCarouselImagePrompts.image2.overlay;

export const DEFAULT_IMAGE2_STATIC_STYLE = img2.staticStyle;

export const DEFAULT_IMAGE2_SETTING = [...img2.setting];
export const DEFAULT_IMAGE2_MOOD = [...img2.mood];
export const DEFAULT_IMAGE2_OUTFIT = [...img2.outfit];
export const DEFAULT_IMAGE2_LIGHTING = [...img2.lighting];

// ── Image 3 defaults (Day 100) ───────────────────────────────────

export const DEFAULT_IMAGE3_OVERLAY = defaultCarouselImagePrompts.image3.overlay;

export const DEFAULT_IMAGE3_STATIC_STYLE = img3.staticStyle;

export const DEFAULT_IMAGE3_SETTING = [...img3.setting];
export const DEFAULT_IMAGE3_OUTFIT = [...img3.outfit];
export const DEFAULT_IMAGE3_MOOD = [...img3.mood];
export const DEFAULT_IMAGE3_LIGHTING = [...img3.lighting];

// ── Prompt builders ──────────────────────────────────────────────

const IMAGE1_INSTRUCTION =
  'Generate one cohesive photorealistic image in vertical 9:16 framing. ' +
  'Follow the JSON scene specification below exactly—every field is mandatory. ' +
  'Interpret subject, hair, outfit, setting, lighting, camera, extras, and staticStyle as one unified photograph, not a list of unrelated ideas.';

const IMAGE2_INSTRUCTION =
  'Generate one cohesive photorealistic image in vertical 9:16 framing. ' +
  'This is "Day 7" — the SAME woman from the reference photo, one week after a breakup. ' +
  'She looks slightly better but still a bit fragile. ' +
  'Match her face, hair color, and general appearance from the reference image exactly. ' +
  'Follow the JSON scene specification below exactly.';

const IMAGE3_INSTRUCTION =
  'Generate one cohesive photorealistic image in vertical 9:16 framing. ' +
  'This is "Day 100" — the SAME woman from the reference photo, fully glowed up after a breakup. ' +
  'She is confident, radiant, and thriving. ' +
  'Match her face and hair color from the reference image but everything else should be elevated. ' +
  'Follow the JSON scene specification below exactly.';

function buildJsonBlock(instruction, scene) {
  const spec = { schemaVersion: 1, scene };
  const json = JSON.stringify(spec, null, 2);
  return `${instruction}\n\n\`\`\`json\n${json}\n\`\`\``;
}

export function generateImage1Prompt(config) {
  const segments = {
    subject: pick(config?.subject ?? DEFAULT_IMAGE1_SUBJECT),
    hair: pick(config?.hair ?? DEFAULT_IMAGE1_HAIR),
    outfit: pick(config?.outfit ?? DEFAULT_IMAGE1_OUTFIT),
    setting: pick(config?.setting ?? DEFAULT_IMAGE1_SETTING),
    lighting: pick(config?.lighting ?? DEFAULT_IMAGE1_LIGHTING),
    camera: pick(config?.camera ?? DEFAULT_IMAGE1_CAMERA),
    extras: pick(config?.extras ?? DEFAULT_IMAGE1_EXTRAS),
    staticStyle: config?.staticStyle ?? DEFAULT_IMAGE1_STATIC_STYLE,
  };
  return { prompt: buildJsonBlock(IMAGE1_INSTRUCTION, segments), segments };
}

export function generateImage2Prompt(config) {
  const segments = {
    setting: pick(config?.setting ?? DEFAULT_IMAGE2_SETTING),
    mood: pick(config?.mood ?? DEFAULT_IMAGE2_MOOD),
    outfit: pick(config?.outfit ?? DEFAULT_IMAGE2_OUTFIT),
    lighting: pick(config?.lighting ?? DEFAULT_IMAGE2_LIGHTING),
    staticStyle: config?.staticStyle ?? DEFAULT_IMAGE2_STATIC_STYLE,
  };
  return { prompt: buildJsonBlock(IMAGE2_INSTRUCTION, segments), segments };
}

export function generateImage3Prompt(config) {
  const segments = {
    setting: pick(config?.setting ?? DEFAULT_IMAGE3_SETTING),
    outfit: pick(config?.outfit ?? DEFAULT_IMAGE3_OUTFIT),
    mood: pick(config?.mood ?? DEFAULT_IMAGE3_MOOD),
    lighting: pick(config?.lighting ?? DEFAULT_IMAGE3_LIGHTING),
    staticStyle: config?.staticStyle ?? DEFAULT_IMAGE3_STATIC_STYLE,
  };
  return { prompt: buildJsonBlock(IMAGE3_INSTRUCTION, segments), segments };
}

export const generateImagePrompt = generateImage1Prompt;

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
