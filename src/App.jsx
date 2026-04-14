import { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import ImageGenCard from './components/ImageGenCard';
import SinglePhone from './components/SinglePhone';
import EditPromptsModal from './components/EditPromptsModal';
import { Button } from './components/ui/button';
import { generateEntrySuggestions } from './lib/entryGenApi';
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
  generateImage1Prompt,
  generateImage2Prompt,
  generateImage3Prompt,
} from './lib/promptGen';
import entriesLogo from './assets/entries-logo.png';
import './App.css';

const LS_IMG1_CONFIG = 'cf_img1Config';
const LS_IMG1_OVERLAY = 'cf_img1Overlay';
const LS_IMG2_CONFIG = 'cf_img2Config';
const LS_IMG2_OVERLAY = 'cf_img2Overlay';
const LS_IMG3_CONFIG = 'cf_img3Config';
const LS_IMG3_OVERLAY = 'cf_img3Overlay';

function loadFromStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    if (stored !== null) return JSON.parse(stored);
  } catch { /* corrupt data — use defaults */ }
  return typeof fallback === 'function' ? fallback() : fallback;
}

function dataUrlToBlob(dataUrl) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
}

async function urlToBlob(url) {
  if (url.startsWith('data:')) return dataUrlToBlob(url);
  const res = await fetch(url);
  return res.blob();
}

export default function App() {
  // ── Image 1 config (breakup / day 1) ─────────────────────────
  const [img1Config, setImg1Config] = useState(() =>
    loadFromStorage(LS_IMG1_CONFIG, () => ({
      staticStyle: DEFAULT_IMAGE1_STATIC_STYLE,
      subject: [...DEFAULT_IMAGE1_SUBJECT],
      hair: [...DEFAULT_IMAGE1_HAIR],
      outfit: [...DEFAULT_IMAGE1_OUTFIT],
      setting: [...DEFAULT_IMAGE1_SETTING],
      lighting: [...DEFAULT_IMAGE1_LIGHTING],
      camera: [...DEFAULT_IMAGE1_CAMERA],
      extras: [...DEFAULT_IMAGE1_EXTRAS],
    }))
  );
  const [img1Overlay, setImg1Overlay] = useState(() =>
    loadFromStorage(LS_IMG1_OVERLAY, DEFAULT_IMAGE1_OVERLAY)
  );

  // ── Image 2 config (slightly better / day 7) ─────────────────
  const [img2Config, setImg2Config] = useState(() =>
    loadFromStorage(LS_IMG2_CONFIG, () => ({
      staticStyle: DEFAULT_IMAGE2_STATIC_STYLE,
      setting: [...DEFAULT_IMAGE2_SETTING],
      mood: [...DEFAULT_IMAGE2_MOOD],
      outfit: [...DEFAULT_IMAGE2_OUTFIT],
      lighting: [...DEFAULT_IMAGE2_LIGHTING],
    }))
  );
  const [img2Overlay, setImg2Overlay] = useState(() =>
    loadFromStorage(LS_IMG2_OVERLAY, DEFAULT_IMAGE2_OVERLAY)
  );

  // ── Image 3 config (glow up / day 100) ───────────────────────
  const [img3Config, setImg3Config] = useState(() =>
    loadFromStorage(LS_IMG3_CONFIG, () => ({
      staticStyle: DEFAULT_IMAGE3_STATIC_STYLE,
      setting: [...DEFAULT_IMAGE3_SETTING],
      outfit: [...DEFAULT_IMAGE3_OUTFIT],
      mood: [...DEFAULT_IMAGE3_MOOD],
      lighting: [...DEFAULT_IMAGE3_LIGHTING],
    }))
  );
  const [img3Overlay, setImg3Overlay] = useState(() =>
    loadFromStorage(LS_IMG3_OVERLAY, DEFAULT_IMAGE3_OVERLAY)
  );

  // Persist to localStorage
  useEffect(() => { localStorage.setItem(LS_IMG1_CONFIG, JSON.stringify(img1Config)); }, [img1Config]);
  useEffect(() => { localStorage.setItem(LS_IMG1_OVERLAY, JSON.stringify(img1Overlay)); }, [img1Overlay]);
  useEffect(() => { localStorage.setItem(LS_IMG2_CONFIG, JSON.stringify(img2Config)); }, [img2Config]);
  useEffect(() => { localStorage.setItem(LS_IMG2_OVERLAY, JSON.stringify(img2Overlay)); }, [img2Overlay]);
  useEffect(() => { localStorage.setItem(LS_IMG3_CONFIG, JSON.stringify(img3Config)); }, [img3Config]);
  useEffect(() => { localStorage.setItem(LS_IMG3_OVERLAY, JSON.stringify(img3Overlay)); }, [img3Overlay]);

  const [editPromptsOpen, setEditPromptsOpen] = useState(false);
  const [editPromptsTab, setEditPromptsTab] = useState('image1');

  // ── Row 1 state ───────────────────────────────────────────────
  const [selectedImg1Url, setSelectedImg1Url] = useState(null);
  const [selectedImg1Index, setSelectedImg1Index] = useState(null);
  const [img1RowKey, setImg1RowKey] = useState(0);

  // ── Row 2 state ───────────────────────────────────────────────
  const [selectedImg2Url, setSelectedImg2Url] = useState(null);
  const [selectedImg2Index, setSelectedImg2Index] = useState(null);
  const [img2RowKey, setImg2RowKey] = useState(0);

  // ── Row 3 state ───────────────────────────────────────────────
  const [selectedImg3Url, setSelectedImg3Url] = useState(null);
  const [selectedImg3Index, setSelectedImg3Index] = useState(null);
  const [img3RowKey, setImg3RowKey] = useState(0);

  // ── Entry suggestions (triggered by row 3 selection) ─────────
  const [entrySuggestions, setEntrySuggestions] = useState(null);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState(null);

  // ── Entry phones ──────────────────────────────────────────────
  const [selectedEntryIndex, setSelectedEntryIndex] = useState(null);
  const phoneRefs = useRef([]);

  // ── Download ──────────────────────────────────────────────────
  const [downloading, setDownloading] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────

  function handleImg1Select(url, index) {
    setSelectedImg1Url(url);
    setSelectedImg1Index(index);
    // Reset downstream selections when row 1 changes
    setSelectedImg2Url(null);
    setSelectedImg2Index(null);
    setSelectedImg3Url(null);
    setSelectedImg3Index(null);
    setEntrySuggestions(null);
    setSuggestionsError(null);
    setIsSuggestionsLoading(false);
    setSelectedEntryIndex(null);
    // Bump row keys so rows 2 & 3 remount and regenerate with the new reference
    setImg2RowKey((k) => k + 1);
    setImg3RowKey((k) => k + 1);
  }

  function handleImg2Select(url, index) {
    setSelectedImg2Url(url);
    setSelectedImg2Index(index);
  }

  async function handleImg3Select(url, index) {
    setSelectedImg3Url(url);
    setSelectedImg3Index(index);
    setEntrySuggestions(null);
    setSuggestionsError(null);
    setSelectedEntryIndex(null);

    setIsSuggestionsLoading(true);
    try {
      const suggestions = await generateEntrySuggestions();
      setEntrySuggestions(suggestions);
    } catch (err) {
      setSuggestionsError(err.message || 'Could not generate entry suggestions.');
    } finally {
      setIsSuggestionsLoading(false);
    }
  }

  function openEditPrompts(tab) {
    setEditPromptsTab(tab);
    setEditPromptsOpen(true);
  }

  function regenerateRow1() {
    setImg1RowKey((k) => k + 1);
    setSelectedImg1Url(null);
    setSelectedImg1Index(null);
    setSelectedImg2Url(null);
    setSelectedImg2Index(null);
    setSelectedImg3Url(null);
    setSelectedImg3Index(null);
    setEntrySuggestions(null);
    setSuggestionsError(null);
    setIsSuggestionsLoading(false);
    setSelectedEntryIndex(null);
  }

  function regenerateRow2() {
    setImg2RowKey((k) => k + 1);
    setSelectedImg2Url(null);
    setSelectedImg2Index(null);
  }

  function regenerateRow3() {
    setImg3RowKey((k) => k + 1);
    setSelectedImg3Url(null);
    setSelectedImg3Index(null);
    setEntrySuggestions(null);
    setSuggestionsError(null);
    setIsSuggestionsLoading(false);
    setSelectedEntryIndex(null);
  }

  const canDownload = !!(
    selectedImg1Url &&
    selectedImg2Url &&
    selectedImg3Url &&
    selectedEntryIndex !== null
  );

  async function handleDownloadCarousel() {
    if (!canDownload || !phoneRefs.current[selectedEntryIndex]) return;
    setDownloading(true);
    try {
      const n = parseInt(localStorage.getItem('carousel_count') || '0') + 1;

      const phoneScreenshot = await phoneRefs.current[selectedEntryIndex].captureScreenshot();
      if (!phoneScreenshot) throw new Error('Could not capture entry screenshot');

      const zip = new JSZip();
      const folder = zip.folder(`Carousel ${n}`);

      folder.file('1-day1.png', await urlToBlob(selectedImg1Url));
      folder.file('2-day7.png', await urlToBlob(selectedImg2Url));
      folder.file('3-day100.png', await urlToBlob(selectedImg3Url));
      folder.file('4-entry.png', dataUrlToBlob(phoneScreenshot));

      const selectedEntry = entrySuggestions?.[selectedEntryIndex];
      const detailsLines = [
        `Slide 1 caption: ${img1Overlay}`,
        `Slide 2 caption: ${img2Overlay}`,
        `Slide 3 caption: ${img3Overlay}`,
        '',
        `Entry Title: ${selectedEntry?.title ?? ''}`,
        '',
        'Entry Body:',
        selectedEntry?.body ?? '',
      ];
      folder.file('details.txt', detailsLines.join('\n'));

      const content = await zip.generateAsync({ type: 'blob' });
      const blobUrl = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Carousel ${n}.zip`;
      link.click();
      URL.revokeObjectURL(blobUrl);

      localStorage.setItem('carousel_count', String(n));
    } catch (err) {
      console.error('Carousel download failed:', err);
    } finally {
      setDownloading(false);
    }
  }

  const steps = [
    { label: 'Day 1 selected', done: !!selectedImg1Url },
    { label: 'Day 7 selected', done: !!selectedImg2Url },
    { label: 'Day 100 selected', done: !!selectedImg3Url },
    { label: 'Entry selected', done: selectedEntryIndex !== null },
  ];

  return (
    <div className="min-h-screen bg-[#e8e5e0] flex flex-col">
      <header className="flex items-center justify-center py-8 flex-shrink-0">
        <img src={entriesLogo} alt="Entries" className="h-10 w-auto" />
      </header>

      <main className="flex flex-col gap-12 pb-16 px-8">

        {/* Row 1 — Day 1: breakup */}
        <section>
          <div className="row-header">
            <h2 className="row-label">
              Day 1
              <span className="row-label-hint">choose your character — rows 2 &amp; 3 will match her</span>
            </h2>
            <div className="row-header-actions">
              <button className="row-regen-btn" onClick={() => openEditPrompts('image1')}>
                ✎ Edit prompts
              </button>
              <button className="row-regen-btn" onClick={regenerateRow1}>
                ↺ Regenerate row
              </button>
            </div>
          </div>
          <div className="gen-row">
            {[0, 1, 2].map((i) => (
              <ImageGenCard
                key={`img1-${img1RowKey}-${i}`}
                isSelected={selectedImg1Index === i}
                onSelect={(url) => handleImg1Select(url, i)}
                promptConfig={img1Config}
                textOverlay={img1Overlay}
                promptGenerator={generateImage1Prompt}
              />
            ))}
          </div>
        </section>

        {/* Row 2 — Day 7: slightly better */}
        <section>
          <div className="row-header">
            <h2 className="row-label">
              Day 7
              <span className="row-label-hint">
                {selectedImg1Url
                  ? 'same woman, slightly better'
                  : 'select a Day 1 image first'}
              </span>
            </h2>
            {selectedImg1Url && (
              <div className="row-header-actions">
                <button className="row-regen-btn" onClick={() => openEditPrompts('image2')}>
                  ✎ Edit prompts
                </button>
                <button className="row-regen-btn" onClick={regenerateRow2}>
                  ↺ Regenerate row
                </button>
              </div>
            )}
          </div>
          {selectedImg1Url ? (
            <div className="gen-row">
              {[0, 1, 2].map((i) => (
                <ImageGenCard
                  key={`img2-${img2RowKey}-${selectedImg1Url.slice(-12)}-${i}`}
                  isSelected={selectedImg2Index === i}
                  onSelect={(url) => handleImg2Select(url, i)}
                  promptConfig={img2Config}
                  textOverlay={img2Overlay}
                  referenceImageUrl={selectedImg1Url}
                  promptGenerator={generateImage2Prompt}
                />
              ))}
            </div>
          ) : (
            <div className="gen-row-placeholder">
              Select a Day 1 image above to unlock this row
            </div>
          )}
        </section>

        {/* Row 3 — Day 100: glow up */}
        <section>
          <div className="row-header">
            <h2 className="row-label">
              Day 100
              <span className="row-label-hint">
                {selectedImg1Url
                  ? 'same woman, full glow up'
                  : 'select a Day 1 image first'}
              </span>
            </h2>
            {selectedImg1Url && (
              <div className="row-header-actions">
                <button className="row-regen-btn" onClick={() => openEditPrompts('image3')}>
                  ✎ Edit prompts
                </button>
                <button className="row-regen-btn" onClick={regenerateRow3}>
                  ↺ Regenerate row
                </button>
              </div>
            )}
          </div>
          {selectedImg1Url ? (
            <div className="gen-row">
              {[0, 1, 2].map((i) => (
                <ImageGenCard
                  key={`img3-${img3RowKey}-${selectedImg1Url.slice(-12)}-${i}`}
                  isSelected={selectedImg3Index === i}
                  onSelect={(url) => handleImg3Select(url, i)}
                  promptConfig={img3Config}
                  textOverlay={img3Overlay}
                  referenceImageUrl={selectedImg1Url}
                  promptGenerator={generateImage3Prompt}
                />
              ))}
            </div>
          ) : (
            <div className="gen-row-placeholder">
              Select a Day 1 image above to unlock this row
            </div>
          )}
        </section>

        {/* Row 4 — Entries */}
        <section>
          <div className="row-header">
            <h2 className="row-label">
              Entries
              {isSuggestionsLoading && (
                <span className="row-label-hint">generating entry ideas…</span>
              )}
              {!isSuggestionsLoading && entrySuggestions && (
                <span className="row-label-hint">click one to use in your carousel</span>
              )}
              {!isSuggestionsLoading && !entrySuggestions && !suggestionsError && (
                <span className="row-label-hint">select a Day 100 image to generate entries</span>
              )}
            </h2>
          </div>
          {suggestionsError && (
            <p className="text-sm text-red-500 mb-4 text-center">{suggestionsError}</p>
          )}
          <div className="gen-row">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`gen-card-wrapper${selectedEntryIndex === i ? ' gen-card-wrapper-selected' : ''}`}
                onClick={() => entrySuggestions?.[i] && setSelectedEntryIndex(i)}
              >
                <SinglePhone
                  ref={(el) => { phoneRefs.current[i] = el; }}
                  injectedPhoto={selectedImg3Url}
                  injectedTitle={entrySuggestions?.[i]?.title ?? null}
                  injectedBody={entrySuggestions?.[i]?.body ?? null}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Download carousel */}
        <section className="flex justify-center">
          <div className="carousel-download">
            <div className="carousel-steps">
              {steps.map((s) => (
                <span key={s.label} className={`carousel-step ${s.done ? 'carousel-step-done' : ''}`}>
                  <span className="carousel-step-dot">{s.done ? '✓' : '○'}</span>
                  {s.label}
                </span>
              ))}
            </div>
            <Button
              size="lg"
              onClick={handleDownloadCarousel}
              disabled={!canDownload || downloading}
              className="carousel-download-btn"
            >
              {downloading ? 'Creating carousel…' : '↓ Download Carousel'}
            </Button>
          </div>
        </section>
      </main>

      <EditPromptsModal
        open={editPromptsOpen}
        onClose={() => setEditPromptsOpen(false)}
        activeTab={editPromptsTab}
        onTabChange={setEditPromptsTab}
        img1Config={img1Config}
        setImg1Config={setImg1Config}
        img1Overlay={img1Overlay}
        setImg1Overlay={setImg1Overlay}
        img2Config={img2Config}
        setImg2Config={setImg2Config}
        img2Overlay={img2Overlay}
        setImg2Overlay={setImg2Overlay}
        img3Config={img3Config}
        setImg3Config={setImg3Config}
        img3Overlay={img3Overlay}
        setImg3Overlay={setImg3Overlay}
      />
    </div>
  );
}
