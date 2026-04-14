import { useState } from 'react';

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
}) {
  if (!open) return null;

  const TAB_MAP = {
    image1: { config: img1Config, setConfig: setImg1Config, overlay: img1Overlay, setOverlay: setImg1Overlay, categories: IMAGE1_CATEGORIES, label: 'Day 1' },
    image2: { config: img2Config, setConfig: setImg2Config, overlay: img2Overlay, setOverlay: setImg2Overlay, categories: IMAGE23_CATEGORIES, label: 'Day 7' },
    image3: { config: img3Config, setConfig: setImg3Config, overlay: img3Overlay, setOverlay: setImg3Overlay, categories: IMAGE23_CATEGORIES, label: 'Day 100' },
  };

  const current = TAB_MAP[activeTab] ?? TAB_MAP.image1;

  function updateCategory(key, newItems) {
    current.setConfig((prev) => ({ ...prev, [key]: newItems }));
  }

  return (
    <div className="ep-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ep-panel">
        <div className="ep-header">
          <h2 className="ep-title">Edit prompts</h2>
          <button className="ep-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="ep-tabs">
          {Object.entries(TAB_MAP).map(([key, { label }]) => (
            <button
              key={key}
              className={`ep-tab ${activeTab === key ? 'ep-tab-active' : ''}`}
              onClick={() => onTabChange(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="ep-body">
          <section className="ep-section">
            <h3 className="ep-section-label">Static style (always appended)</h3>
            <textarea
              className="ep-static-textarea"
              value={current.config.staticStyle}
              onChange={(e) =>
                current.setConfig((prev) => ({ ...prev, staticStyle: e.target.value }))
              }
              rows={4}
            />
          </section>

          <section className="ep-section">
            <h3 className="ep-section-label">Random options (one picked per generation)</h3>
            <div className="ep-categories">
              {current.categories.map(({ key, label }) => (
                <CategoryPanel
                  key={`${activeTab}-${key}`}
                  label={label}
                  items={current.config[key]}
                  onChange={(newItems) => updateCategory(key, newItems)}
                />
              ))}
            </div>
          </section>

          <section className="ep-section">
            <h3 className="ep-section-label">Text overlay</h3>
            <input
              className="ep-overlay-input"
              value={current.overlay}
              onChange={(e) => current.setOverlay(e.target.value)}
              placeholder="Overlay text on the image…"
            />
          </section>
        </div>

        <div className="ep-footer">
          <button type="button" className="ep-done-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
