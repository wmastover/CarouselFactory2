import { useState, useRef } from 'react';
import { buildPromptPack, parsePromptPack } from '../lib/promptPack';

const IMAGE_CATEGORIES = [
  { key: 'subject', label: 'Subject' },
  { key: 'hair', label: 'Hair' },
  { key: 'outfit', label: 'Outfit' },
  { key: 'setting', label: 'Setting' },
  { key: 'lighting', label: 'Lighting' },
  { key: 'camera', label: 'Camera angle' },
  { key: 'extras', label: 'Extras' },
];

const TEXT_CATEGORIES = [
  { key: 'dynamic', label: 'Scenario' },
  { key: 'twist', label: 'Twist / ending' },
  { key: 'tone', label: 'Tone' },
  { key: 'openerStyle', label: 'Opener style' },
];

function CategoryPanel({ label, items, onChange }) {
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
      <h3 className="ep-category-label">{label}</h3>
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

export default function EditPromptsModal({
  open,
  onClose,
  activeTab,
  onTabChange,
  promptConfig,
  setPromptConfig,
  textOverlay,
  setTextOverlay,
  textPromptConfig,
  setTextPromptConfig,
  onApplyPromptPack,
}) {
  const fileInputRef = useRef(null);
  const [importError, setImportError] = useState(null);

  if (!open) return null;

  function updateImageCategory(key, newItems) {
    setPromptConfig((prev) => ({ ...prev, [key]: newItems }));
  }

  function updateTextCategory(key, newItems) {
    setTextPromptConfig((prev) => ({ ...prev, [key]: newItems }));
  }

  function handleExportPrompts() {
    setImportError(null);
    const pack = buildPromptPack({ promptConfig, textOverlay, textPromptConfig });
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
          <button
            className={`ep-tab ${activeTab === 'images' ? 'ep-tab-active' : ''}`}
            onClick={() => onTabChange('images')}
          >
            Images
          </button>
          <button
            className={`ep-tab ${activeTab === 'conversations' ? 'ep-tab-active' : ''}`}
            onClick={() => onTabChange('conversations')}
          >
            Conversations
          </button>
        </div>

        <div className="ep-body">
          {activeTab === 'images' && (
            <>
              {/* Section A — Static style */}
              <section className="ep-section">
                <h3 className="ep-section-label">Static style (always appended)</h3>
                <textarea
                  className="ep-static-textarea"
                  value={promptConfig.staticStyle}
                  onChange={(e) =>
                    setPromptConfig((prev) => ({ ...prev, staticStyle: e.target.value }))
                  }
                  rows={4}
                />
              </section>

              {/* Section B — Random categories */}
              <section className="ep-section">
                <h3 className="ep-section-label">Random options (one picked per generation)</h3>
                <div className="ep-categories">
                  {IMAGE_CATEGORIES.map(({ key, label }) => (
                    <CategoryPanel
                      key={key}
                      label={label}
                      items={promptConfig[key]}
                      onChange={(newItems) => updateImageCategory(key, newItems)}
                    />
                  ))}
                </div>
              </section>

              {/* Section C — Text overlay */}
              <section className="ep-section">
                <h3 className="ep-section-label">Text overlay</h3>
                <input
                  className="ep-overlay-input"
                  value={textOverlay}
                  onChange={(e) => setTextOverlay(e.target.value)}
                  placeholder="Overlay text on the image…"
                />
              </section>
            </>
          )}

          {activeTab === 'conversations' && (
            <>
              {/* Section A — Static instruction */}
              <section className="ep-section">
                <h3 className="ep-section-label">Static instruction (always sent)</h3>
                <textarea
                  className="ep-static-textarea"
                  value={textPromptConfig.staticInstruction}
                  onChange={(e) =>
                    setTextPromptConfig((prev) => ({ ...prev, staticInstruction: e.target.value }))
                  }
                  rows={6}
                />
              </section>

              {/* Section B — Example conversations */}
              <section className="ep-section">
                <h3 className="ep-section-label">Example conversations (style guide)</h3>
                <textarea
                  className="ep-static-textarea"
                  value={textPromptConfig.staticExamples}
                  onChange={(e) =>
                    setTextPromptConfig((prev) => ({ ...prev, staticExamples: e.target.value }))
                  }
                  rows={14}
                />
              </section>

              {/* Section C — Random categories */}
              <section className="ep-section">
                <h3 className="ep-section-label">Random options (one picked per generation)</h3>
                <div className="ep-categories">
                  {TEXT_CATEGORIES.map(({ key, label }) => (
                    <CategoryPanel
                      key={key}
                      label={label}
                      items={textPromptConfig[key]}
                      onChange={(newItems) => updateTextCategory(key, newItems)}
                    />
                  ))}
                </div>
              </section>
            </>
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
