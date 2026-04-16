import { useState, useRef, useEffect } from 'react';
import { buildPromptPack, parsePromptPack } from '../lib/promptPack';
import { DEFAULT_ENTRY_SUGGESTIONS_SYSTEM_PROMPT } from '../lib/entryGenApi';
import {
  DEFAULT_IMAGE1_SUBJECT,
  DEFAULT_IMAGE1_HAIR,
  DEFAULT_IMAGE1_OUTFIT,
  DEFAULT_IMAGE1_SETTING,
  DEFAULT_IMAGE1_LIGHTING,
  DEFAULT_IMAGE1_CAMERA,
  DEFAULT_IMAGE1_EXTRAS,
  DEFAULT_IMAGE1_STATIC_STYLE,
  DEFAULT_IMAGE1_OVERLAY,
  DEFAULT_IMAGE2_SETTING,
  DEFAULT_IMAGE2_MOOD,
  DEFAULT_IMAGE2_OUTFIT,
  DEFAULT_IMAGE2_LIGHTING,
  DEFAULT_IMAGE2_STATIC_STYLE,
  DEFAULT_IMAGE2_OVERLAY,
  DEFAULT_IMAGE3_SETTING,
  DEFAULT_IMAGE3_OUTFIT,
  DEFAULT_IMAGE3_MOOD,
  DEFAULT_IMAGE3_LIGHTING,
  DEFAULT_IMAGE3_STATIC_STYLE,
  DEFAULT_IMAGE3_OVERLAY,
  DEFAULT_STATIC_INSTRUCTION,
  DEFAULT_STATIC_EXAMPLES,
  DEFAULT_DYNAMIC,
  DEFAULT_TWIST,
  DEFAULT_TONE,
  DEFAULT_OPENER_STYLE,
} from '../lib/promptGen';

const IMAGE1_CATEGORIES = [
  { key: 'subject', label: 'Subject' },
  { key: 'hair', label: 'Hair' },
  { key: 'outfit', label: 'Outfit' },
  { key: 'setting', label: 'Setting' },
  { key: 'lighting', label: 'Lighting' },
  { key: 'camera', label: 'Camera angle' },
  { key: 'extras', label: 'Extras' },
];

const IMAGE23_CATEGORIES = [
  { key: 'outfit', label: 'Outfit' },
  { key: 'setting', label: 'Setting' },
  { key: 'mood', label: 'Mood' },
  { key: 'lighting', label: 'Lighting' },
];

const IMAGE1_DEFAULTS_BY_KEY = {
  subject: DEFAULT_IMAGE1_SUBJECT,
  hair: DEFAULT_IMAGE1_HAIR,
  outfit: DEFAULT_IMAGE1_OUTFIT,
  setting: DEFAULT_IMAGE1_SETTING,
  lighting: DEFAULT_IMAGE1_LIGHTING,
  camera: DEFAULT_IMAGE1_CAMERA,
  extras: DEFAULT_IMAGE1_EXTRAS,
};

const IMAGE23_DEFAULTS_BY_KEY = {
  outfit: DEFAULT_IMAGE2_OUTFIT,
  setting: DEFAULT_IMAGE2_SETTING,
  mood: DEFAULT_IMAGE2_MOOD,
  lighting: DEFAULT_IMAGE2_LIGHTING,
};

const IMAGE23_DEFAULTS_BY_KEY_IMG3 = {
  outfit: DEFAULT_IMAGE3_OUTFIT,
  setting: DEFAULT_IMAGE3_SETTING,
  mood: DEFAULT_IMAGE3_MOOD,
  lighting: DEFAULT_IMAGE3_LIGHTING,
};

const TEXT_DEFAULTS_BY_KEY = {
  dynamic: DEFAULT_DYNAMIC,
  twist: DEFAULT_TWIST,
  tone: DEFAULT_TONE,
  openerStyle: DEFAULT_OPENER_STYLE,
};

const TEXT_CATEGORIES = [
  { key: 'dynamic', label: 'Scenario' },
  { key: 'twist', label: 'Twist / ending' },
  { key: 'tone', label: 'Tone' },
  { key: 'openerStyle', label: 'Opener style' },
];

function CategoryPanel({ label, items, onChange, defaultItems }) {
  const [draft, setDraft] = useState('');

  function updateItem(idx, value) {
    const next = items.slice();
    next[idx] = value;
    onChange(next);
  }

  function removeItem(idx) {
    onChange(items.filter((_, i) => i !== idx));
  }

  function addItem() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setDraft('');
  }

  return (
    <div className="ep-category">
      <div className="ep-category-header">
        <h3 className="ep-category-label">{label}</h3>
        {defaultItems && (
          <button
            type="button"
            className="ep-reset-default-btn"
            onClick={() => onChange([...defaultItems])}
          >
            Reset to default
          </button>
        )}
      </div>
      <ul className="ep-option-list">
        {items.map((item, idx) => (
          <li key={idx} className="ep-option-row">
            <input
              className="ep-option-input"
              value={item}
              onChange={(e) => updateItem(idx, e.target.value)}
            />
            <button
              className="ep-option-remove"
              onClick={() => removeItem(idx)}
              title="Remove"
              disabled={items.length <= 1}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <div className="ep-add-row">
        <input
          className="ep-add-input"
          placeholder={`Add ${label.toLowerCase()} option…`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
        />
        <button className="ep-add-btn" onClick={addItem} disabled={!draft.trim()}>
          Add
        </button>
      </div>
    </div>
  );
}

const TAB_LABELS = [
  { key: 'image1', label: 'Day 1' },
  { key: 'image2', label: 'Day 7' },
  { key: 'image3', label: 'Day 100' },
  { key: 'conversations', label: 'Conversations' },
  { key: 'entries', label: 'Entries' },
];

export default function EditPromptsModal({
  open,
  onClose,
  activeTab,
  onTabChange,
  img1Config,
  setImg1Config,
  img1Overlay,
  setImg1Overlay,
  img2Config,
  setImg2Config,
  img2Overlay,
  setImg2Overlay,
  img3Config,
  setImg3Config,
  img3Overlay,
  setImg3Overlay,
  textPromptConfig,
  setTextPromptConfig,
  entryPromptConfig,
  setEntryPromptConfig,
  onApplyPromptPack,
  onResetAllPrompts,
}) {
  const fileInputRef = useRef(null);
  const [importError, setImportError] = useState(null);
  const [resetAllPending, setResetAllPending] = useState(false);

  useEffect(() => {
    if (!open) setResetAllPending(false);
  }, [open]);

  if (!open) return null;

  const TAB_MAP = {
    image1: {
      config: img1Config,
      setConfig: setImg1Config,
      overlay: img1Overlay,
      setOverlay: setImg1Overlay,
      categories: IMAGE1_CATEGORIES,
      defaultsByKey: IMAGE1_DEFAULTS_BY_KEY,
      defaultStatic: DEFAULT_IMAGE1_STATIC_STYLE,
      defaultOverlay: DEFAULT_IMAGE1_OVERLAY,
    },
    image2: {
      config: img2Config,
      setConfig: setImg2Config,
      overlay: img2Overlay,
      setOverlay: setImg2Overlay,
      categories: IMAGE23_CATEGORIES,
      defaultsByKey: IMAGE23_DEFAULTS_BY_KEY,
      defaultStatic: DEFAULT_IMAGE2_STATIC_STYLE,
      defaultOverlay: DEFAULT_IMAGE2_OVERLAY,
    },
    image3: {
      config: img3Config,
      setConfig: setImg3Config,
      overlay: img3Overlay,
      setOverlay: setImg3Overlay,
      categories: IMAGE23_CATEGORIES,
      defaultsByKey: IMAGE23_DEFAULTS_BY_KEY_IMG3,
      defaultStatic: DEFAULT_IMAGE3_STATIC_STYLE,
      defaultOverlay: DEFAULT_IMAGE3_OVERLAY,
    },
  };

  const currentImage = TAB_MAP[activeTab];

  function updateImageCategory(key, newItems) {
    if (!currentImage) return;
    currentImage.setConfig((prev) => ({ ...prev, [key]: newItems }));
  }

  function updateTextCategory(key, newItems) {
    setTextPromptConfig((prev) => ({ ...prev, [key]: newItems }));
  }

  function handleExportPrompts() {
    setImportError(null);
    const pack = buildPromptPack({
      img1Config,
      img1Overlay,
      img2Config,
      img2Overlay,
      img3Config,
      img3Overlay,
      textPromptConfig,
      entryPromptConfig,
    });
    const json = JSON.stringify(pack, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'carousel-factory-prompts.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportPick() {
    setImportError(null);
    fileInputRef.current?.click();
  }

  async function handleImportFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const result = parsePromptPack(text);
      if (!result.ok) {
        setImportError(result.error);
        return;
      }
      onApplyPromptPack(result.data);
      setImportError(null);
    } catch {
      setImportError('Could not read file');
    }
  }

  return (
    <div className="ep-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ep-panel">
        <div className="ep-header">
          <h2 className="ep-title">Edit prompts</h2>
          <button className="ep-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="ep-tabs">
          {TAB_LABELS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`ep-tab ${activeTab === key ? 'ep-tab-active' : ''}`}
              onClick={() => onTabChange(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="ep-body">
          {currentImage && (
            <>
              <section className="ep-section">
                <div className="ep-section-heading">
                  <h3 className="ep-section-label">Static style (always appended)</h3>
                  <button
                    type="button"
                    className="ep-reset-default-btn"
                    onClick={() =>
                      currentImage.setConfig((prev) => ({ ...prev, staticStyle: currentImage.defaultStatic }))
                    }
                  >
                    Reset to default
                  </button>
                </div>
                <textarea
                  className="ep-static-textarea"
                  value={currentImage.config.staticStyle}
                  onChange={(e) =>
                    currentImage.setConfig((prev) => ({ ...prev, staticStyle: e.target.value }))
                  }
                  rows={4}
                />
              </section>

              <section className="ep-section">
                <h3 className="ep-section-label">Random options (one picked per generation)</h3>
                <div className="ep-categories">
                  {currentImage.categories.map(({ key, label }) => (
                    <CategoryPanel
                      key={`${activeTab}-${key}`}
                      label={label}
                      items={currentImage.config[key]}
                      onChange={(newItems) => updateImageCategory(key, newItems)}
                      defaultItems={currentImage.defaultsByKey[key]}
                    />
                  ))}
                </div>
              </section>

              <section className="ep-section">
                <div className="ep-section-heading">
                  <h3 className="ep-section-label">Text overlay</h3>
                  <button
                    type="button"
                    className="ep-reset-default-btn"
                    onClick={() => currentImage.setOverlay(currentImage.defaultOverlay)}
                  >
                    Reset to default
                  </button>
                </div>
                <input
                  className="ep-overlay-input"
                  value={currentImage.overlay}
                  onChange={(e) => currentImage.setOverlay(e.target.value)}
                  placeholder="Overlay text on the image…"
                />
              </section>
            </>
          )}

          {activeTab === 'conversations' && (
            <>
              <section className="ep-section">
                <div className="ep-section-heading">
                  <h3 className="ep-section-label">Static instruction (always sent)</h3>
                  <button
                    type="button"
                    className="ep-reset-default-btn"
                    onClick={() =>
                      setTextPromptConfig((prev) => ({
                        ...prev,
                        staticInstruction: DEFAULT_STATIC_INSTRUCTION,
                      }))
                    }
                  >
                    Reset to default
                  </button>
                </div>
                <textarea
                  className="ep-static-textarea"
                  value={textPromptConfig.staticInstruction}
                  onChange={(e) =>
                    setTextPromptConfig((prev) => ({ ...prev, staticInstruction: e.target.value }))
                  }
                  rows={6}
                />
              </section>

              <section className="ep-section">
                <div className="ep-section-heading">
                  <h3 className="ep-section-label">Example conversations (style guide)</h3>
                  <button
                    type="button"
                    className="ep-reset-default-btn"
                    onClick={() =>
                      setTextPromptConfig((prev) => ({
                        ...prev,
                        staticExamples: DEFAULT_STATIC_EXAMPLES,
                      }))
                    }
                  >
                    Reset to default
                  </button>
                </div>
                <textarea
                  className="ep-static-textarea"
                  value={textPromptConfig.staticExamples}
                  onChange={(e) =>
                    setTextPromptConfig((prev) => ({ ...prev, staticExamples: e.target.value }))
                  }
                  rows={14}
                />
              </section>

              <section className="ep-section">
                <h3 className="ep-section-label">Random options (one picked per generation)</h3>
                <div className="ep-categories">
                  {TEXT_CATEGORIES.map(({ key, label }) => (
                    <CategoryPanel
                      key={key}
                      label={label}
                      items={textPromptConfig[key]}
                      onChange={(newItems) => updateTextCategory(key, newItems)}
                      defaultItems={TEXT_DEFAULTS_BY_KEY[key]}
                    />
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === 'entries' && (
            <section className="ep-section">
              <div className="ep-section-heading">
                <h3 className="ep-section-label">Entry generation (system prompt)</h3>
                <button
                  type="button"
                  className="ep-reset-default-btn"
                  onClick={() =>
                    setEntryPromptConfig({ systemPrompt: DEFAULT_ENTRY_SUGGESTIONS_SYSTEM_PROMPT })
                  }
                >
                  Reset to default
                </button>
              </div>
              <p className="ep-section-hint">
                Used when you select a Day 100 image: the model writes three short journal entry
                suggestions for the Entries row — casual, first-person, emotionally real.
              </p>
              <textarea
                className="ep-static-textarea"
                value={entryPromptConfig.systemPrompt}
                onChange={(e) =>
                  setEntryPromptConfig((prev) => ({ ...prev, systemPrompt: e.target.value }))
                }
                rows={18}
                spellCheck={false}
              />
            </section>
          )}
        </div>

        <div className="ep-footer ep-footer-with-transfer">
          <div className="ep-footer-row">
            <div className="ep-footer-actions">
              <button type="button" className="ep-transfer-btn" onClick={handleExportPrompts}>
                Export prompts
              </button>
              <button type="button" className="ep-transfer-btn" onClick={handleImportPick}>
                Import prompts
              </button>
              <button
                type="button"
                className="ep-transfer-btn"
                onClick={() => {
                  setImportError(null);
                  setResetAllPending(true);
                }}
                disabled={resetAllPending}
              >
                Reset all to defaults
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="ep-import-input"
                onChange={handleImportFile}
                aria-hidden
                tabIndex={-1}
              />
            </div>
            <button type="button" className="ep-done-btn" onClick={onClose}>
              Done
            </button>
          </div>
          {resetAllPending && (
            <div
              className="ep-reset-all-confirm"
              role="group"
              aria-label="Confirm reset all prompts"
            >
              <p className="ep-reset-all-confirm-msg">
                Replace every prompt and overlay with the built-in defaults? Your current edits will
                be lost.
              </p>
              <div className="ep-reset-all-confirm-actions">
                <button
                  type="button"
                  className="ep-transfer-btn"
                  onClick={() => setResetAllPending(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="ep-reset-all-confirm-danger"
                  onClick={() => {
                    onResetAllPrompts();
                    setResetAllPending(false);
                  }}
                >
                  Reset everything
                </button>
              </div>
            </div>
          )}
          {importError && (
            <p className="ep-import-error" role="alert">
              {importError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
