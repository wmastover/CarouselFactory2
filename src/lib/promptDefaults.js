import {
  DEFAULT_IMAGE1_OVERLAY,
  DEFAULT_IMAGE2_OVERLAY,
  DEFAULT_IMAGE3_OVERLAY,
  DEFAULT_IMAGE1_SUBJECT,
  DEFAULT_IMAGE1_HAIR,
  DEFAULT_IMAGE1_OUTFIT,
  DEFAULT_IMAGE1_SETTING,
  DEFAULT_IMAGE1_LIGHTING,
  DEFAULT_IMAGE1_CAMERA,
  DEFAULT_IMAGE1_EXTRAS,
  DEFAULT_IMAGE1_STATIC_STYLE,
  DEFAULT_IMAGE2_SETTING,
  DEFAULT_IMAGE2_MOOD,
  DEFAULT_IMAGE2_OUTFIT,
  DEFAULT_IMAGE2_LIGHTING,
  DEFAULT_IMAGE2_STATIC_STYLE,
  DEFAULT_IMAGE3_SETTING,
  DEFAULT_IMAGE3_OUTFIT,
  DEFAULT_IMAGE3_MOOD,
  DEFAULT_IMAGE3_LIGHTING,
  DEFAULT_IMAGE3_STATIC_STYLE,
  DEFAULT_STATIC_INSTRUCTION,
  DEFAULT_STATIC_EXAMPLES,
  DEFAULT_DYNAMIC,
  DEFAULT_TWIST,
  DEFAULT_TONE,
  DEFAULT_OPENER_STYLE,
} from './promptGen';
import { DEFAULT_ENTRY_SUGGESTIONS_SYSTEM_PROMPT } from './entryGenApi';

export function getDefaultImg1Config() {
  return {
    staticStyle: DEFAULT_IMAGE1_STATIC_STYLE,
    subject: [...DEFAULT_IMAGE1_SUBJECT],
    hair: [...DEFAULT_IMAGE1_HAIR],
    outfit: [...DEFAULT_IMAGE1_OUTFIT],
    setting: [...DEFAULT_IMAGE1_SETTING],
    lighting: [...DEFAULT_IMAGE1_LIGHTING],
    camera: [...DEFAULT_IMAGE1_CAMERA],
    extras: [...DEFAULT_IMAGE1_EXTRAS],
  };
}

export function getDefaultImg2Config() {
  return {
    staticStyle: DEFAULT_IMAGE2_STATIC_STYLE,
    setting: [...DEFAULT_IMAGE2_SETTING],
    mood: [...DEFAULT_IMAGE2_MOOD],
    outfit: [...DEFAULT_IMAGE2_OUTFIT],
    lighting: [...DEFAULT_IMAGE2_LIGHTING],
  };
}

export function getDefaultImg3Config() {
  return {
    staticStyle: DEFAULT_IMAGE3_STATIC_STYLE,
    setting: [...DEFAULT_IMAGE3_SETTING],
    outfit: [...DEFAULT_IMAGE3_OUTFIT],
    mood: [...DEFAULT_IMAGE3_MOOD],
    lighting: [...DEFAULT_IMAGE3_LIGHTING],
  };
}

export function getDefaultTextPromptConfig() {
  return {
    staticInstruction: DEFAULT_STATIC_INSTRUCTION,
    staticExamples: DEFAULT_STATIC_EXAMPLES,
    dynamic: [...DEFAULT_DYNAMIC],
    twist: [...DEFAULT_TWIST],
    tone: [...DEFAULT_TONE],
    openerStyle: [...DEFAULT_OPENER_STYLE],
  };
}

export function getDefaultEntryPromptConfig() {
  return { systemPrompt: DEFAULT_ENTRY_SUGGESTIONS_SYSTEM_PROMPT };
}

/** Full prompt surface as on first load (deep copies). */
export function getFreshDefaultPromptState() {
  return {
    img1Config: getDefaultImg1Config(),
    img1Overlay: DEFAULT_IMAGE1_OVERLAY,
    img2Config: getDefaultImg2Config(),
    img2Overlay: DEFAULT_IMAGE2_OVERLAY,
    img3Config: getDefaultImg3Config(),
    img3Overlay: DEFAULT_IMAGE3_OVERLAY,
    textPromptConfig: getDefaultTextPromptConfig(),
    entryPromptConfig: getDefaultEntryPromptConfig(),
  };
}
