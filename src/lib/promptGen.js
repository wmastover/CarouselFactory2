function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Image 1 defaults (Day 1: breakup) ────────────────────────────

export const DEFAULT_IMAGE1_OVERLAY = 'Day 1';

export const DEFAULT_IMAGE1_STATIC_STYLE =
  'dark hair, sexy neutral expression, not smiling, lips slightly parted, ' +
  'black or dark clothing showing some cleavage, ' +
  'front camera selfie, very close crop on face and chest, ' +
  'night time, warm dim indoor light, ' +
  'realistic iphone photo, slightly grainy, no retouching, natural skin';

export const DEFAULT_IMAGE1_SUBJECT = [
  'attractive young woman in her early 20s',
  'young brunette woman with sharp features',
  'confident young woman',
  'striking young woman in her 20s',
];

export const DEFAULT_IMAGE1_HAIR = [
  'long dark brown hair spread out',
  'voluminous wavy dark hair',
  'straight dark hair loosely framing face',
  'tousled dark brunette hair, slightly messy',
];

export const DEFAULT_IMAGE1_OUTFIT = [
  'black corset top',
  'black bralette, straps visible',
  'tight black low-cut top',
  'black bodysuit with thin straps, showing off some cleavage',
  'black crop top, slightly off shoulder',
];

export const DEFAULT_IMAGE1_SETTING = [
  'lying in bed at night, rumpled sheets, dim warm lamp glow',
  'in the passenger seat of a car at night, window behind',
  'in the back seat of a car at night, window behind',
  'lying back on a bed, phone held above, looking up into camera',
  'in a dimly lit bedroom, lying sideways on pillow',
  'in the back seat of a car at night, city lights softly blurred outside',
];

export const DEFAULT_IMAGE1_LIGHTING = [
  'warm dim bedside lamp, soft shadows',
  'low warm ambient light, slightly underexposed',
  'dim yellow room light, natural night feel',
  'soft warm glow from off-screen lamp, mostly dark background',
];

export const DEFAULT_IMAGE1_CAMERA = [
  'selfie held above looking down, slightly tilted',
  'front camera selfie, very close, candid',
  'selfie angle from slightly above, face and chest filling frame',
  'close front camera crop, slightly grainy, spontaneous',
];

export const DEFAULT_IMAGE1_EXTRAS = [
  'glossy nude lip, heavy lashes, dewy skin',
  'smoky eye, glossy lip',
  'minimal makeup, glossy lip, looking directly into lens',
  'heavy lashes, matte skin',
];

// ── Image 2 defaults (Day 7: slightly better) ────────────────────

export const DEFAULT_IMAGE2_OVERLAY = 'Day 7';

export const DEFAULT_IMAGE2_STATIC_STYLE =
  'same woman from the reference photo, slightly more put-together, ' +
  'neutral expression with a hint of calm, not smiling, ' +
  'realistic iphone photo, slightly grainy, no retouching, natural skin, ' +
  'front camera selfie, close crop on face and chest, vertical 9:16';

export const DEFAULT_IMAGE2_SETTING = [
  'sitting by a window in the morning, soft natural light coming in',
  'on a couch with a blanket, cup of coffee in hand, daytime',
  'standing in front of a bathroom mirror, morning light',
  'sitting in a café alone, window light on face',
  'leaning against a doorframe at home, warm afternoon light',
];

export const DEFAULT_IMAGE2_MOOD = [
  'still fragile but starting to pull herself together',
  'quietly healing, calm but guarded',
  'slightly better, a flicker of life returning',
  'pensive but no longer crying, soft determination',
  'the first day she felt okay waking up',
];

export const DEFAULT_IMAGE2_OUTFIT = [
  'oversized grey hoodie, hair loosely tied back',
  'simple white t-shirt, hair down, minimal effort',
  'cozy knit sweater, comfortable but cleaner',
  'casual denim jacket over a plain top',
  'soft cardigan, understated but presentable',
];

export const DEFAULT_IMAGE2_LIGHTING = [
  'soft morning window light, gentle and warm',
  'natural daylight, slightly overcast feel',
  'warm golden afternoon light filtering in',
  'even indoor lighting, daytime ambiance',
];

// ── Image 3 defaults (Day 100: glow up) ──────────────────────────

export const DEFAULT_IMAGE3_OVERLAY = 'Day 100';

export const DEFAULT_IMAGE3_STATIC_STYLE =
  'same woman from the reference photo but fully glowed up, ' +
  'confident radiant expression, slight smirk or soft smile, ' +
  'glamorous but natural, perfect lighting, ' +
  'realistic iphone photo, high quality, vertical 9:16';

export const DEFAULT_IMAGE3_SETTING = [
  'rooftop bar at golden hour, city skyline blurred behind',
  'getting ready in a well-lit vanity mirror, fairy lights',
  'at a restaurant table, candlelight and bokeh, night out',
  'walking down a city street at night, neon reflections',
  'in the back of an uber, city lights streaking through window',
  'at a club or lounge, moody coloured lighting',
];

export const DEFAULT_IMAGE3_OUTFIT = [
  'sleek black dress, gold jewelry, hair styled',
  'fitted red top, statement earrings, lips done',
  'silk cami top, delicate necklace, hair voluminous and styled',
  'off-shoulder bodycon dress, smoky eye, confident pose',
  'leather jacket over a going-out top, effortlessly hot',
];

export const DEFAULT_IMAGE3_MOOD = [
  'thriving, radiating confidence, completely over it',
  'that girl energy, unbothered and glowing',
  'main character moment, she won the breakup',
  'confident and magnetic, like she forgot he existed',
  'living her best life, zero regrets',
];

export const DEFAULT_IMAGE3_LIGHTING = [
  'golden hour glow, warm and flattering',
  'moody ambient lighting with warm highlights',
  'soft ring-light effect, even and glowing',
  'dramatic side lighting, editorial feel',
];

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
