import { useState } from 'react';

const IMAGE1_CATEGORIES = [
  { key: 'subject', label: 'Subject' },
  { key: 'setting', label: 'Setting' },
];

const IMAGE2_CATEGORIES = [
  { key: 'setting', label: 'Setting' },
  { key: 'mood', label: 'Mood / expression' },
];

const IMAGE3_CATEGORIES = [
  { key: 'setting', label: 'Setting' },
  { key: 'mood', label: 'Mood / expression' },
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

function ImageTab({ config, setConfig, overlay, setOverlay, categories }) {
  function updateCategory(key, newItems) {
    setConfig((prev) => ({ ...prev, [key]: newItems }));
  }

  return (
    <>
      <section className="ep-section">
        <h3 className="ep-section-label">Static style (always appended)</h3>
        <textarea
          className="ep-static-textarea"
          value={config.staticStyle ?? ''}
          onChange={(e) => setConfig((prev) => ({ ...prev, staticStyle: e.target.value }))}
          rows={4}
        />
      </section>

      <section className="ep-section">
        <div className="ep-categories">
          {categories.map(({ key, label }) =>
            config[key] ? (
              <CategoryPanel
                key={key}
                label={label}
                items={config[key]}
                onChange={(newItems) => updateCategory(key, newItems)}
              />
            ) : null
          )}
        </div>
      </section>

      <section className="ep-section">
        <h3 className="ep-section-label">Text overlay</h3>
        <input
          className="ep-overlay-input"
          value={overlay}
          onChange={(e) => setOverlay(e.target.value)}
          placeholder="Overlay text on the image…"
        />
      </section>
    </>
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

  function downloadPrompts() {
    const data = {
      image1: { config: img1Config, overlay: img1Overlay },
      image2: { config: img2Config, overlay: img2Overlay },
      image3: { config: img3Config, overlay: img3Overlay },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'carousel-prompts.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  const tabs = [
    { id: 'image1', label: 'Day 1' },
    { id: 'image2', label: 'Day 7' },
    { id: 'image3', label: 'Day 100' },
  ];

  return (
    <div className="ep-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ep-panel">
        <div className="ep-header">
          <h2 className="ep-title">Edit prompts</h2>
          <button className="ep-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="ep-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`ep-tab ${activeTab === tab.id ? 'ep-tab-active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="ep-body">
          {activeTab === 'image1' && (
            <ImageTab
              config={img1Config}
              setConfig={setImg1Config}
              overlay={img1Overlay}
              setOverlay={setImg1Overlay}
              categories={IMAGE1_CATEGORIES}
            />
          )}
          {activeTab === 'image2' && (
            <ImageTab
              config={img2Config}
              setConfig={setImg2Config}
              overlay={img2Overlay}
              setOverlay={setImg2Overlay}
              categories={IMAGE2_CATEGORIES}
            />
          )}
          {activeTab === 'image3' && (
            <ImageTab
              config={img3Config}
              setConfig={setImg3Config}
              overlay={img3Overlay}
              setOverlay={setImg3Overlay}
              categories={IMAGE3_CATEGORIES}
            />
          )}
        </div>

        <div className="ep-footer">
          <button className="ep-download-btn" onClick={downloadPrompts}>
            ↓ Download prompts
          </button>
          <button className="ep-done-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
