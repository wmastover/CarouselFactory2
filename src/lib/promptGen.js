function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Overlay text ─────────────────────────────────────────────────
export const DEFAULT_IMAGE1_OVERLAY = 'day 1 no contact';
export const DEFAULT_IMAGE2_OVERLAY = 'day 7 no contact';
export const DEFAULT_IMAGE3_OVERLAY = 'day 100 no contact';

// ── Image 1 — day 1 no contact / raw grief ──────────────────────

export const DEFAULT_IMAGE1_SUBJECT = [
  'attractive young woman in her early 20s',
  'young woman in her mid-20s',
  'striking young woman in her 20s',
  'pretty young woman with natural features',
];

export const DEFAULT_IMAGE1_SETTING = [
  'lying curled up in bed, wearing an oversized dark navy hoodie with the hood half-up and grey sweatpants, looking blankly down at her phone with a withdrawn expression — zero eye contact with camera. The bedding is a muted terracotta duvet on white sheets. A single window lets in flat cool grey natural light',
  'lying on her side in bed, wearing a washed-black oversized hoodie, grey sweatpants, hood pulled all the way up. One arm hugs a pillow. The bedding is a dusty sage green comforter on white sheets. Flat cool grey daylight from a nearby window',
  'curled up in bed, wearing a charcoal oversized sweatshirt and loose joggers. Her face is turned slightly down, phone face-down beside her, not looking at camera. The bedding is a warm grey duvet on cream sheets. Cool flat window light from the side',
  'lying in bed, wearing a dark olive oversized hoodie, hood up, arms pulled inside the sleeves. Staring blankly downward, not at camera. The bedding is a muted dusty rose duvet. A single window behind her casts flat cool grey morning light',
  'curled up small on a bed near the wall, wearing an oversized dark charcoal hoodie and sweatpants. One knee pulled to chest. Looking down at her phone with a blank hollow expression, zero eye contact. Muted terracotta bedding, flat cool grey light from the window',
];

export const DEFAULT_IMAGE1_STATIC_STYLE =
  'messy unstyled hair falling across the pillow, no makeup, bare skin, ' +
  'white walls, melancholic and stagnant mood, ' +
  'muted earth tone color palette — cream, grey, terracotta or sage, navy or charcoal, ' +
  'soft film grain, slightly desaturated color grading, ' +
  'realistic iPhone photo style, not polished or staged, 9:16 vertical portrait, slightly elevated angle';

export function generateImage1Prompt(config) {
  const staticStyle = config?.staticStyle ?? DEFAULT_IMAGE1_STATIC_STYLE;
  const segments = {
    subject: pick(config?.subject ?? DEFAULT_IMAGE1_SUBJECT),
    setting: pick(config?.setting ?? DEFAULT_IMAGE1_SETTING),
    staticStyle,
  };

  const prompt = [segments.subject, segments.setting, segments.staticStyle]
    .filter(Boolean)
    .join('. ');

  return { prompt, segments };
}

// Legacy stubs for backwards compatibility
export const DEFAULT_IMAGE1_HAIR = [];
export const DEFAULT_IMAGE1_OUTFIT = [];
export const DEFAULT_IMAGE1_LIGHTING = [];
export const DEFAULT_IMAGE1_CAMERA = [];
export const DEFAULT_IMAGE1_EXTRAS = [];

// ── Image 2 — day 7 no contact / functional sadness ──────────────
// Character consistency comes from the row 1 reference image;
// prompts describe the mood/situation shift only.

export const DEFAULT_IMAGE2_SETTING = [
  'sitting cross-legged on her bed wearing a cozy patterned robe, hair pulled back in a loose low bun. She has a white sheet face mask on and is looking down at an open journal in her lap, pen in hand, writing slowly. A mug of tea sits beside her on the bed',
  'sitting upright on her bed in an oversized soft cardigan in warm cream tones, hair clipped back loosely. She is holding a mug of tea with both hands, looking down at it with a calm focused expression. A small lit candle on the nightstand beside her',
  'seated on her bed in a soft knit matching set in warm beige, hair in a low bun. She has a clay face mask on and is scrolling her phone with a quiet, unbothered expression. A notebook and pen are open beside her, a candle burning nearby',
  'sitting cross-legged on her bed in a fluffy oversized robe, hair in a messy clip. She is looking down at a journal, pen hovering over the page, mid-thought. A dog is curled up asleep next to her. Warm lamplight from the bedside table',
  'seated on her bed in a soft cardigan, hair pulled back, minimal natural moisturizer on her skin — no full mask but visibly doing a skincare routine. She holds a small bottle of serum, looking down at it with a calm, introspective expression. Tea on the nightstand',
];

export const DEFAULT_IMAGE2_MOOD = [
  'expression is calm and focused, present in the moment, quietly investing in herself',
  'quietly introspective, not sad but clearly still processing something internally',
  'a small, tentative half-smile — not fully there yet, but something is shifting',
  'serene and still, looking down with soft eyes, like she is gently figuring things out',
  'composed and intentional, the kind of calm that comes from deciding to take care of yourself',
];

export const DEFAULT_IMAGE2_STATIC_STYLE =
  'warm golden bedside lamp light creating a soft glow, tidy bedroom background with neutral curtains, ' +
  'realistic casual photo, slightly grainy, no retouching, natural skin, ' +
  '9:16 portrait, candid unposed feel, warm beige and cream color palette, ' +
  'same woman as the reference image';

export function generateImage2Prompt(config) {
  const staticStyle = config?.staticStyle ?? DEFAULT_IMAGE2_STATIC_STYLE;
  const segments = {
    setting: pick(config?.setting ?? DEFAULT_IMAGE2_SETTING),
    mood: pick(config?.mood ?? DEFAULT_IMAGE2_MOOD),
    staticStyle,
  };

  const prompt = [segments.setting, segments.mood, segments.staticStyle]
    .filter(Boolean)
    .join('. ');

  return { prompt, segments };
}

// Legacy arrays kept for backwards compatibility
export const DEFAULT_IMAGE2_OUTFIT = ['clean casual clothes'];
export const DEFAULT_IMAGE2_LIGHTING = ['soft natural daylight'];

// ── Image 3 — day 100 no contact / glow-up celebration ───────────
// Character consistency comes from the row 1 reference image.

export const DEFAULT_IMAGE3_SETTING = [
  'standing confidently in a modern white-walled space, gold "100" balloons slightly out of focus in the background. Bright warm overhead lighting. Her hair is long, sleek, and straight with laid edges. Bold thick gold chain necklace',
  'standing in front of a clean white wall, a birthday-style cake with lit candles on a table beside her, gold confetti catching the light. Her hair is voluminous blown-out waves. Layered gold necklaces',
  'standing at a full-length mirror in a bright white room, gold "100" balloons and gold streamers visible behind her in the reflection. Her hair is defined and voluminous. A chunky silver chain necklace',
  'standing in a bright modern kitchen, a cake with "100" candles on the counter beside her, warm light overhead. Her hair is long and styled with big voluminous curls. Gold hoop earrings and a gold necklace',
  'standing in a clean well-lit room, gold "100" number balloons floating slightly out of focus behind her. Her hair is slicked back sleek and glossy. A statement gold chain necklace and gold earrings',
];

export const DEFAULT_IMAGE3_MOOD = [
  'looking directly into the camera with a wide genuine smile showing teeth, one hand resting on her hip',
  'looking directly into the camera with a beaming full smile, one hand lightly touching her necklace',
  'direct full eye contact with the camera, laughing openly, head slightly tilted back, arms relaxed',
  'staring straight into the camera with a confident radiant smile, one hand raised slightly as if celebrating',
  'direct eye contact, glowing smile showing teeth, both hands relaxed at her sides — completely unbothered and thriving',
];

export const DEFAULT_IMAGE3_STATIC_STYLE =
  'form-fitting sleek black outfit — bodysuit or sleeveless top, full glam makeup: defined brows, dramatic lashes, soft nude or pink lip, glowing skin, ' +
  'bright warm even lighting — ring light or bright overhead, high contrast black outfit against white or bright background, ' +
  'pops of gold, sharp vibrant color grading, ' +
  'realistic iphone photo style, polished but still personal, slightly grainy, ' +
  '9:16 vertical portrait, same woman as the reference image, ' +
  'clear glow-up — looks radiant, confident, completely herself';

export function generateImage3Prompt(config) {
  const staticStyle = config?.staticStyle ?? DEFAULT_IMAGE3_STATIC_STYLE;
  const segments = {
    setting: pick(config?.setting ?? DEFAULT_IMAGE3_SETTING),
    mood: pick(config?.mood ?? DEFAULT_IMAGE3_MOOD),
    staticStyle,
  };

  const prompt = [segments.setting, segments.mood, segments.staticStyle]
    .filter(Boolean)
    .join('. ');

  return { prompt, segments };
}

// Legacy arrays kept for backwards compatibility
export const DEFAULT_IMAGE3_OUTFIT = ['form-fitting sleek black outfit'];
export const DEFAULT_IMAGE3_LIGHTING = ['bright warm even lighting'];

// ── Legacy exports (kept for backwards compatibility) ────────────

export const DEFAULT_STATIC_STYLE = DEFAULT_IMAGE1_STATIC_STYLE;
export const DEFAULT_SUBJECT = DEFAULT_IMAGE1_SUBJECT;
export const DEFAULT_HAIR = DEFAULT_IMAGE1_HAIR;
export const DEFAULT_OUTFIT = DEFAULT_IMAGE1_OUTFIT;
export const DEFAULT_SETTING = DEFAULT_IMAGE1_SETTING;
export const DEFAULT_LIGHTING = DEFAULT_IMAGE1_LIGHTING;
export const DEFAULT_CAMERA = DEFAULT_IMAGE1_CAMERA;
export const DEFAULT_EXTRAS = DEFAULT_IMAGE1_EXTRAS;

export function generateImagePrompt(config) {
  return generateImage1Prompt(config);
}

// ── Text / iMessage exports (kept to avoid import errors) ────────

export const DEFAULT_STATIC_INSTRUCTION = '';
export const DEFAULT_STATIC_EXAMPLES = '';
export const DEFAULT_DYNAMIC = [];
export const DEFAULT_TWIST = [];
export const DEFAULT_TONE = [];
export const DEFAULT_OPENER_STYLE = [];

export function generateTextMetaPrompt() {
  return '';
}
